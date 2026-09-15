document.addEventListener('DOMContentLoaded', () => {
  const pollContainer = document.getElementById('pollContainer');
  const checkboxes = document.querySelectorAll('.poll-checkbox');
  const sliderTrack = document.getElementById('pollSliderTrack');
  const sliderThumb = document.getElementById('pollSliderThumb');
  const sliderText = document.getElementById('pollSliderText');
  const sliderTextMask = document.getElementById('pollSliderTextMask');

  let isDragging = false;
  let startX = 0;
  let currentX = 0;
  let thumbOffset = 0;
  let isCompleted = false;
  let isSending = false;
  let selectedOption = null;

  if (!pollContainer || !sliderTrack || !sliderThumb) return;

  // === ЛОГИКА ЧЕКБОКСОВ ===
  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        checkboxes.forEach(other => {
          if (other !== cb) other.checked = false;
        });
        selectedOption = cb.value;
        document.querySelectorAll('.poll-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        cb.closest('.poll-option').classList.add('selected');
      } else {
        selectedOption = null;
        cb.closest('.poll-option').classList.remove('selected');
      }
    });
  });

  // === ЛОГИКА СЛАЙДЕРА ===
  const getMaxOffset = () => {
    return sliderTrack.offsetWidth - sliderThumb.offsetWidth - 12;
  };

  const updateThumbPosition = (x) => {
    const maxOffset = getMaxOffset();
    let newX = Math.max(0, Math.min(x, maxOffset));
    sliderThumb.style.left = (newX + 6) + 'px';
    currentX = newX;

    const progress = newX / maxOffset;
    const red = 255 - Math.round(progress * 220);
    const green = 59 + Math.round(progress * 196);
    const blue = 48 - Math.round(progress * 48);
    sliderThumb.style.background = `rgb(${red}, ${green}, ${blue})`;

    if (sliderTextMask) {
      sliderTextMask.style.width = (progress * 100) + '%';
    }
  };

  // === ЗАВЕРШЕНИЕ СЛАЙДЕРА ===
  const onSlideComplete = async () => {
    if (!selectedOption) {
      resetSlider();
      sliderTrack.classList.add('shake');
      setTimeout(() => sliderTrack.classList.remove('shake'), 300);
      return;
    }

    // Блокируем чекбоксы
    checkboxes.forEach(cb => cb.disabled = true);

    isSending = true;
    isCompleted = true;
    isDragging = false;

    if (sliderText) sliderText.style.opacity = '0';
    sliderThumb.style.background = '#34c759';
    sliderThumb.style.boxShadow = '0 4px 20px rgba(52, 199, 89, 0.6)';
    sliderThumb.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="white"/>
      </svg>
    `;

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option: selectedOption })
      });

      const data = await response.json();

      if (data.success || data.error === 'Already voted') {
        localStorage.setItem('poll_voted_school', 'true');
        pollContainer.classList.add('voted');
        loadStats();
      } else {
        resetSlider();
        checkboxes.forEach(cb => cb.disabled = false);
      }
    } catch (error) {
      console.error('Ошибка при отправке голоса:', error);
      resetSlider();
      checkboxes.forEach(cb => cb.disabled = false);
    } finally {
      isSending = false;
    }
  };

  const resetSlider = () => {
    if (isSending) return;
    sliderThumb.style.left = '6px';
    sliderThumb.style.background = '#ff3b30';
    sliderThumb.style.boxShadow = '0 4px 15px rgba(255, 59, 48, 0.4)';
    if (sliderText) sliderText.style.opacity = '1';
    currentX = 0;
    isDragging = false;
    isCompleted = false;
    sliderThumb.classList.remove('dragging');
    sliderThumb.classList.remove('completed');
    if (sliderTextMask) sliderTextMask.style.width = '0%';
  };

  // === ЗАГРУЗКА СТАТИСТИКИ ===
  async function loadStats() {
  try {
    const response = await fetch('/api/results');
    const data = await response.json();

    // Если все нули — показываем нули, но не выходим
    document.querySelectorAll('.poll-option').forEach(option => {
      const value = option.dataset.value;
      const count = data[value] || 0;
      const percentEl = option.querySelector('.poll-option-percent');
      if (percentEl) {
        percentEl.textContent = `${count} чел.`;
        percentEl.classList.add('show');
      }
    });
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error);
  }
}

  // === ПРОВЕРКА: ГОЛОСОВАЛ ЛИ УЖЕ? (внизу, после объявления всех функций) ===
  const hasVoted = localStorage.getItem('poll_voted_school');
  if (hasVoted === 'true') {
    pollContainer.classList.add('voted');
    checkboxes.forEach(cb => cb.disabled = true);
    isCompleted = true;
    if (sliderText) sliderText.style.opacity = '0';
    sliderThumb.classList.add('completed');
    loadStats();
    return;
  }

  // === СОБЫТИЯ ===
  const startDrag = (clientX) => {
    if (isCompleted || isSending) return;
    isDragging = true;
    sliderThumb.classList.add('dragging');
    startX = clientX;
    thumbOffset = currentX;
  };

  const onDrag = (clientX) => {
    if (!isDragging || isCompleted) return;
    const deltaX = clientX - startX;
    updateThumbPosition(thumbOffset + deltaX);
  };

  const endDrag = () => {
    if (!isDragging || isCompleted) return;
    isDragging = false;
    sliderThumb.classList.remove('dragging');

    const maxOffset = getMaxOffset();

    // Если дошли до конца — запускаем отправку
    if (currentX >= maxOffset - 5) {
      sliderThumb.style.left = (maxOffset + 6) + 'px';
      currentX = maxOffset;
      onSlideComplete();
    } else {
      resetSlider();
    }
  };

  sliderThumb.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startDrag(e.clientX);
  });
  document.addEventListener('mousemove', (e) => onDrag(e.clientX));
  document.addEventListener('mouseup', endDrag);

  sliderThumb.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrag(e.touches[0].clientX);
  }, { passive: false });
  document.addEventListener('touchmove', (e) => onDrag(e.touches[0].clientX), { passive: false });
  document.addEventListener('touchend', endDrag, { passive: false });

  // === КОПИРОВАНИЕ КОДА ШКОЛЫ ===
const copyBtn = document.getElementById('copyCodeBtn');
const codeEl = document.getElementById('schoolCode');

if (copyBtn && codeEl) {
  copyBtn.addEventListener('click', async () => {
    const code = codeEl.textContent.trim();
    try {
      await navigator.clipboard.writeText(code);
      copyBtn.textContent = '✓ Скопировано!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Скопировать код';
        copyBtn.classList.remove('copied');
      }, 2000);
    } catch (error) {
      console.error('Ошибка копирования:', error);
      copyBtn.textContent = 'Ошибка';
    }
  });
}


});