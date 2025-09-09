import { createClient } from 'redis';
import { logger } from './logger';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

client.on('connect', () => {
  logger.info('Redis Client Connected');
});

client.on('ready', () => {
  logger.info('Redis Client Ready');
});

client.on('end', () => {
  logger.info('Redis Client Disconnected');
});

export async function connectRedis() {
  try {
    await client.connect();
    logger.info('Redis connection established');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
}

export async function disconnectRedis() {
  try {
    await client.disconnect();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
}

// Cache utilities
export const cache = {
  async get(key: string) {
    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  async set(key: string, value: any, ttl: number = 3600) {
    try {
      await client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  },

  async del(key: string) {
    try {
      await client.del(key);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  },

  async exists(key: string) {
    try {
      return await client.exists(key);
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }
};

export { client as redisClient };