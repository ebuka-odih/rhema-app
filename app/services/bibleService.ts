import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './apiConfig';

export interface BibleBook {
    name: string;
    chapters: number;
}

export interface BibleVersion {
    id: string;
    name: string;
    short_name: string;
}

export interface BibleChapter {
    version: string;
    book: string;
    chapter: string;
    verses: Record<string, string>;
}

interface BibleBookmarkRecord {
    id?: string;
    user_id?: string;
    version_id: string;
    book: string;
    chapter: number;
    verse: number;
    text?: string;
    created_at?: string;
}

interface PendingBookmarkOperation {
    action: 'save' | 'remove';
    bookmark: BibleBookmarkRecord;
}

// Cache keys
const CACHE_KEYS = {
    VERSIONS: 'bible_versions_cache',
    BOOKS: (version: string) => `bible_books_cache_${version}`,
    CHAPTER: (version: string, book: string, chapter: number) => `bible_chapter_cache_${version}_${book}_${chapter}`,
    BOOKMARKS: 'bible_bookmarks_cache',
    BOOKMARK_PENDING_OPS: 'bible_bookmarks_pending_ops',
};

// In-memory cache for ultra-fast access
let versionsCache: BibleVersion[] | null = null;
const booksCache: Record<string, BibleBook[]> = {};
const chapterCache: Record<string, BibleChapter> = {};
let bookmarksCache: BibleBookmarkRecord[] | null = null;
let pendingBookmarkOpsCache: PendingBookmarkOperation[] | null = null;

const toNumber = (value: unknown): number => {
    if (typeof value === 'number') return value;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const bookmarkKey = (bookmark: { book: string; chapter: number; verse: number }) =>
    `${bookmark.book}:${bookmark.chapter}:${bookmark.verse}`;

const normalizeBookmark = (bookmark: any): BibleBookmarkRecord => {
    const chapter = toNumber(bookmark?.chapter);
    const verse = toNumber(bookmark?.verse);
    const versionId = typeof bookmark?.version_id === 'string' ? bookmark.version_id : '';
    const book = typeof bookmark?.book === 'string' ? bookmark.book : '';
    const localId = `local:${versionId}:${book}:${chapter}:${verse}`;

    return {
        id: bookmark?.id ? String(bookmark.id) : localId,
        user_id: typeof bookmark?.user_id === 'string' ? bookmark.user_id : undefined,
        version_id: versionId,
        book,
        chapter,
        verse,
        text: typeof bookmark?.text === 'string' ? bookmark.text : '',
        created_at: typeof bookmark?.created_at === 'string' ? bookmark.created_at : undefined,
    };
};

const normalizeBookmarkList = (bookmarks: any[]): BibleBookmarkRecord[] => {
    const map = new Map<string, BibleBookmarkRecord>();

    for (const rawBookmark of bookmarks) {
        const normalized = normalizeBookmark(rawBookmark);
        map.set(bookmarkKey(normalized), normalized);
    }

    return Array.from(map.values()).sort((a, b) => {
        if (a.created_at && b.created_at) return b.created_at.localeCompare(a.created_at);
        if (a.created_at) return -1;
        if (b.created_at) return 1;
        return bookmarkKey(a).localeCompare(bookmarkKey(b));
    });
};

const normalizePendingBookmarkOps = (operations: any[]): PendingBookmarkOperation[] => {
    const normalized: PendingBookmarkOperation[] = [];

    for (const op of operations) {
        if (op?.action !== 'save' && op?.action !== 'remove') continue;
        if (!op?.bookmark || typeof op.bookmark !== 'object') continue;

        normalized.push({
            action: op.action,
            bookmark: normalizeBookmark(op.bookmark),
        });
    }

    return normalized;
};

const readBookmarksCache = async (): Promise<BibleBookmarkRecord[]> => {
    if (bookmarksCache) return bookmarksCache;

    try {
        const stored = await AsyncStorage.getItem(CACHE_KEYS.BOOKMARKS);
        if (!stored) {
            bookmarksCache = [];
            return [];
        }

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            bookmarksCache = [];
            return [];
        }

        bookmarksCache = normalizeBookmarkList(parsed);
        return bookmarksCache;
    } catch (error) {
        console.error('Error reading bookmarks cache:', error);
        bookmarksCache = [];
        return [];
    }
};

