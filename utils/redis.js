import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.connected = false;
    this.client = createClient().on('connect', () => {
      this.connected = true;
    }).on('error', (err) => {
      console.log(`Redis client not connected: ${err.message}`);
    });

    // Promisify the function that will be called from the outside
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.setex).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  isAlive() {
    return this.connected;
  }

  async get(key) {
    return await this.getAsync(key);
  }

  async set(key, value, duration) {
    return await this.setAsync(key, duration, value);
  }

  async del(key) {
    await this.delAsync(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;