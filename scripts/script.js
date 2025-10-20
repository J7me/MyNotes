// --- НОВАЯ ФУНКЦИОНАЛЬНОСТЬ: Запомнить меня ---

// Ключи для localStorage
const REMEMBER_ME_KEY = 'rememberMeData';

/**
 * Загружает сохраненные данные для "Запомнить меня" при загрузке страницы входа.
 */
function loadRememberMeData() {
  const currentPath = window.location.pathname;
  if (currentPath.endsWith('auth.html')) {
    const savedData = localStorage.getItem(REMEMBER_ME_KEY);
    if (savedData) {
      try {
        const { username, password } = JSON.parse(savedData);
        const usernameField = document.getElementById('loginUsername');
        const passwordField = document.getElementById('loginPassword');
        const checkbox = document.getElementById('rememberMeCheckbox');

        if (usernameField) usernameField.value = username;
        if (passwordField) passwordField.value = password;
        if (checkbox) checkbox.checked = true;
        console.log("Данные 'Запомнить меня' загружены.");
      } catch (e) {
        console.warn("Не удалось загрузить данные 'Запомнить меня':", e);
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
    }
  }
}

/**
 * Сохраняет или удаляет данные для "Запомнить меня" в зависимости от состояния чекбокса.
 * @param {string} username - Имя пользователя.
 * @param {string} password - Пароль.
 * @param {boolean} isChecked - Состояние чекбокса.
 */
function updateRememberMeData(username, password, isChecked) {
  if (isChecked) {
    const dataToSave = { username, password };
    localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(dataToSave));
    console.log("Данные 'Запомнить меня' сохранены.");
  } else {
    localStorage.removeItem(REMEMBER_ME_KEY);
    console.log("Данные 'Запомнить меня' удалены.");
  }
}

// Вызов функции загрузки данных при загрузке скрипта
document.addEventListener('DOMContentLoaded', function () {
  loadRememberMeData();
});

// --- /КОНЕЦ НОВОЙ ФУНКЦИОНАЛЬНОСТИ ---

// --- НОВАЯ ФУНКЦИОНАЛЬНОСТЬ: Перенаправление с главной страницы ---
function redirectToMainPage() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    // Если пользователь авторизован, перенаправляем на страницу заметок
    window.location.href = 'notes.html';
  } else {
    // Если не авторизован, остаёмся на главной странице
    // Ничего не делаем, или можно добавить логику для неавторизованных
  }
}

// Проверяем, находимся ли мы на главной странице (index.html)
if (window.location.pathname.endsWith('index.html')) {
  // Вызываем функцию перенаправления при загрузке страницы
  redirectToMainPage();
}
// --- /КОНЕЦ НОВОЙ ФУНКЦИОНАЛЬНОСТИ ---

// --- НОВАЯ ФУНКЦИОНАЛЬНОСТЬ: Перенаправление с auth/reg если авторизован ---
function redirectToNotesIfLoggedIn() {
  const currentUser = getCurrentUser();
  const currentPath = window.location.pathname;

  // Проверяем, находимся ли мы на странице входа или регистрации
  if (currentPath.endsWith('auth.html') || currentPath.endsWith('reg.html')) {
    if (currentUser) {
      // Если пользователь авторизован, перенаправляем на страницу заметок
      window.location.href = 'notes.html';
    }
  }
}

// Вызываем функцию перенаправления при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
  redirectToNotesIfLoggedIn();
});
// --- /КОНЕЦ НОВОЙ ФУНКЦИОНАЛЬНОСТИ ---

// Проверка авторизации
function getCurrentUser() {
  return localStorage.getItem('currentUser');
}

function requireAuth() {
  if (!getCurrentUser()) {
    alert('Пожалуйста, войдите в систему.');
    window.location.href = 'auth.html';
  }
}

// Регистрация
if (document.getElementById('registerForm')) {
  document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const email = document.getElementById('regEmail').value.trim();
    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const birthDate = document.getElementById('regBirthDate').value;
    const country = document.getElementById('regCountry').value.trim(); // Новое поле

    if (!username || !password || !email || !firstName || !lastName) {
      alert('Пожалуйста, заполните все обязательные поля!');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (users[username]) {
      alert('Пользователь с таким именем уже существует!');
      return;
    }

    users[username] = {
      password: password,
      email: email,
      firstName: firstName,
      lastName: lastName,
      birthDate: birthDate,
      country: country, // Добавлено новое поле
      bio: '', // Поле bio необязательное, создаём пустым при регистрации
      registrationDate: new Date().toISOString()
    };

    localStorage.setItem('users', JSON.stringify(users));
    alert('Регистрация успешна! Теперь войдите.');
    window.location.href = 'auth.html';
  });
}

// Вход
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMeCheckbox').checked;

    updateRememberMeData(username, password, rememberMe);

    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (users[username] && users[username].password === password) {
      localStorage.setItem('currentUser', username);
      window.location.href = 'notes.html'; // Перенаправление на основной функционал
    } else {
      alert('Неверное имя пользователя или пароль.');
    }
  });
}

