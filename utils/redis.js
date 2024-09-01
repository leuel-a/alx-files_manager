import { promisify } from 'util';
import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();

    // create async version of get and set
    this.client.get = promisify(this.client.get).bind(this.client);
    this.client.set = promisify(this.client.set).bind(this.client);
    this.client.del = promisify(this.client.del).bind(this.client);

    // handle events here
    this.client.on('connect', () => {
      console.log('Redis client connected to the server');
    });

    this.client.on('error', (error) => {
      console.log(`Redis client connected to the server: ${error}`);
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    return await this.client.get(key);
  }

  async set(key, value) {
    await this.client.set(key, value);
  }

  async del(key) {
    await this.client.del(key);
  }
}

const redisClient = RedisClient();
export default redisClient;
