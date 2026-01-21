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

// Cache keys
const CACHE_KEYS = {
    VERSIONS: 'bible_versions_cache',
    BOOKS: (version: string) => `bible_books_cache_${version}`,
    CHAPTER: (version: string, book: string, chapter: number) => `bible_chapter_cache_${version}_${book}_${chapter}`,
};

// In-memory cache for ultra-fast access
let versionsCache: BibleVersion[] | null = null;
const booksCache: Record<string, BibleBook[]> = {};
const chapterCache: Record<string, BibleChapter> = {};

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

    async getDailyVerse() {
        const cacheKey = 'bible_daily_verse_cache';
        try {
            const { authService } = await import('./auth');
            const token = await authService.getToken();
            const headers: Record<string, string> = { 'Accept': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${API_BASE_URL}bible/daily-verse`, { headers });

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

    async getAffirmation() {
        const cacheKey = 'bible_affirmation_cache';
        try {
            const { authService } = await import('./auth');
            const token = await authService.getToken();
            const headers: Record<string, string> = { 'Accept': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${API_BASE_URL}bible/affirmation`, { headers });

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
    }
};
