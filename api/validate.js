export default function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = request.body;
    const correctCode = process.env.SCHOOL_CODE;

    if (code === correctCode) {
      // Ставим cookie, которая хранится 30 дней
      response.setHeader(
        'Set-Cookie',
        `school_session=${code}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax`
      );
      return response.status(200).json({ valid: true });
    } else {
      return response.status(401).json({ valid: false });
    }
  } catch (error) {
    console.error('Validate error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}