import redisClient from './redis';
import dbClient from './db';

async function checkRedisToken(req) {
  const token = req.headers['x-token'];
  if (!token) return { error: 'Unauthorized' };

  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) return { error: 'Unauthorized' };

  return { userId };
}

async function checkDBToken(req) {
  const token = req.headers['x-token'];
  if (!token) return { error: 'Unauthorized' };

  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) return { error: 'Unauthorized' };

  const user = await dbClient.getUser({ id: userId });
  if (!user) return { error: 'Unauthorized' };

  return user;
}

export { checkDBToken, checkRedisToken };