// --- НОВАЯ ФУНКЦИОНАЛЬНОСТЬ: Подтверждение при покидании профиля ---

let profileFormIsDirty = false; // Флаг, указывающий на наличие несохраненных изменений

// Функция для проверки, отличаются ли текущие значения полей от оригинальных
function checkFormDirty() {
  const form = document.getElementById('profileEditForm');
  if (!form) return false;

  const originalFirstName = form.dataset.originalFirstName || '';
  const originalLastName = form.dataset.originalLastName || '';
  const originalEmail = form.dataset.originalEmail || '';
  const originalBirthDate = form.dataset.originalBirthDate || '';
  const originalCountry = form.dataset.originalCountry || '';

  const currentFirstName = document.getElementById('editFirstName').value.trim();
  const currentLastName = document.getElementById('editLastName').value.trim();
  const currentEmail = document.getElementById('editEmail').value.trim();
  const currentBirthDate = document.getElementById('editBirthDate').value;
  const currentCountry = document.getElementById('editCountry').value.trim();

  return (
    currentFirstName !== originalFirstName ||
    currentLastName !== originalLastName ||
    currentEmail !== originalEmail ||
    currentBirthDate !== originalBirthDate ||
    currentCountry !== originalCountry
  );
}

// Обработчик события 'input' на всех полях формы редактирования
function setupFormDirtyCheck() {
  const form = document.getElementById('profileEditForm');
  if (!form) return;

  const inputs = form.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', function () {
      profileFormIsDirty = checkFormDirty();
    });
  });
}

// Функция для отображения модального окна подтверждения
function showLeaveConfirmation() {
  return confirm("Изменения не сохранены. Вы действительно хотите покинуть страницу без сохранения?");
}

// --- /КОНЕЦ НОВОЙ ФУНКЦИОНАЛЬНОСТИ ---

// Профиль
if (document.getElementById('profileUsername')) { // Проверяем элементы, специфичные для профиля
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'auth.html';
  } else {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userData = users[user];

    if (userData) {
      // Обновляем отображение профиля
      document.getElementById('profileUsername').textContent = user;
      document.getElementById('profileFirstName').textContent = userData.firstName || '—';
      document.getElementById('profileLastName').textContent = userData.lastName || '—';
      document.getElementById('profileEmail').textContent = userData.email || '—';
      document.getElementById('profileBirthDate').textContent = userData.birthDate ? new Date(userData.birthDate).toLocaleDateString() : '—';
      document.getElementById('profileCountry').textContent = userData.country || '—'; // Новое поле

      // Заполняем форму редактирования
      document.getElementById('editUsername').value = user;
      document.getElementById('editFirstName').value = userData.firstName || '';
      document.getElementById('editLastName').value = userData.lastName || '';
      document.getElementById('editEmail').value = userData.email || '';
      document.getElementById('editBirthDate').value = userData.birthDate || '';
      document.getElementById('editCountry').value = userData.country || ''; // Новое поле
    }
  }
}

// Редактирование профиля
if (document.getElementById('editProfileBtn')) {
  document.getElementById('editProfileBtn').addEventListener('click', function () {
    saveCurrentFormState();
    profileFormIsDirty = false; // Сбрасываем флаг при открытии формы
    setupFormDirtyCheck(); // Начинаем отслеживать изменения
    document.getElementById('profileView').style.display = 'none';
    document.getElementById('profileEdit').style.display = 'block';
  });
}

// Функция для сохранения текущего состояния формы
function saveCurrentFormState() {
  const user = getCurrentUser();
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  const userData = users[user];

  if (userData) {
    const form = document.getElementById('profileEditForm');
    form.dataset.originalFirstName = userData.firstName || '';
    form.dataset.originalLastName = userData.lastName || '';
    form.dataset.originalEmail = userData.email || '';
    form.dataset.originalBirthDate = userData.birthDate || '';
    form.dataset.originalCountry = userData.country || ''; // Новое поле
  }
}

// Функция для сброса формы к исходным значениям
function resetFormToOriginal() {
  const form = document.getElementById('profileEditForm');

  document.getElementById('editFirstName').value = form.dataset.originalFirstName || '';
  document.getElementById('editLastName').value = form.dataset.originalLastName || '';
  document.getElementById('editEmail').value = form.dataset.originalEmail || '';
  document.getElementById('editBirthDate').value = form.dataset.originalBirthDate || '';
  document.getElementById('editCountry').value = form.dataset.originalCountry || ''; // Новое поле
  profileFormIsDirty = false; // Сбрасываем флаг после сброса
}

// --- НОВАЯ ФУНКЦИОНАЛЬНОСТЬ: Кнопка "Сброс" ---
if (document.getElementById('resetEditBtn')) {
  document.getElementById('resetEditBtn').addEventListener('click', function () {
    resetFormToOriginal(); // Вызываем функцию сброса
    alert("Изменения отменены, поля возвращены к сохранённым значениям.");
  });
}
// --- /КОНЕЦ НОВОЙ ФУНКЦИОНАЛЬНОСТИ ---

