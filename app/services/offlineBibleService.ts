import * as SQLite from 'expo-sqlite';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import { API_BASE_URL } from './apiConfig';

const DB_NAME = 'wordflow_bible.db';
const fallbackSqliteDir = `${LegacyFileSystem.documentDirectory}SQLite/`;
const sqliteDefaultDir = (SQLite as any).defaultDatabaseDirectory || fallbackSqliteDir;
const SQLITE_DIR = sqliteDefaultDir.endsWith('/') ? sqliteDefaultDir : `${sqliteDefaultDir}/`;
const DB_PATH = `${SQLITE_DIR}${DB_NAME}`;
const TMP_DB_NAME = 'wordflow_bible_download.sqlite';
const TMP_DB_PATH = `${SQLITE_DIR}${TMP_DB_NAME}`;
const BACKUP_DB_NAME = 'wordflow_bible_backup.sqlite';
const BACKUP_DB_PATH = `${SQLITE_DIR}${BACKUP_DB_NAME}`;
const toFsUri = (path: string) => (path.startsWith('file://') ? path : `file://${path}`);

export interface SetupStep {
    id: string;
    label: string;
    status: 'pending' | 'loading' | 'completed' | 'error';
}

type DownloadStatus = 'idle' | 'downloading' | 'installing' | 'finalizing' | 'complete' | 'error';

export interface OfflineDownloadState {
    version: string;
    status: DownloadStatus;
    steps: SetupStep[];
    updatedAt: number;
    error?: string;
}

type DownloadListener = (state: OfflineDownloadState | null) => void;

let currentDownload: { version: string; promise: Promise<void>; state: OfflineDownloadState } | null = null;
const downloadListeners = new Set<DownloadListener>();
let dbInstance: SQLite.SQLiteDatabase | null = null;

const notifyDownloadListeners = () => {
    const state = currentDownload?.state ?? null;
    downloadListeners.forEach((listener) => listener(state));
};

const cloneSteps = (steps: SetupStep[]) => steps.map((s) => ({ ...s }));

const isCorruptDbError = (error: unknown) => {
    const message = (error as Error)?.message || '';
    return message.includes('not a database') || message.includes('file is not a database');
};

const deriveStatus = (steps: SetupStep[]): DownloadStatus => {
    if (steps.some((s) => s.status === 'error')) return 'error';
    if (steps.every((s) => s.status === 'completed')) return 'complete';
    const installingStep = steps.find((s) => s.id === 'process' && s.status === 'loading');
    if (installingStep) return 'installing';
    const finalizeStep = steps.find((s) => s.id === 'finalize' && s.status === 'loading');
    if (finalizeStep) return 'finalizing';
    return 'downloading';
};

