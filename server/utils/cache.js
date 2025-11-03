/**
 * Caching utility
 * Ready for Redis integration
 * Falls back to in-memory cache if Redis is not available
 */

class Cache {
  constructor() {
    this.memoryCache = new Map();
    this.defaultTTL = 3600; // 1 hour in seconds
  }

  async get(key) {
    // Future: Check Redis first
    // For now, use memory cache
    const item = this.memoryCache.get(key);
    if (!item) return null;

    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key, value, ttl = this.defaultTTL) {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : null;
    
    this.memoryCache.set(key, {
      value,
      expiresAt,
    });

    // Future: Set in Redis
    return true;
  }

  async delete(key) {
    this.memoryCache.delete(key);
    // Future: Delete from Redis
    return true;
  }

  async clear() {
    this.memoryCache.clear();
    // Future: Clear Redis
    return true;
  }
}

export default new Cache();