if (document.getElementById('cancelEditBtn')) {
  document.getElementById('cancelEditBtn').addEventListener('click', function () {
    // Проверяем, были ли изменения
    if (profileFormIsDirty) {
      const userConfirmed = showLeaveConfirmation();
      if (userConfirmed) {
        resetFormToOriginal();
        document.getElementById('profileView').style.display = 'block';
        document.getElementById('profileEdit').style.display = 'none';
        profileFormIsDirty = false; // Убедимся, что флаг сброшен
      }
      // Если пользователь не подтвердил, ничего не делаем
    } else {
      // Если изменений не было, просто закрываем форму
      resetFormToOriginal();
      document.getElementById('profileView').style.display = 'block';
      document.getElementById('profileEdit').style.display = 'none';
    }
  });
}

if (document.getElementById('profileEditForm')) {
  document.getElementById('profileEditForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const user = getCurrentUser();
    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (users[user]) {
      users[user].firstName = document.getElementById('editFirstName').value.trim();
      users[user].lastName = document.getElementById('editLastName').value.trim();
      users[user].email = document.getElementById('editEmail').value.trim();
      users[user].birthDate = document.getElementById('editBirthDate').value;
      users[user].country = document.getElementById('editCountry').value.trim(); // Новое поле

      localStorage.setItem('users', JSON.stringify(users));
      alert('Профиль успешно обновлен!');

      document.getElementById('profileView').style.display = 'block';
      document.getElementById('profileEdit').style.display = 'none';
      profileFormIsDirty = false; // Сбрасываем флаг после сохранения

      document.getElementById('profileFirstName').textContent = users[user].firstName || '—';
      document.getElementById('profileLastName').textContent = users[user].lastName || '—';
      document.getElementById('profileEmail').textContent = users[user].email || '—';
      document.getElementById('profileBirthDate').textContent = users[user].birthDate ? new Date(users[user].birthDate).toLocaleDateString() : '—';
      document.getElementById('profileCountry').textContent = users[user].country || '—'; // Новое поле
    }
  });
}

// Обработчик события 'beforeunload' для подтверждения при покидании страницы
window.addEventListener('beforeunload', function (event) {
  // Проверяем, находимся ли мы на странице профиля
  if (window.location.pathname.endsWith('user.html')) {
    if (profileFormIsDirty) {
      const confirmationMessage = 'Изменения не сохранены. Вы действительно хотите покинуть страницу без сохранения?';
      event.returnValue = confirmationMessage; // Для большинства браузеров
      return confirmationMessage;             // Для старых браузеров
    }
  }
  // Если флаг не установлен или не на странице профиля, ничего не делаем
});

// Выход
if (document.getElementById('logoutLink')) {
  document.getElementById('logoutLink').addEventListener('click', function (e) {
    e.preventDefault();
    // Проверяем, находимся ли мы на странице профиля и есть ли изменения
    if (window.location.pathname.endsWith('user.html') && profileFormIsDirty) {
      const userConfirmed = showLeaveConfirmation();
      if (userConfirmed) {
        localStorage.removeItem('currentUser');
        window.location.href = 'auth.html';
      }
      // Если пользователь не подтвердил, ничего не делаем
    } else {
      localStorage.removeItem('currentUser');
      window.location.href = 'auth.html';
    }
  });
}

if (document.getElementById('logoutLink2')) {
  document.getElementById('logoutLink2').addEventListener('click', function (e) {
    e.preventDefault();
    // Проверяем, находимся ли мы на странице профиля и есть ли изменения
    if (window.location.pathname.endsWith('user.html') && profileFormIsDirty) {
      const userConfirmed = showLeaveConfirmation();
      if (userConfirmed) {
        localStorage.removeItem('currentUser');
        window.location.href = 'auth.html';
      }
      // Если пользователь не подтвердил, ничего не делаем
    } else {
      localStorage.removeItem('currentUser');
      window.location.href = 'auth.html';
    }
  });
}

// Заметки
if (document.getElementById('notesList')) {
  requireAuth(); // Проверяем авторизацию на странице заметок
  const currentUser = getCurrentUser();
  const notesKey = `notes_${currentUser}`;
  let notes = JSON.parse(localStorage.getItem(notesKey) || '[]');

  function saveNotes() {
    localStorage.setItem(notesKey, JSON.stringify(notes));
    renderNotes();
  }

  function renderNotes() {
    const list = document.getElementById('notesList');
    list.innerHTML = '';
    notes.forEach((note, index) => {
      const li = document.createElement('li');
      li.textContent = note;
      const del = document.createElement('span');
      del.className = 'delete-btn';
      del.textContent = '×';
      del.onclick = () => {
        notes.splice(index, 1);
        saveNotes();
      };
      li.appendChild(del);
      list.appendChild(li);
    });
  }

  document.getElementById('noteForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const text = document.getElementById('noteText').value.trim();
    if (text) {
      notes.push(text);
      saveNotes();
      document.getElementById('noteText').value = '';
    }
  });

  renderNotes();
}
