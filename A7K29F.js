document.addEventListener('DOMContentLoaded', () => {
  const pollContainer = document.getElementById('pollContainer');
  const overlay = document.getElementById('pollOverlay');
  const checkboxes = document.querySelectorAll('.poll-checkbox');
  const sliderTrack = document.getElementById('pollSliderTrack');
  const sliderThumb = document.getElementById('pollSliderThumb');
  const sliderText = sliderTrack.querySelector('.slider-text');
  
  let isDragging = false;
  let startX = 0;
  let currentX = 0;
  let thumbOffset = 0;
  let isCompleted = false;
  let selectedOption = null;

  // === 1. ЛОГИКА ЧЕКБОКСОВ (только один активный) ===
  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        // Снимаем галочки со всех остальных
        checkboxes.forEach(other => {
          if (other !== cb) other.checked = false;
        });
        selectedOption = cb.value;
      } else {
        selectedOption = null;
      }
    });
  });

  // === 2. ПРОВЕРКА: ГОЛОСОВАЛ ЛИ УЖЕ? ===
  const hasVoted = localStorage.getItem('poll_voted_stolovaya');
  if (hasVoted === 'true') {
    markAsVoted();
  }

  function markAsVoted() {
    pollContainer.classList.add('voted');
    overlay.classList.add('show');
    isCompleted = true;
    if (sliderText) sliderText.style.opacity = '0';
    sliderThumb.classList.add('completed');
  }

  // === 3. ЛОГИКА СЛАЙДЕРА ===
  const getMaxOffset = () => {
    return sliderTrack.offsetWidth - sliderThumb.offsetWidth - 12;
  };

  const updateThumbPosition = (x) => {
    const maxOffset = getMaxOffset();
    let newX = Math.max(0, Math.min(x, maxOffset));
    sliderThumb.style.left = (newX + 6) + 'px';
    currentX = newX;

    const progress = newX / maxOffset;
    
    // Меняем цвет от красного к зеленому
    const red = 255 - Math.round(progress * 220);
    const green = 59 + Math.round(progress * 196);
    const blue = 48 - Math.round(progress * 48);
    sliderThumb.style.background = `rgb(${red}, ${green}, ${blue})`;

    if (newX >= maxOffset && !isCompleted) {
      onSlideComplete();
    }
  };

  const onSlideComplete = () => {
    try {
  // Отправляем голос на сервер
  const response = await fetch('/api/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ option: selectedOption })
  });

  const data = await response.json();

  if (data.success) {
    localStorage.setItem('poll_voted_stolovaya', 'true');
    setTimeout(() => {
      pollContainer.classList.add('voted');
      overlay.classList.add('show');
    }, 400);
  }
} catch (error) {
  console.error('Ошибка при отправке голоса:', error);
  resetSlider();
}
    // Проверяем, выбран ли вариант
    if (!selectedOption) {
      // Если не выбран — возвращаем слайдер назад
      resetSlider();
      // Можно добавить визуальную подсказку (тряску)
      sliderTrack.classList.add('shake');
      setTimeout(() => sliderTrack.classList.remove('shake'), 300);
      return;
    }

    isCompleted = true;
    isDragging = false;
    sliderThumb.classList.remove('dragging');
    sliderThumb.style.cursor = 'default';

    // Визуал завершения
    if (sliderText) sliderText.style.opacity = '0';
    sliderThumb.style.background = '#34c759';
    sliderThumb.style.boxShadow = '0 4px 20px rgba(52, 199, 89, 0.6)';
    sliderThumb.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="white"/>
      </svg>
    `;

    // Сохраняем в localStorage
    localStorage.setItem('poll_voted_stolovaya', 'true');
    
    // Отправляем голос на сервер (если нужно)
    // fetch('/api/vote', { ... });

    // Показываем оверлей "Голос учтён"
    setTimeout(() => {
      pollContainer.classList.add('voted');
      overlay.classList.add('show');
    }, 400);
  };

  const resetSlider = () => {
    sliderThumb.style.left = '6px';
    sliderThumb.style.background = '#ff3b30';
    sliderThumb.style.boxShadow = '0 4px 15px rgba(255, 59, 48, 0.4)';
    if (sliderText) sliderText.style.opacity = '1';
    currentX = 0;
    isDragging = false;
    sliderThumb.classList.remove('dragging');
  };

  // === 4. СОБЫТИЯ МЫШИ И ТАЧА ===
  const startDrag = (clientX) => {
    if (isCompleted) return;
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
    if (currentX < maxOffset) {
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
});