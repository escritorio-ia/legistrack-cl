/**
 * In-Memory Smart Cache Service with TTL and Stale-While-Revalidate
 */

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttlMs: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private hits = 0;
  private misses = 0;

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }
    const isExpired = Date.now() - entry.cachedAt > entry.ttlMs;
    if (isExpired) {
      this.misses++;
      // Do not immediately delete if we allow stale-while-revalidate, but return null for strict get
      return null;
    }
    this.hits++;
    return entry.data as T;
  }

  public getStale<T>(key: string): { data: T | null; isStale: boolean } {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return { data: null, isStale: false };
    }
    const isStale = Date.now() - entry.cachedAt > entry.ttlMs;
    if (!isStale) this.hits++;
    return { data: entry.data as T, isStale };
  }

  /** Tope de entradas: las búsquedas libres generan claves nuevas, así que sin tope la memoria crecería sin límite. */
  private static readonly MAX_ENTRADAS = 2000;

  public set<T>(key: string, data: T, ttlMs = 5 * 60 * 1000): void {
    if (!this.cache.has(key) && this.cache.size >= CacheService.MAX_ENTRADAS) {
      const ahora = Date.now();
      for (const [k, e] of this.cache) if (ahora - e.cachedAt > e.ttlMs) this.cache.delete(k);
      // Si no había vencidas, se descarta la más antigua (el Map conserva el orden de inserción).
      if (this.cache.size >= CacheService.MAX_ENTRADAS) this.cache.delete(this.cache.keys().next().value as string);
    }
    this.cache.set(key, {
      data,
      cachedAt: Date.now(),
      ttlMs
    });
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public getStats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 ? (this.hits / (this.hits + this.misses)).toFixed(2) : "0.00"
    };
  }

  /**
   * Helper that returns cached value or executes fallback function, updating cache in background.
   */
  public async wrap<T>(
    key: string,
    ttlMs: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const { data, isStale } = this.getStale<T>(key);
    if (data !== null && !isStale) {
      return data;
    }

    if (data !== null && isStale) {
      // Return stale immediately and refresh in background
      fetcher()
        .then((fresh) => this.set(key, fresh, ttlMs))
        .catch((err) => console.error(`[Cache SWR Error for ${key}]:`, err));
      return data;
    }

    // No data at all, must wait for fresh fetch
    const fresh = await fetcher();
    this.set(key, fresh, ttlMs);
    return fresh;
  }
}

export const cache = new CacheService();
