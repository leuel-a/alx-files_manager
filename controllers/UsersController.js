import dbClient from '../utils/db';
import { checkUserWithEmail } from '../utils/users';

class UserController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).jon({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    if (await checkUserWithEmail(email)) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const user = await dbClient.createUser(email, password);
    return res.status(201).json({ id: user.insertedId, email });
  }
}

export default UserController;
