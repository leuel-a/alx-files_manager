import dbClient from '../utils/db';

const postNew = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }
  const alreadyEmail = await dbClient.getUserByEmail(email);

  if (alreadyEmail) {
    return res.status(400).json({ error: 'Already exist' });
  }
  const insertedId = await dbClient.insertOne(email, password);
  return res.json({ id: insertedId, email });
};

// eslint-disable-next-line import/prefer-default-export
export { postNew };
