import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    this.DB_HOST = process.env.DB_HOST || 'localhost';
    this.DB_PORT = process.env.DB_PORT || 27017;
    this.DB_DATABASE = process.env.DB_DATABASE || 'files_manager';

    this.client = new MongoClient(`mongodb://${this.DB_HOST}:${this.DB_PORT}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      console.log(`Connected successfully to MongoDB server`);
      this.db = this.client.db(this.DB_DATABASE);
    } catch (error) {
      console.log(`Failed to connect to MongoDB server: ${error}`);
    }
  }

  async close() {
    await this.client.close();
    console.log('Connection to MongoDB server is closed');
  }

  isAlive() {
    return this.client && this.client.isConnected();
  }

  async nbUsers() {
    return await this.db.countDocuments('users');
  }

  async nbFiles() {
    return await this.db.countDocuments('nbFiles');
  }
}

const dbClient = DBClient();
export default dbClient;
