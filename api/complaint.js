export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, text } = request.body;
    if (!text) return response.status(400).json({ error: 'No text' });

    const message = `🚨 *Новая жалоба*\n\n*Имя:* ${name || 'Аноним'}\n*Текст:*\n${text}`;

    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    return response.status(200).json({ success: true });
  } catch (error) {
    console.error('Complaint error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}