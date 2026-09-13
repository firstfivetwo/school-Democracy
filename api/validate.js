export default function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  let code;
  try {
    code = request.body.code;
  } catch (e) {
    return response.status(400).json({ error: 'Invalid JSON' });
  }

  const correctCode = process.env.SCHOOL_CODE;

  if (code === correctCode) {
    // Ставим cookie на 30 дней
    response.setHeader('Set-Cookie', 'school_session=valid; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax');
    return response.status(200).json({ valid: true });
  } else {
    return response.status(401).json({ valid: false });
  }
}