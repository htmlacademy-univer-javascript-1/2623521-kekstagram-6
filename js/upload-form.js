// js/upload-form.js

const body = document.body;

const form = document.querySelector('.img-upload__form');
const uploadFileField = form.querySelector('#upload-file');
const overlay = document.querySelector('.img-upload__overlay');
const cancelButton = overlay.querySelector('.img-upload__cancel');
const hashtagsField = form.querySelector('.text__hashtags');
const commentField = form.querySelector('.text__description');

// ----------  Валидация через Pristine  ----------

const pristine = new Pristine(form, {
  classTo: 'img-upload__field-wrapper',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextTag: 'p',
  errorTextClass: 'img-upload__error',
});

// ----------  Работа с окном (overlay)  ----------

const onDocumentKeydown = (evt) => {
  if (evt.key === 'Escape') {
    evt.preventDefault();
    closeOverlay();
  }
};

function openOverlay() {
  overlay.classList.remove('hidden');
  body.classList.add('modal-open');
  document.addEventListener('keydown', onDocumentKeydown);
}

function closeOverlay() {
  form.reset();
  pristine.reset();
  overlay.classList.add('hidden');
  body.classList.remove('modal-open');
  document.removeEventListener('keydown', onDocumentKeydown);
}

// блокируем закрытие по Esc, если курсор в поле
const stopEscPropagation = (evt) => {
  if (evt.key === 'Escape') {
    evt.stopPropagation();
  }
};

hashtagsField.addEventListener('keydown', stopEscPropagation);
commentField.addEventListener('keydown', stopEscPropagation);

uploadFileField.addEventListener('change', () => {
  // пользователь выбрал файл => открываем форму
  openOverlay();
});

cancelButton.addEventListener('click', () => {
  closeOverlay();
});

// ---- Правила для хэштегов ----

const HASHTAG_MAX_COUNT = 5;
const HASHTAG_REGEXP = /^#[a-zа-яё0-9]{1,19}$/i; // # + 1-19 букв/цифр
const COMMENT_MAX_LENGTH = 140;

const normalizeHashtags = (value) =>
  value
    .trim()
    .split(/\s+/)
    .filter((tag) => tag.length > 0);

// один тег по шаблону
const isValidHashtag = (tag) => HASHTAG_REGEXP.test(tag);

// 1) все теги по шаблону
const hasValidHashtags = (value) => {
  const hashtags = normalizeHashtags(value);
  return hashtags.every(isValidHashtag);
};

// 2) не больше 5 тегов
const hasValidCount = (value) => {
  const hashtags = normalizeHashtags(value);
  return hashtags.length <= HASHTAG_MAX_COUNT;
};

// 3) уникальные (регистр не важен)
const hasUniqueHashtags = (value) => {
  const hashtags = normalizeHashtags(value).map((tag) => tag.toLowerCase());
  const unique = new Set(hashtags);
  return hashtags.length === unique.size;
};

// 4) комментарий не длиннее 140
const hasValidCommentLength = (value) => value.length <= COMMENT_MAX_LENGTH;

// добавляем валидаторы в Pristine

pristine.addValidator(
  hashtagsField,
  hasValidHashtags,
  'Хэш-тег должен начинаться с #, содержать только буквы и цифры и быть не длиннее 20 символов',
);

pristine.addValidator(
  hashtagsField,
  hasValidCount,
  'Нельзя указать больше пяти хэш-тегов',
);

pristine.addValidator(
  hashtagsField,
  hasUniqueHashtags,
  'Хэш-теги не должны повторяться',
);

pristine.addValidator(
  commentField,
  hasValidCommentLength,
  'Комментарий не может быть длиннее 140 символов',
);

// ----------  Обработка отправки формы  ----------

form.addEventListener('submit', (evt) => {
  const isValid = pristine.validate();

  if (!isValid) {
    evt.preventDefault(); // не отправляем, пока есть ошибки
  }
  // если всё ок — форма отправится (в следующих модулях вы добавите отправку на сервер)
});
