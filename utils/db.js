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

  async getUser({ id }) {
    return this.db.collection('users').findOne({ _id: ObjectId(id) });
  }

  async getFile({ id }) {
    return this.db.collection('files').findOne({ _id: ObjectId(id) });
  }

  // prettier-ignore
  async createFolder({
    name, parentId, userId, isPublic,
  }) {
    return this.db.collection('files').insertOne({
      name,
      type: 'folder',
      parentId: parentId || 0,
      userId,
      isPublic: isPublic || false,
    });
  }

  // prettier-ignore
  async addFileEntity({
    name, type, parentId, userId, isPublic, data,
  }) {
    const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

    const fileName = uuidv4();
    const localPath = `${FOLDER_PATH}/${fileName}`;

    const buffer = Buffer.from(data, 'base64');

    let insertedId;
    try {
      await writeFile(
        localPath,
        type === 'image' ? buffer : buffer.toString('utf-8'),
      );
      const { insertedId: id } = this.db.collection('files').insertOne({
        name,
        type,
        userId,
        parentId: parentId || 0,
        isPublic: isPublic || false,
        localPath,
      });
      insertedId = id;
    } catch (error) {
      console.log(`Error: ${error}`);
    }
    return { insertedId };
  }
}

const dbClient = new DBClient();
export default dbClient;
