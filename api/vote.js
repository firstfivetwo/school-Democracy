import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { option } = request.body;

    if (!option) {
      return response.status(400).json({ error: 'No option provided' });
    }

    // Получаем cookie сессии
    const cookies = request.headers.cookie || '';
    const sessionMatch = cookies.match(/school_session=([^;]+)/);
    const sessionId = sessionMatch ? sessionMatch[1] : 'anonymous';

    // Проверяем, голосовал ли уже
    const hasVoted = await redis.get(`voted:${sessionId}`);
    if (hasVoted) {
      return response.status(403).json({ error: 'Already voted' });
    }

    // Увеличиваем счетчик для выбранного варианта
    await redis.incr(`vote:${option}`);

    // Помечаем пользователя как проголосовавшего (30 дней)
    await redis.set(`voted:${sessionId}`, 'true', { ex: 2592000 });

    return response.status(200).json({ success: true });
  } catch (error) {
    console.error('Vote error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}