import AsyncStorage from '@react-native-async-storage/async-storage';

const STAMPS_KEY = (userId: string) => `@popcle_stamps_${userId}`;
const OFFERS_KEY = '@popcle_offers';
const CACHE_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

function isExpired(timestamp: number): boolean {
  return Date.now() - timestamp > CACHE_MAX_AGE_MS;
}

export async function cacheStamps(userId: string, count: number): Promise<void> {
  try {
    const entry: CacheEntry<number> = { value: count, timestamp: Date.now() };
    await AsyncStorage.setItem(STAMPS_KEY(userId), JSON.stringify(entry));
  } catch (err) {
    console.warn('Failed to cache stamps:', err);
  }
}

export async function getCachedStamps(userId: string): Promise<number | null> {
  try {
    const val = await AsyncStorage.getItem(STAMPS_KEY(userId));
    if (val === null) return null;
    const parsed = JSON.parse(val);
    // Support legacy format (plain number) and new format ({ value, timestamp })
    if (typeof parsed === 'number') return null; // Legacy cache, treat as expired
    const entry = parsed as CacheEntry<number>;
    if (!entry.timestamp || isExpired(entry.timestamp)) return null;
    return entry.value ?? null;
  } catch (err) {
    console.warn('Failed to read cached stamps:', err);
    return null;
  }
}

export async function cacheOffers(offers: any[]): Promise<void> {
  try {
    const entry: CacheEntry<any[]> = { value: offers, timestamp: Date.now() };
    await AsyncStorage.setItem(OFFERS_KEY, JSON.stringify(entry));
  } catch (err) {
    console.warn('Failed to cache offers:', err);
  }
}

export async function getCachedOffers(): Promise<any[]> {
  try {
    const val = await AsyncStorage.getItem(OFFERS_KEY);
    if (val === null) return [];
    const parsed = JSON.parse(val);
    // Support legacy format (plain array) and new format ({ value, timestamp })
    if (Array.isArray(parsed)) return []; // Legacy cache, treat as expired
    const entry = parsed as CacheEntry<any[]>;
    if (!entry.timestamp || isExpired(entry.timestamp)) return [];
    return entry.value ?? [];
  } catch (err) {
    console.warn('Failed to read cached offers:', err);
    return [];
  }
}
