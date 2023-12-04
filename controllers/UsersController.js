import sha1 from 'sha1';
import dbClient from '../utils/db';

class UserController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).jon({ error: 'Missing email' });
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
}

export default UserController;
