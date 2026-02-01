import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@cache:';
const DEFAULT_EXPIRY = 1000 * 60 * 30; // 30 minutes

interface CacheItem<T> {
    data: T;
    timestamp: number;
}

export const cacheService = {
    async set<T>(key: string, data: T): Promise<void> {
        try {
            const item: CacheItem<T> = {
                data,
                timestamp: Date.now(),
            };
            await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
        } catch (e) {
            console.error('Cache set error:', e);
        }
    },

    async get<T>(key: string): Promise<T | null> {
        try {
            const stored = await AsyncStorage.getItem(CACHE_PREFIX + key);
            if (!stored) return null;

            const item: CacheItem<T> = JSON.parse(stored);
            return item.data;
        } catch (e) {
            console.error('Cache get error:', e);
            return null;
        }
    },

    async remove(key: string): Promise<void> {
        await AsyncStorage.removeItem(CACHE_PREFIX + key);
    }
};
