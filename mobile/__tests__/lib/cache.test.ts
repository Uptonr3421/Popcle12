/**
 * Unit tests for mobile lib/cache.ts
 * Tests TTL-based caching of stamps and offers via AsyncStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheStamps, getCachedStamps, cacheOffers, getCachedOffers } from '../../lib/cache';

beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage.getItem as jest.Mock).mockReset();
  (AsyncStorage.setItem as jest.Mock).mockReset();
});

describe('cacheStamps', () => {
  it('stores JSON with value and timestamp', async () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);

    await cacheStamps('user-1', 7);

    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    const [key, raw] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
    expect(key).toBe('@popcle_stamps_user-1');
    const parsed = JSON.parse(raw);
    expect(parsed.value).toBe(7);
    expect(parsed.timestamp).toBe(now);

    (Date.now as unknown as jest.SpyInstance).mockRestore();
  });

  it('uses user-specific cache key', async () => {
    await cacheStamps('abc-123', 3);
    const [key] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
    expect(key).toBe('@popcle_stamps_abc-123');
  });
});

describe('getCachedStamps', () => {
  it('returns cached value if fresh (< 10 min)', async () => {
    const now = Date.now();
    const entry = JSON.stringify({ value: 5, timestamp: now - 5 * 60 * 1000 }); // 5 min ago
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(entry);

    const result = await getCachedStamps('user-1');
    expect(result).toBe(5);
  });

  it('returns null if cache is older than 10 minutes', async () => {
    const now = Date.now();
    const entry = JSON.stringify({ value: 5, timestamp: now - 11 * 60 * 1000 }); // 11 min ago
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(entry);

    const result = await getCachedStamps('user-1');
    expect(result).toBeNull();
  });

  it('returns null if no cached value exists', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const result = await getCachedStamps('user-1');
    expect(result).toBeNull();
  });

  it('returns null for legacy format (plain number)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('42');

    const result = await getCachedStamps('user-1');
    expect(result).toBeNull();
  });

  it('returns null if entry has no timestamp', async () => {
    const entry = JSON.stringify({ value: 5 });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(entry);

    const result = await getCachedStamps('user-1');
    expect(result).toBeNull();
  });

  it('returns null on JSON parse error', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('not-valid-json{{{');

    const result = await getCachedStamps('user-1');
    expect(result).toBeNull();
  });

  it('returns 0 stamps correctly (not falsy)', async () => {
    const now = Date.now();
    const entry = JSON.stringify({ value: 0, timestamp: now - 1000 });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(entry);

    const result = await getCachedStamps('user-1');
    expect(result).toBe(0);
  });
});

describe('cacheOffers', () => {
  it('stores offers array with timestamp', async () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);

    const offers = [{ id: '1', title: 'Half Off' }, { id: '2', title: 'Free Scoop' }];
    await cacheOffers(offers);

    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    const [key, raw] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
    expect(key).toBe('@popcle_offers');
    const parsed = JSON.parse(raw);
    expect(parsed.value).toEqual(offers);
    expect(parsed.timestamp).toBe(now);

    (Date.now as unknown as jest.SpyInstance).mockRestore();
  });

  it('handles empty offers array', async () => {
    await cacheOffers([]);

    const [, raw] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
    const parsed = JSON.parse(raw);
    expect(parsed.value).toEqual([]);
  });
});

describe('getCachedOffers', () => {
  it('returns cached offers if fresh', async () => {
    const now = Date.now();
    const offers = [{ id: '1', title: 'Deal' }];
    const entry = JSON.stringify({ value: offers, timestamp: now - 3 * 60 * 1000 }); // 3 min ago
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(entry);

    const result = await getCachedOffers();
    expect(result).toEqual(offers);
  });

  it('returns empty array if cache is older than 10 minutes', async () => {
    const now = Date.now();
    const offers = [{ id: '1', title: 'Expired Cache' }];
    const entry = JSON.stringify({ value: offers, timestamp: now - 15 * 60 * 1000 }); // 15 min ago
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(entry);

    const result = await getCachedOffers();
    expect(result).toEqual([]);
  });

  it('returns empty array if no cached value exists', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const result = await getCachedOffers();
    expect(result).toEqual([]);
  });

  it('returns empty array for legacy format (plain array)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([{ id: '1' }]));

    const result = await getCachedOffers();
    expect(result).toEqual([]);
  });

  it('returns empty array on JSON parse error', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('{{invalid');

    const result = await getCachedOffers();
    expect(result).toEqual([]);
  });

  it('returns empty array if entry has no timestamp', async () => {
    const entry = JSON.stringify({ value: [{ id: '1' }] });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(entry);

    const result = await getCachedOffers();
    expect(result).toEqual([]);
  });
});
