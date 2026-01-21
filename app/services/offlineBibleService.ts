import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { API_BASE_URL } from './apiConfig';

const DB_NAME = 'wordflow_bible.db';

export interface SetupStep {
    id: string;
    label: string;
    status: 'pending' | 'loading' | 'completed' | 'error';
}

export const offlineBibleService = {
    async getDb() {
        return await SQLite.openDatabaseAsync(DB_NAME);
    },

    async initDb() {
        const db = await this.getDb();
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
        `);
    },

    async isBibleDownloaded(version: string): Promise<boolean> {
        const db = await this.getDb();
        const first = await db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM verses WHERE version = ? LIMIT 1',
            [version]
        );
        return (first?.count || 0) > 0;
    },

    async downloadAndInstall(version: string, onProgress: (steps: SetupStep[]) => void) {
        let steps: SetupStep[] = [
            { id: 'db', label: 'Setting up local database', status: 'loading' },
            { id: 'download', label: 'Downloading Bible Content', status: 'pending' },
            { id: 'process', label: 'Installing Verses...', status: 'pending' },
            { id: 'finalize', label: 'Finalizing...', status: 'pending' },
        ];

        try {
            onProgress([...steps]);

            // 1. Init DB
            await this.initDb();
            steps[0].status = 'completed';
            steps[1].status = 'loading';
            onProgress([...steps]);

            // 2. Download JSON from Server
            // Assuming the server has a way to serve the full JSON. 
            // We'll use the existing books/chapter endpoints to build it if needed, 
            // but for offline we really want a single fetch.
            // Let's assume we can fetch the full version JSON.
            // In a real app, you might download a pre-built SQLite file.
            const response = await fetch(`${API_BASE_URL}bible/books?version=${encodeURIComponent(version)}`);
            if (!response.ok) throw new Error('Failed to fetch books list');
            const books = await response.json() as { name: string; chapters: number }[];

            steps[1].status = 'completed';
            steps[2].status = 'loading';
            onProgress([...steps]);

            const db = await this.getDb();

            // For each book, fetch all chapters and insert
            // This is a simplified version. In production, a single zip/sqlite download is better.
            for (let i = 0; i < books.length; i++) {
                const book = books[i];
                const progress = Math.round(((i + 1) / books.length) * 100);
                steps[2].label = `Installing ${book.name} (${progress}%)`;
                onProgress([...steps]);

                // Batch insert logic
                await db.withTransactionAsync(async () => {
                    for (let ch = 1; ch <= book.chapters; ch++) {
                        const chResp = await fetch(`${API_BASE_URL}bible/chapter?version=${encodeURIComponent(version)}&book=${encodeURIComponent(book.name)}&chapter=${ch}`);
                        if (!chResp.ok) continue;
                        const chData = await chResp.json();

                        const verses = chData.verses;
                        for (const [vNum, vText] of Object.entries(verses)) {
                            await db.runAsync(
                                'INSERT INTO verses (version, book, chapter, verse, text) VALUES (?, ?, ?, ?, ?)',
                                [version, book.name, ch, parseInt(vNum), vText as string]
                            );
                        }
                    }
                });
            }

            steps[2].status = 'completed';
            steps[2].label = 'All Verses Installed';
            steps[3].status = 'loading';
            onProgress([...steps]);

            steps[3].status = 'completed';
            onProgress([...steps]);

        } catch (error) {
            console.error('Offline Setup Error:', error);
            const activeIndex = steps.findIndex(s => s.status === 'loading');
            if (activeIndex !== -1) steps[activeIndex].status = 'error';
            onProgress([...steps]);
            throw error;
        }
    },

    async getChapter(version: string, book: string, chapter: number) {
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
    },

    async getBooks(version: string) {
        const db = await this.getDb();
        const rows = await db.getAllAsync<{ book: string; chapters: number }>(
            'SELECT book, MAX(chapter) as chapters FROM verses WHERE version = ? GROUP BY book',
            [version]
        );
        return rows.map(r => ({ name: r.book, chapters: r.chapters }));
    }
};
