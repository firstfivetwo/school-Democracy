export default function handler(request, response) {
  // Явно указываем, что принимаем JSON
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  // Vercel иногда не парсит body автоматически — делаем это вручную
  let code;
  try {
    code = request.body.code;
  } catch (e) {
    return response.status(400).json({ error: 'Invalid JSON' });
  }

  const correctCode = process.env.SCHOOL_CODE;

  if (code === correctCode) {
    return response.status(200).json({ valid: true });
  } else {
    return response.status(401).json({ valid: false });
  }
}