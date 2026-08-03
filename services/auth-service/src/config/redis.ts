import Redis from 'ioredis';

export let redis: Redis;

export async function connectRedis() {
  try {
    const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;
    redis = new Redis(redisUrl, {
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
      enableOfflineQueue: false,
      lazyConnect: true,
    });

    await redis.connect();
    await redis.ping();
    console.log('[auth-service] Redis connected');
  } catch (err) {
    console.warn('[auth-service] Redis unavailable — session caching disabled:', (err as Error).message);
    // Provide a no-op redis so the rest of the service still works
    redis = new Proxy({} as Redis, {
      get: () => async (..._args: unknown[]) => null,
    });
  }
}
