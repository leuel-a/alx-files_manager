import sha1 from 'sha1';
import { ObjectId } from 'mongodb';

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const userWithEmail = await dbClient.db
      .collection('users')
      .findOne({ email });

    if (userWithEmail) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const newUser = await dbClient.db
      .collection('users')
      .insertOne({ email, password: sha1(password) });

    return res.status(201).json({ id: newUser.insertedId, email });
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const id = await redisClient.get(`auth_${token}`);
    if (!id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { email } = await dbClient.db
      .collection('users')
      .findOne({ _id: new ObjectId(id) });
    return res.json({ email, id });
  }
}

export default UsersController;
