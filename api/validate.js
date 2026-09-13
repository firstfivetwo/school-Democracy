export default function handler(request, response) {
  const { code } = request.body;
  const correctCode = process.env.SCHOOL_CODE;

  if (code === correctCode) {
    return response.status(200).json({ valid: true });
  } else {
    return response.status(401).json({ valid: false });
  }
}

export default function handler(request, response) {
  const { code } = request.body;
  const correctCode = process.env.SCHOOL_CODE;

  if (code === correctCode) {
    // Устанавливаем cookie, которая хранится в браузере 30 дней
    response.setHeader('Set-Cookie', 'school_session=valid; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax');
    
    return response.status(200).json({ valid: true });
  } else {
    return response.status(401).json({ valid: false });
  }
}