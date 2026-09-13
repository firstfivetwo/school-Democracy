import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(request, response) {
  try {
    const options = ['baking', 'salads', 'fruits'];
    const results = {};

    for (const option of options) {
      const count = await redis.get(`vote:${option}`) || 0;
      results[option] = count;
    }

    return response.status(200).json(results);
  } catch (error) {
    console.error('Results error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}