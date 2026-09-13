const sliderTrack = document.querySelector('.slider-track');
const sliderThumb = document.getElementById('sliderThumb');
const sliderText = document.getElementById('sliderText');
const sliderTextMask = document.getElementById('sliderTextMask');
const sliderTextMasked = document.getElementById('sliderTextMasked');

let isDragging = false;
let startX = 0;
let currentX = 0;
let thumbOffset = 0;
let isCompleted = false;

// URL для перехода
const redirectUrl = '/auth.html'; // Замените на вашу ссылку

const getMaxOffset = () => {
  const trackWidth = sliderTrack.offsetWidth;
  const thumbWidth = sliderThumb.offsetWidth;
  return trackWidth - thumbWidth - 12;
};

const updateThumbPosition = (x) => {
  const maxOffset = getMaxOffset();
  let newX = Math.max(0, Math.min(x, maxOffset));
  sliderThumb.style.left = (newX + 6) + 'px';
  currentX = newX;

  // Вычисляем прогресс (0 - 1)
  const progress = newX / maxOffset;
  
  // Обновляем прозрачность основного текста
  sliderText.style.opacity = 1 - progress;
  
  // Обновляем маску для стирания текста (ширина маски = прогресс)
  sliderTextMask.style.width = (progress * 100) + '%';
  
  // Плавно меняем цвет кнопки от красного к зеленому
  const red = 255 - Math.round(progress * 220); // от 255 до 35
  const green = 59 + Math.round(progress * 196); // от 59 до 255
  const blue = 48 - Math.round(progress * 48); // от 48 до 0
  
  sliderThumb.style.background = `rgb(${red}, ${green}, ${blue})`;
  
  // Обновляем тень
  const shadowIntensity = 0.4 + progress * 0.4;
  sliderThumb.style.boxShadow = `0 4px 15px rgba(${red}, ${green}, ${blue}, ${shadowIntensity})`;

  // Если достигли конца
  if (newX >= maxOffset && !isCompleted) {
    onSlideComplete();
  }
};

const onSlideComplete = () => {
  isCompleted = true;

  // Сразу убираем состояние перетаскивания
  isDragging = false;
  sliderThumb.classList.remove('dragging');

  // Возвращаем обычный курсор
  sliderThumb.style.cursor = 'default';

  sliderText.style.opacity = '1';
  sliderTextMask.style.width = '100%';

  sliderThumb.style.background = '#34c759';
  sliderThumb.style.boxShadow = '0 4px 20px rgba(52, 199, 89, 0.6)';

  sliderThumb.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="white"/>
    </svg>
  `;

  sliderThumb.style.animation = 'none';

  setTimeout(() => {
    window.location.href = redirectUrl;
  }, 500);
};

const resetSlider = () => {
  if (isCompleted) return;
  
  sliderThumb.style.left = '6px';
  sliderText.style.opacity = '1';
  sliderTextMask.style.width = '0%';
  sliderThumb.style.background = '#ff3b30';
  sliderThumb.style.boxShadow = '0 4px 15px rgba(255, 59, 48, 0.4)';
  currentX = 0;
  isDragging = false;
  sliderThumb.classList.remove('dragging');
};

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
  const newX = thumbOffset + deltaX;
  updateThumbPosition(newX);
};

const endDrag = () => {
  if (!isDragging || isCompleted) return;
  isDragging = false;
  sliderThumb.classList.remove('dragging');
  
  const maxOffset = getMaxOffset();
  if (currentX < maxOffset) {
    // Возвращаем на место, если не дотащили
    sliderThumb.style.left = '6px';
    sliderText.style.opacity = '1';
    sliderTextMask.style.width = '0%';
    sliderThumb.style.background = '#ff3b30';
    sliderThumb.style.boxShadow = '0 4px 15px rgba(255, 59, 48, 0.4)';
    currentX = 0;
  }
};

// Mouse events
sliderThumb.addEventListener('mousedown', (e) => {
  e.preventDefault();
  startDrag(e.clientX);
});

document.addEventListener('mousemove', (e) => {
  onDrag(e.clientX);
});

document.addEventListener('mouseup', endDrag);

// Touch events
sliderThumb.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  startDrag(touch.clientX);
}, { passive: false });

document.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  onDrag(touch.clientX);
}, { passive: false });

document.addEventListener('touchend', endDrag, { passive: false });

// Обработка изменения размера окна
window.addEventListener('resize', () => {
  if (currentX > 0 && !isCompleted) {
    const maxOffset = getMaxOffset();
    if (currentX > maxOffset) {
      currentX = maxOffset;
    }
    updateThumbPosition(currentX);
  }
});

