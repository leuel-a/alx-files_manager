import sha1 from 'sha1';
import dbClient from '../utils/db';

const postNew = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  const inDbEmail = await dbClient.db.collection('users').findOne({ email });
  if (inDbEmail) {
    return res.status(400).json({ error: 'Already exist' });
  }

  const sha1Password = sha1(password);
  const { insertedId } = await dbClient.db
    .collection('users')
    .insertOne({ email, password: sha1Password });

  return res.status(201).json({ id: insertedId, email });
};

// eslint-disable-next-line import/prefer-default-export
export { postNew };
