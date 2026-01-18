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

// In-memory cache for faster subsequent loads
let versionsCache: BibleVersion[] | null = null;
const booksCache: Record<string, BibleBook[]> = {};

export const bibleService = {
    async getVersions(): Promise<BibleVersion[]> {
        if (versionsCache) return versionsCache;
        try {
            const response = await fetch(`${API_BASE_URL}bible/versions`, {
                headers: { 'Accept': 'application/json' }
            });
            const text = await response.text();

            if (!response.ok) {
                console.error(`Failed to fetch versions. Status: ${response.status}, Body: ${text.substring(0, 100)}`);
                throw new Error('Failed to fetch versions');
            }

            try {
                versionsCache = JSON.parse(text);
                return versionsCache || [];
            } catch (e) {
                console.error('getVersions JSON parse error:', text.substring(0, 100));
                return [];
            }
        } catch (error) {
            console.error('Error fetching Bible versions:', error);
            return [];
        }
    },

    async getBooks(version: string): Promise<BibleBook[]> {
        if (booksCache[version]) return booksCache[version];
        try {
            const response = await fetch(`${API_BASE_URL}bible/books?version=${encodeURIComponent(version)}`, {
                headers: { 'Accept': 'application/json' }
            });
            const text = await response.text();

            if (!response.ok) {
                console.error(`Failed to fetch books. Status: ${response.status}, Body: ${text.substring(0, 100)}`);
                throw new Error('Failed to fetch books');
            }

            try {
                booksCache[version] = JSON.parse(text);
                return booksCache[version];
            } catch (e) {
                console.error('getBooks JSON parse error:', text.substring(0, 100));
                return [];
            }
        } catch (error) {
            console.error('Error fetching Bible books:', error);
            return [];
        }
    },

    async getChapter(version: string, book: string, chapter: number): Promise<BibleChapter | null> {
        try {
            const response = await fetch(
                `${API_BASE_URL}bible/chapter?version=${encodeURIComponent(version)}&book=${encodeURIComponent(book)}&chapter=${chapter}`,
                { headers: { 'Accept': 'application/json' } }
            );
            const text = await response.text();

            if (!response.ok) {
                console.error(`Failed to fetch chapter. Status: ${response.status}, Body: ${text.substring(0, 100)}`);
                throw new Error('Failed to fetch chapter');
            }

            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('getChapter JSON parse error:', text.substring(0, 100));
                return null;
            }
        } catch (error) {
            console.error('Error fetching Bible chapter:', error);
            return null;
        }
    },

    async getDailyVerse() {
        try {
            const response = await fetch(`${API_BASE_URL}bible/daily-verse`, {
                headers: { 'Accept': 'application/json' }
            });
            const text = await response.text();
            if (!response.ok) throw new Error('Failed to fetch daily verse');
            return JSON.parse(text);
        } catch (error) {
            console.error('Error fetching Daily Verse:', error);
            return null;
        }
    },

    async getAffirmation() {
        try {
            const response = await fetch(`${API_BASE_URL}bible/affirmation`, {
                headers: { 'Accept': 'application/json' }
            });
            const text = await response.text();
            if (!response.ok) throw new Error('Failed to fetch affirmation');
            return JSON.parse(text);
        } catch (error) {
            console.error('Error fetching Affirmation:', error);
            return null;
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
