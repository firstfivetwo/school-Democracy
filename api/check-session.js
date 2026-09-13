export default function handler(request, response) {
  // Получаем все cookie из запроса
  const cookies = request.headers.cookie || '';
  
  // Проверяем, есть ли наша cookie
  const hasSession = cookies.includes('school_session=valid');

  if (hasSession) {
    return response.status(200).json({ authenticated: true });
  } else {
    return response.status(401).json({ authenticated: false });
  }
}