const writeBookmarksCache = async (bookmarks: BibleBookmarkRecord[]): Promise<BibleBookmarkRecord[]> => {
    const normalized = normalizeBookmarkList(bookmarks);
    bookmarksCache = normalized;

    try {
        await AsyncStorage.setItem(CACHE_KEYS.BOOKMARKS, JSON.stringify(normalized));
    } catch (error) {
        console.error('Error writing bookmarks cache:', error);
    }

    return normalized;
};

const readPendingBookmarkOps = async (): Promise<PendingBookmarkOperation[]> => {
    if (pendingBookmarkOpsCache) return pendingBookmarkOpsCache;

    try {
        const stored = await AsyncStorage.getItem(CACHE_KEYS.BOOKMARK_PENDING_OPS);
        if (!stored) {
            pendingBookmarkOpsCache = [];
            return [];
        }

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            pendingBookmarkOpsCache = [];
            return [];
        }

        pendingBookmarkOpsCache = normalizePendingBookmarkOps(parsed);
        return pendingBookmarkOpsCache;
    } catch (error) {
        console.error('Error reading pending bookmark operations:', error);
        pendingBookmarkOpsCache = [];
        return [];
    }
};

const writePendingBookmarkOps = async (operations: PendingBookmarkOperation[]): Promise<PendingBookmarkOperation[]> => {
    const normalized = normalizePendingBookmarkOps(operations);
    pendingBookmarkOpsCache = normalized;

    try {
        await AsyncStorage.setItem(CACHE_KEYS.BOOKMARK_PENDING_OPS, JSON.stringify(normalized));
    } catch (error) {
        console.error('Error writing pending bookmark operations:', error);
    }

    return normalized;
};

const queuePendingBookmarkOperation = async (operation: PendingBookmarkOperation) => {
    const pending = await readPendingBookmarkOps();
    const opKey = bookmarkKey(operation.bookmark);
    const filtered = pending.filter((item) => bookmarkKey(item.bookmark) !== opKey);
    await writePendingBookmarkOps([...filtered, operation]);
};

const clearPendingBookmarkOperation = async (bookmark: { book: string; chapter: number; verse: number }) => {
    const pending = await readPendingBookmarkOps();
    const opKey = bookmarkKey(bookmark);
    await writePendingBookmarkOps(pending.filter((item) => bookmarkKey(item.bookmark) !== opKey));
};

const syncPendingBookmarkOperations = async () => {
    const pending = await readPendingBookmarkOps();
    if (pending.length === 0) return;

    const { authService } = await import('./auth');
    const token = await authService.getToken();
    if (!token) return;

    const remaining: PendingBookmarkOperation[] = [];

    for (let i = 0; i < pending.length; i += 1) {
        const op = pending[i];
        try {
            if (op.action === 'save') {
                const response = await fetch(`${API_BASE_URL}bible/bookmarks`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        version_id: op.bookmark.version_id,
                        book: op.bookmark.book,
                        chapter: op.bookmark.chapter,
                        verse: op.bookmark.verse,
                        text: op.bookmark.text || '',
                    }),
                });

                if (!response.ok) throw new Error(`Failed to sync bookmark save (${response.status})`);

                const saved = normalizeBookmark(await response.json());
                const currentBookmarks = await readBookmarksCache();
                await writeBookmarksCache(upsertBookmarkInList(currentBookmarks, saved));
            } else {
                const response = await fetch(`${API_BASE_URL}bible/bookmarks/remove`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        version_id: op.bookmark.version_id,
                        book: op.bookmark.book,
                        chapter: op.bookmark.chapter,
                        verse: op.bookmark.verse,
                    }),
                });

                if (!response.ok) throw new Error(`Failed to sync bookmark remove (${response.status})`);

                const currentBookmarks = await readBookmarksCache();
                await writeBookmarksCache(
                    removeBookmarkFromList(currentBookmarks, op.bookmark.book, op.bookmark.chapter, op.bookmark.verse)
                );
            }
        } catch (error) {
            console.error('Failed to sync pending bookmark operation:', error);
            remaining.push(...pending.slice(i));
            break;
        }
    }

    await writePendingBookmarkOps(remaining);
};

