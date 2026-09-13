// Проверяем, не вошел ли пользователь уже
async function checkIfAlreadyLoggedIn() {
  try {
    const response = await fetch('/api/check-session');
    const data = await response.json();

    if (data.authenticated) {
      // Пользователь уже вошел — сразу на главную
      window.location.href = 'A7K29F.html';
    }
  } catch (error) {
    // Если ошибка (функция не работает) — ничего не делаем, пусть вводит код
    console.log('Проверка сессии не удалась');
  }
}

// Запускаем проверку при загрузке страницы
checkIfAlreadyLoggedIn();

const codeInput = document.getElementById("codeInput");
const hiddenInput = document.getElementById("hiddenInput");
const dots = document.querySelectorAll(".code_dot");
const errorMessage = document.getElementById("errorMessage");


// Нажимаем на поле — открывается клавиатура
codeInput.addEventListener("click", () => {
    hiddenInput.focus();
});


// Пользователь что-то вводит
hiddenInput.addEventListener("input", () => {

    // Только буквы и цифры
    let value = hiddenInput.value
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 6);

    hiddenInput.value = value;

    updateDots();

    // Убираем ошибку, когда пользователь начинает исправлять код
    errorMessage.classList.remove("show");

    // Если введено 6 символов
    if (value.length === 6) {
        checkCode();
    }
});


// Обновляем точки
function updateDots() {

    const value = hiddenInput.value;

    dots.forEach((dot, index) => {

        dot.textContent = value[index] || "";

        dot.classList.remove("selected");
    });

    // Подсвечиваем следующую свободную ячейку
    if (value.length < 6) {
        dots[value.length].classList.add("selected");
    }
}


async function checkCode() {
  const enteredCode = hiddenInput.value;

  try {
    const response = await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: enteredCode })
    });

    const data = await response.json();

    if (data.valid) {
      dots.forEach(dot => {
        dot.classList.remove("selected");
        dot.classList.add("correct");
      });
      setTimeout(() => {
        window.location.href = "main.html";
      }, 500);
    } else {
      errorMessage.classList.add("show");
      codeInput.classList.add("shake");
      setTimeout(() => codeInput.classList.remove("shake"), 300);
    }
  } catch (error) {
    errorMessage.classList.add("show");
    codeInput.classList.add("shake");
    setTimeout(() => codeInput.classList.remove("shake"), 300);
  }
}

updateDots();