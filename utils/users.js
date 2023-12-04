import dbClient from './db';

async function checkUserWithEmail(email) {
  const user = await dbClient.db.collection('users').findOne({ email });
  return !!user;
}

// eslint-disable-next-line import/prefer-default-export
export { checkUserWithEmail };
