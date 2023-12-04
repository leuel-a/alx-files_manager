import sha1 from 'sha1';
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async signIn(req, res) {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const base64Str = authorization.split(' ')[1];
    const [email, password] = Buffer.from(base64Str, 'base64')
      .toString('utf-8')
      .split(':');

    const user = await dbClient.db.collection('users').findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { password: sha1Password, _id } = user;
    if (sha1(password) !== sha1Password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const id = _id.toString();
    const token = uuidv4().toString();
    await redisClient.set(`auth_${token}`, id, 86400);
    return res.status(200).json({ token });
  }

  static async singOut(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.asyncGet(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.asyncDel(`auth_${token}`);
    return res.status(204).json();
  }
}

export default AuthController;
