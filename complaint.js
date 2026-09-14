document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('complaintForm');
  const submitBtn = document.getElementById('complaintSubmit');
  const message = document.getElementById('complaintMessage');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('complaintName').value.trim();
    const text = document.getElementById('complaintText').value.trim();

    if (!text) {
      message.textContent = 'Напиши текст жалобы.';
      message.className = 'complaint-message show error';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
    message.className = 'complaint-message';

    try {
      const response = await fetch('/api/complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || 'Аноним', text: text })
      });

      const data = await response.json();

      if (data.success) {
        message.textContent = 'Жалоба отправлена. Спасибо!';
        message.className = 'complaint-message show success';
        submitBtn.textContent = '✓ Отправлено';
        submitBtn.classList.add('sent');
        form.reset();
      } else {
        message.textContent = 'Ошибка. Попробуй ещё раз.';
        message.className = 'complaint-message show error';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить анонимно';
      }
    } catch (error) {
      console.error('Ошибка:', error);
      message.textContent = 'Сервер не отвечает. Попробуй позже.';
      message.className = 'complaint-message show error';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить анонимно';
    }
  });
});