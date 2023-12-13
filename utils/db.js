import { Buffer } from 'buffer';
import { MongoClient, ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { writeFile } from 'node:fs/promises';

class DBClient {
  constructor() {
    this.dbHost = process.env.DB_HOST || 'localhost';
    this.dbPort = process.env.DB_PORT || 27017;
    this.db_name = process.env.DB_DATABASE || 'files_manager';

    const uri = `mongodb://${this.dbHost}:${this.dbPort}/${this.db_name}`;
    this.client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    this.db = null;
    this.client
      .connect()
      .then(() => {
        this.db = this.client.db();
      })
      .catch((error) => {
        console.log(`Error connecting to MongoDB: ${error}`);
      });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    try {
      const users = await this.db.collection('users').countDocuments();
      return users;
    } catch (err) {
      console.log(`Error counting the documents: ${err}`);
    }
    return 0;
  }

  async nbFiles() {
    try {
      const files = await this.db.collection('files').countDocuments();
      return files;
    } catch (error) {
      console.log(`Error counting the documents: ${error}`);
    }
    return 0;
  }

  async getUser(id) {
    return this.db.collection('users').findOne({ _id: ObjectId(id) });
  }
}

const dbClient = new DBClient();
export default dbClient;