const upsertBookmarkInList = (bookmarks: BibleBookmarkRecord[], bookmark: BibleBookmarkRecord): BibleBookmarkRecord[] => {
    const key = bookmarkKey(bookmark);
    const filtered = bookmarks.filter((item) => bookmarkKey(item) !== key);
    return [...filtered, bookmark];
};

const removeBookmarkFromList = (bookmarks: BibleBookmarkRecord[], book: string, chapter: number, verse: number): BibleBookmarkRecord[] => {
    const key = bookmarkKey({ book, chapter, verse });
    return bookmarks.filter((item) => bookmarkKey(item) !== key);
};

const getBookmarksForChapterFromList = (bookmarks: BibleBookmarkRecord[], book: string, chapter: number): BibleBookmarkRecord[] => {
    return bookmarks.filter((item) => item.book === book && item.chapter === chapter);
};

export const bibleService = {
    // Synchronous checks for memory cache
    getChapterSync(version: string, book: string, chapter: number): BibleChapter | null {
        const key = CACHE_KEYS.CHAPTER(version, book, chapter);
        return chapterCache[key] || null;
    },

    getVersionsSync(): BibleVersion[] | null {
        return versionsCache;
    },

    getBooksSync(version: string): BibleBook[] | null {
        return booksCache[version] || null;
    },

    async getVersions(): Promise<BibleVersion[]> {
        if (versionsCache) return versionsCache;

        // Try persistent storage
        try {
            const stored = await AsyncStorage.getItem(CACHE_KEYS.VERSIONS);
            if (stored) {
                versionsCache = JSON.parse(stored);
                // Background fetch to update cache
                this.refreshVersions();
                return versionsCache || [];
            }
        } catch (e) {
            console.error('Error reading versions from storage:', e);
        }

        return this.refreshVersions();
    },

    async refreshVersions(): Promise<BibleVersion[]> {
        try {
            const response = await fetch(`${API_BASE_URL}bible/versions`, {
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error('Failed to fetch versions');

            const data = await response.json();
            versionsCache = data;
            await AsyncStorage.setItem(CACHE_KEYS.VERSIONS, JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error refreshing Bible versions:', error);
            return versionsCache || [];
        }
    },

    async getBooks(version: string): Promise<BibleBook[]> {
        // Try Offline SQLITE first
        try {
            const { offlineBibleService } = await import('./offlineBibleService');
            const isInstalled = await offlineBibleService.isBibleDownloaded(version);
            if (isInstalled) {
                return await offlineBibleService.getBooks(version);
            }
        } catch (e) {
            console.error('Offline books check failed:', e);
        }

        if (booksCache[version]) return booksCache[version];

        // Try persistent storage
        try {
            const stored = await AsyncStorage.getItem(CACHE_KEYS.BOOKS(version));
            if (stored) {
                booksCache[version] = JSON.parse(stored);
                // Background update
                this.refreshBooks(version);
                return booksCache[version];
            }
        } catch (e) {
            console.error('Error reading books from storage:', e);
        }

        return this.refreshBooks(version);
    },

    async refreshBooks(version: string): Promise<BibleBook[]> {
        try {
            const response = await fetch(`${API_BASE_URL}bible/books?version=${encodeURIComponent(version)}`, {
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error('Failed to fetch books');

            const data = await response.json();
            booksCache[version] = data;
            await AsyncStorage.setItem(CACHE_KEYS.BOOKS(version), JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error refreshing Bible books:', error);
            return booksCache[version] || [];
        }
    },

    async getChapter(version: string, book: string, chapter: number): Promise<BibleChapter | null> {
        // Try Offline SQLITE first
        try {
            const { offlineBibleService } = await import('./offlineBibleService');
            const isInstalled = await offlineBibleService.isBibleDownloaded(version);
            if (isInstalled) {
                const data = await offlineBibleService.getChapter(version, book, chapter);
                if (data) return data as BibleChapter;
            }
        } catch (e) {
            console.error('Offline chapter check failed:', e);
        }

        const key = CACHE_KEYS.CHAPTER(version, book, chapter);
        if (chapterCache[key]) return chapterCache[key];

        // Try persistent storage
        try {
            const stored = await AsyncStorage.getItem(key);
            if (stored) {
                const data = JSON.parse(stored);
                chapterCache[key] = data;
                return data;
            }
        } catch (e) {
            console.error('Error reading chapter from storage:', e);
        }

        // Fetch from network if not in cache
        try {
            const response = await fetch(
                `${API_BASE_URL}bible/chapter?version=${encodeURIComponent(version)}&book=${encodeURIComponent(book)}&chapter=${chapter}`,
                { headers: { 'Accept': 'application/json' } }
            );
            if (!response.ok) throw new Error('Failed to fetch chapter');

            const data = await response.json();
            chapterCache[key] = data;
            await AsyncStorage.setItem(key, JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error fetching Bible chapter:', error);
            return null;
        }
    },

    async setupOffline(version: string, onProgress: (steps: any[]) => void) {
        const { offlineBibleService } = await import('./offlineBibleService');
        await offlineBibleService.downloadAndInstall(version, onProgress);
    },

    async getDailyVerse(dateOverride?: string) {
        const cacheKey = 'bible_daily_verse_cache';
        try {
            const { authService } = await import('./auth');
            const token = await authService.getToken();
            const headers: Record<string, string> = { 'Accept': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            // Get local date in YYYY-MM-DD format to ensure server respects user's timezone
            let localDate = dateOverride;

            if (!localDate) {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                localDate = `${year}-${month}-${day}`;
            }

            const response = await fetch(`${API_BASE_URL}bible/daily-verse?date=${localDate}`, { headers });

            if (!response.ok) {
                const text = await response.text();
                console.error(`Daily Verse fetch failed. Status: ${response.status}, Body: ${text.substring(0, 100)}`);
                throw new Error('Failed to fetch daily verse');
            }

            const data = await response.json();
            await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error fetching Daily Verse:', error);
            const cached = await AsyncStorage.getItem(cacheKey);
            return cached ? JSON.parse(cached) : null;
        }
    },

    async getAffirmation(dateOverride?: string) {
        const cacheKey = 'bible_affirmation_cache';
        try {
            const { authService } = await import('./auth');
            const token = await authService.getToken();
            const headers: Record<string, string> = { 'Accept': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            // Get local date in YYYY-MM-DD format
            let localDate = dateOverride;

            if (!localDate) {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                localDate = `${year}-${month}-${day}`;
            }

            const response = await fetch(`${API_BASE_URL}bible/affirmation?date=${localDate}`, { headers });

            if (!response.ok) {
                const text = await response.text();
                console.error(`Affirmation fetch failed. Status: ${response.status}, Body: ${text.substring(0, 100)}`);
                throw new Error('Failed to fetch affirmation');
            }

            const data = await response.json();
            await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error fetching Affirmation:', error);
            const cached = await AsyncStorage.getItem(cacheKey);
            return cached ? JSON.parse(cached) : null;
        }
    },

    // Highlights
    async saveHighlight(highlight: { version_id: string; book: string; chapter: number; verse: number; color: string; note?: string }) {
        try {
            const { authService } = await import('./auth');
            const token = await authService.getToken();
            const response = await fetch(`${API_BASE_URL}bible/highlights`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(highlight),
            });
            if (!response.ok) throw new Error('Failed to save highlight');
            return await response.json();
        } catch (err) {
            console.error('saveHighlight error:', err);
            return null;
        }
    },

    async removeHighlight(version_id: string, book: string, chapter: number, verse: number) {
        try {
            const { authService } = await import('./auth');
            const token = await authService.getToken();
            const response = await fetch(`${API_BASE_URL}bible/highlights/remove`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ version_id, book, chapter, verse }),
            });
            if (!response.ok) throw new Error('Failed to remove highlight');
            return await response.json();
        } catch (err) {
            console.error('removeHighlight error:', err);
            return null;
        }
    },

    async getHighlightsForChapter(version_id: string, book: string, chapter: number) {
        try {
            const { authService } = await import('./auth');
            const token = await authService.getToken();
            const response = await fetch(
                `${API_BASE_URL}bible/highlights/chapter?version_id=${encodeURIComponent(version_id)}&book=${encodeURIComponent(book)}&chapter=${chapter}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    }
                }
            );
            if (!response.ok) throw new Error('Failed to fetch highlights');
            return await response.json();
        } catch (err) {
            console.error('getHighlightsForChapter error:', err);
            return [];
        }
    },

    // Bookmarks
    async getBookmarks() {
        const cachedBookmarks = await readBookmarksCache();

        try {
            await syncPendingBookmarkOperations();
            const { authService } = await import('./auth');
            const token = await authService.getToken();
            const response = await fetch(`${API_BASE_URL}bible/bookmarks`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });
            if (!response.ok) throw new Error('Failed to fetch bookmarks');

            const data = await response.json();
            return await writeBookmarksCache(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('getBookmarks error:', err);
            return cachedBookmarks;
        }
    },

    async saveBookmark(bookmark: { version_id: string; book: string; chapter: number; verse: number; text?: string }) {
        const localBookmark = normalizeBookmark({
            ...bookmark,
            created_at: new Date().toISOString(),
        });

        const currentBookmarks = await readBookmarksCache();
        await writeBookmarksCache(upsertBookmarkInList(currentBookmarks, localBookmark));

        try {
            const { authService } = await import('./auth');
            const token = await authService.getToken();
            const response = await fetch(`${API_BASE_URL}bible/bookmarks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookmark),
            });
            if (!response.ok) throw new Error('Failed to save bookmark');

            const data = await response.json();
            const savedBookmark = normalizeBookmark(data);
            const refreshedBookmarks = await readBookmarksCache();
            await writeBookmarksCache(upsertBookmarkInList(refreshedBookmarks, savedBookmark));
            await clearPendingBookmarkOperation(savedBookmark);
            return savedBookmark;
        } catch (err) {
            console.error('saveBookmark error:', err);
            await queuePendingBookmarkOperation({ action: 'save', bookmark: localBookmark });
            return localBookmark;
        }
    },

    async removeBookmark(version_id: string, book: string, chapter: number, verse: number) {
        const currentBookmarks = await readBookmarksCache();
        await writeBookmarksCache(removeBookmarkFromList(currentBookmarks, book, chapter, verse));

        try {
            const { authService } = await import('./auth');
            const token = await authService.getToken();
            const response = await fetch(`${API_BASE_URL}bible/bookmarks/remove`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ version_id, book, chapter, verse }),
            });
            if (!response.ok) throw new Error('Failed to remove bookmark');
            await clearPendingBookmarkOperation({ book, chapter, verse });
            return await response.json();
        } catch (err) {
            console.error('removeBookmark error:', err);
            await queuePendingBookmarkOperation({
                action: 'remove',
                bookmark: normalizeBookmark({ version_id, book, chapter, verse }),
            });
            return { message: 'Bookmark removed locally.' };
        }
    },

    async getBookmarksForChapter(version_id: string, book: string, chapter: number) {
        const chapterNumber = toNumber(chapter);
        const cachedBookmarks = await readBookmarksCache();
        const cachedChapterBookmarks = getBookmarksForChapterFromList(cachedBookmarks, book, chapterNumber);

        try {
            await syncPendingBookmarkOperations();
            const { authService } = await import('./auth');
            const token = await authService.getToken();
            const response = await fetch(
                `${API_BASE_URL}bible/bookmarks/chapter?version_id=${encodeURIComponent(version_id)}&book=${encodeURIComponent(book)}&chapter=${chapter}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    }
                }
            );
            if (!response.ok) throw new Error('Failed to fetch bookmarks');

            const data = await response.json();
            const chapterBookmarks = normalizeBookmarkList(Array.isArray(data) ? data : []);
            const withoutThisChapter = cachedBookmarks.filter(
                (item) => !(item.book === book && item.chapter === chapterNumber)
            );
            await writeBookmarksCache([...withoutThisChapter, ...chapterBookmarks]);
            return chapterBookmarks;
        } catch (err) {
            console.error('getBookmarksForChapter error:', err);
            return cachedChapterBookmarks;
        }
    },

    async searchBible(query: string, options: {
        version?: string;
        testament?: 'all' | 'old' | 'new';
        book?: string;
        page?: number;
        limit?: number;
    } = {}) {
        try {
            const params = new URLSearchParams({
                query,
                version: options.version || 'NEW KING JAMES VERSION',
                testament: options.testament || 'all',
                page: (options.page || 1).toString(),
                limit: (options.limit || 50).toString(),
            });

            if (options.book) params.append('book', options.book);

            const response = await fetch(`${API_BASE_URL}bible/search?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) throw new Error('Search failed');
            return await response.json();
        } catch (err) {
            console.error('searchBible error:', err);
            return { results: [], total: 0 };
        }
    }
};