export const offlineBibleService = {
    subscribeDownload(listener: DownloadListener) {
        downloadListeners.add(listener);
        listener(currentDownload?.state ?? null);
        return () => downloadListeners.delete(listener);
    },

    getDownloadState() {
        return currentDownload?.state ?? null;
    },

    async startDownload(version: string, onProgress?: (steps: SetupStep[]) => void) {
        if (currentDownload && currentDownload.state.status !== 'complete' && currentDownload.state.status !== 'error') {
            if (currentDownload.version === version) {
                return currentDownload.promise;
            }
            throw new Error('Another offline download is already in progress.');
        }

        const initialSteps: SetupStep[] = [
            { id: 'db', label: 'Setting up local database', status: 'loading' },
            { id: 'download', label: 'Downloading Bible File', status: 'pending' },
            { id: 'process', label: 'Installing Bible File...', status: 'pending' },
            { id: 'finalize', label: 'Finalizing...', status: 'pending' },
        ];

        const state: OfflineDownloadState = {
            version,
            status: 'downloading',
            steps: cloneSteps(initialSteps),
            updatedAt: Date.now(),
        };

        const updateState = (steps: SetupStep[], error?: string) => {
            state.steps = cloneSteps(steps);
            state.status = deriveStatus(steps);
            state.updatedAt = Date.now();
            state.error = error;
            notifyDownloadListeners();
            if (onProgress) onProgress(steps);
        };

        const promise = this.downloadAndInstall(version, updateState)
            .then(() => {
                updateState(state.steps);
            })
            .catch((err) => {
                updateState(state.steps, err?.message || 'Download failed');
                throw err;
            });

        currentDownload = { version, promise, state };
        notifyDownloadListeners();

        return promise;
    },

    async getDb() {
        if (!dbInstance) {
            dbInstance = await SQLite.openDatabaseAsync(DB_NAME, undefined, SQLITE_DIR);
        }
        return dbInstance;
    },

    async closeDb() {
        if (!dbInstance) return;
        try {
            await dbInstance.closeAsync();
        } catch (e) {
            console.error('closeDb error:', e);
        } finally {
            dbInstance = null;
        }
    },

    async initDb() {
        const db = await this.getDb();
        try {
            await db.execAsync(`
                PRAGMA journal_mode = WAL;
                CREATE TABLE IF NOT EXISTS verses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    version TEXT,
                    book TEXT,
                    chapter INTEGER,
                    verse INTEGER,
                    text TEXT
                );
                CREATE INDEX IF NOT EXISTS idx_verses_lookup ON verses(version, book, chapter);
                CREATE UNIQUE INDEX IF NOT EXISTS idx_verses_unique ON verses(version, book, chapter, verse);
                CREATE TABLE IF NOT EXISTS offline_versions (
                    version TEXT PRIMARY KEY,
                    status TEXT,
                    verse_count INTEGER DEFAULT 0,
                    updated_at INTEGER
                );
            `);
        } catch (error) {
            if (isCorruptDbError(error)) {
                console.error('Offline DB corrupt, resetting:', error);
                await this.closeDb();
                try {
                    await SQLite.deleteDatabaseAsync(DB_NAME, SQLITE_DIR);
                } catch {
                    await LegacyFileSystem.deleteAsync(toFsUri(DB_PATH), { idempotent: true });
                }
                const freshDb = await this.getDb();
                await freshDb.execAsync(`
                    PRAGMA journal_mode = WAL;
                    CREATE TABLE IF NOT EXISTS verses (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        version TEXT,
                        book TEXT,
                        chapter INTEGER,
                        verse INTEGER,
                        text TEXT
                    );
                    CREATE INDEX IF NOT EXISTS idx_verses_lookup ON verses(version, book, chapter);
                    CREATE UNIQUE INDEX IF NOT EXISTS idx_verses_unique ON verses(version, book, chapter, verse);
                    CREATE TABLE IF NOT EXISTS offline_versions (
                        version TEXT PRIMARY KEY,
                        status TEXT,
                        verse_count INTEGER DEFAULT 0,
                        updated_at INTEGER
                    );
                `);
            } else {
                throw error;
            }
        }
    },

    async isBibleDownloaded(version: string): Promise<boolean> {
        await this.initDb();
        const db = await this.getDb();
        try {
            const statusRow = await db.getFirstAsync<{ status: string; verse_count: number }>(
                'SELECT status, verse_count FROM offline_versions WHERE version = ? LIMIT 1',
                [version]
            );
            if (statusRow?.status === 'complete' && (statusRow.verse_count || 0) > 0) return true;
            if (statusRow?.status === 'downloading' && (statusRow.verse_count || 0) > 0) return true;
            if (statusRow?.status === 'downloading' || statusRow?.status === 'error') return false;

            const existsRow = await db.getFirstAsync<{ has_version: number }>(
                'SELECT 1 as has_version FROM verses WHERE version = ? LIMIT 1',
                [version]
            );
            if (existsRow?.has_version) {
                const countRow = await db.getFirstAsync<{ count: number }>(
                    'SELECT COUNT(*) as count FROM verses WHERE version = ?',
                    [version]
                );
                await this.setVersionStatus(version, 'complete', countRow?.count || 0);
                return true;
            }
            return false;
        } catch (e) {
            console.error('isBibleDownloaded error:', e);
            if (isCorruptDbError(e)) {
                try {
                    await this.closeDb();
                    try {
                        await SQLite.deleteDatabaseAsync(DB_NAME, SQLITE_DIR);
                    } catch {
                        await LegacyFileSystem.deleteAsync(toFsUri(DB_PATH), { idempotent: true });
                    }
                } catch (resetErr) {
                    console.error('Offline DB reset failed:', resetErr);
                }
            }
            return false;
        }
    },

    async setVersionStatus(version: string, status: 'downloading' | 'complete' | 'error', verseCount = 0) {
        const db = await this.getDb();
        await db.runAsync(
            'INSERT OR REPLACE INTO offline_versions (version, status, verse_count, updated_at) VALUES (?, ?, ?, ?)',
            [version, status, verseCount, Date.now()]
        );
    },

    async clearVersionData(version: string) {
        const db = await this.getDb();
        await db.runAsync('DELETE FROM verses WHERE version = ?', [version]);
    },

    async downloadAndInstall(version: string, onProgress: (steps: SetupStep[]) => void) {
        let steps: SetupStep[] = [
            { id: 'db', label: 'Setting up local database', status: 'loading' },
            { id: 'download', label: 'Downloading Bible File', status: 'pending' },
            { id: 'process', label: 'Installing Bible File...', status: 'pending' },
            { id: 'finalize', label: 'Finalizing...', status: 'pending' },
        ];

        try {
            onProgress([...steps]);

            // 1. Init DB
            await this.initDb();
            const db = await this.getDb();
            const existingCountRow = await db.getFirstAsync<{ count: number }>(
                'SELECT COUNT(*) as count FROM verses WHERE version = ? LIMIT 1',
                [version]
            );
            const existingCount = existingCountRow?.count || 0;
            await this.setVersionStatus(version, 'downloading', existingCount);
            steps[0].status = 'completed';
            steps[1].status = 'loading';
            onProgress([...steps]);

            // 2. Download prebuilt SQLite file from server
            await LegacyFileSystem.makeDirectoryAsync(toFsUri(SQLITE_DIR), { intermediates: true });
            const downloadUrl = `${API_BASE_URL}bible/offline?version=${encodeURIComponent(version)}`;
            const downloadResumable = LegacyFileSystem.createDownloadResumable(
                downloadUrl,
                toFsUri(TMP_DB_PATH),
                {},
                (progress) => {
                    const total = progress.totalBytesExpectedToWrite || 0;
                    const written = progress.totalBytesWritten || 0;
                    if (total > 0) {
                        const percent = Math.round((written / total) * 100);
                        steps[1].label = `Downloading Bible File (${percent}%)`;
                        onProgress([...steps]);
                    }
                }
            );

            const downloadResult = await downloadResumable.downloadAsync();
            if (!downloadResult?.uri) {
                throw new Error('Download failed');
            }
            if (downloadResult.status && downloadResult.status !== 200) {
                await LegacyFileSystem.deleteAsync(toFsUri(TMP_DB_PATH), { idempotent: true });
                throw new Error(`Download failed with status ${downloadResult.status}`);
            }

            steps[1].status = 'completed';
            steps[2].status = 'loading';
            onProgress([...steps]);

            // 3. Replace local DB with downloaded file (download completes before replacement)
            const existingInfo = await LegacyFileSystem.getInfoAsync(toFsUri(DB_PATH));
            if (existingInfo.exists) {
                await LegacyFileSystem.copyAsync({ from: toFsUri(DB_PATH), to: toFsUri(BACKUP_DB_PATH) });
            }

            try {
                await this.closeDb();
                await SQLite.deleteDatabaseAsync(DB_NAME, SQLITE_DIR);
            } catch (e) {
                try {
                    await LegacyFileSystem.deleteAsync(toFsUri(DB_PATH), { idempotent: true });
                } catch (deleteErr) {
                    console.error('Offline DB delete failed:', deleteErr);
                }
            }

            await LegacyFileSystem.copyAsync({ from: downloadResult.uri, to: toFsUri(DB_PATH) });
            await LegacyFileSystem.deleteAsync(toFsUri(TMP_DB_PATH), { idempotent: true });

            // 4. Validate downloaded DB
            try {
                const validateDb = await this.getDb();
                await validateDb.execAsync('PRAGMA schema_version;');
            } catch (validationErr) {
                if (isCorruptDbError(validationErr)) {
                    const backupInfo = await LegacyFileSystem.getInfoAsync(toFsUri(BACKUP_DB_PATH));
                    if (backupInfo.exists) {
                        await LegacyFileSystem.copyAsync({ from: toFsUri(BACKUP_DB_PATH), to: toFsUri(DB_PATH) });
                    }
                }
                throw validationErr;
            }

            // 5. Ensure metadata exists and mark version complete
            await this.initDb();
            const dbFinal = await this.getDb();
            const countRow = await dbFinal.getFirstAsync<{ count: number }>(
                'SELECT COUNT(*) as count FROM verses WHERE version = ? LIMIT 1',
                [version]
            );
            const verseCount = countRow?.count || 0;

            steps[2].status = 'completed';
            steps[2].label = 'Bible File Installed';
            steps[3].status = 'loading';
            onProgress([...steps]);

            await this.setVersionStatus(version, 'complete', verseCount);
            steps[3].status = 'completed';
            onProgress([...steps]);

        } catch (error) {
            console.error('Offline Setup Error:', error);
            const activeIndex = steps.findIndex(s => s.status === 'loading');
            if (activeIndex !== -1) steps[activeIndex].status = 'error';
            onProgress([...steps]);
            try {
                await LegacyFileSystem.deleteAsync(toFsUri(TMP_DB_PATH), { idempotent: true });
                await this.setVersionStatus(version, 'error', 0);
            } catch (cleanupErr) {
                console.error('Offline cleanup error:', cleanupErr);
            }
            throw error;
        }
    },

    async getChapter(version: string, book: string, chapter: number) {
        try {
            const db = await this.getDb();
            const rows = await db.getAllAsync<{ verse: number; text: string }>(
                'SELECT verse, text FROM verses WHERE version = ? AND book = ? AND chapter = ? ORDER BY verse ASC',
                [version, book, chapter]
            );

            if (rows.length === 0) return null;

            const verses: Record<string, string> = {};
            rows.forEach(row => {
                verses[row.verse.toString()] = row.text;
            });

            return {
                version,
                book,
                chapter: chapter.toString(),
                verses
            };
        } catch (e) {
            console.error('getChapter offline failed:', e);
            return null;
        }
    },

    async getBooks(version: string) {
        try {
            const db = await this.getDb();
            const rows = await db.getAllAsync<{ book: string; chapters: number }>(
                'SELECT book, MAX(chapter) as chapters FROM verses WHERE version = ? GROUP BY book',
                [version]
            );
            return rows.map(r => ({ name: r.book, chapters: r.chapters }));
        } catch (e) {
            console.error('getBooks offline failed:', e);
            return [];
        }
    }
};
