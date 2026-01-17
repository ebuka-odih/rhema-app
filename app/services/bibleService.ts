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

export const bibleService = {
    async getVersions(): Promise<BibleVersion[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/bible/versions`);
            if (!response.ok) throw new Error('Failed to fetch versions');
            return await response.json();
        } catch (error) {
            console.error('Error fetching Bible versions:', error);
            return [];
        }
    },

    async getBooks(version: string): Promise<BibleBook[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/bible/books?version=${encodeURIComponent(version)}`);
            if (!response.ok) throw new Error('Failed to fetch books');
            return await response.json();
        } catch (error) {
            console.error('Error fetching Bible books:', error);
            return [];
        }
    },

    async getChapter(version: string, book: string, chapter: number): Promise<BibleChapter | null> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/bible/chapter?version=${encodeURIComponent(version)}&book=${encodeURIComponent(book)}&chapter=${chapter}`
            );
            if (!response.ok) throw new Error('Failed to fetch chapter');
            return await response.json();
        } catch (error) {
            console.error('Error fetching Bible chapter:', error);
            return null;
        }
    }
};
