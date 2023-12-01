import { promisify } from 'util';
import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.on('error', (err) => {
      console.log(`Redis client not connected to the server: ${err}`);
    });
    this.asyncGet = promisify(this.client.get).bind(this.client);
    this.asyncSetex = promisify(this.client.setex).bind(this.client);
    this.asyncDel = promisify(this.client.del).bind(this.client);
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    await this.asyncGet(key);
  }

  async set(key, value, duration) {
    await this.asyncSetex(key, duration, value);
  }

  async del(key) {
    await this.asyncDel(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
