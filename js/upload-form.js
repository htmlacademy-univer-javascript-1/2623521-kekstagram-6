// js/upload-form.js
import { sendData } from './api.js';

const body = document.body;

const form = document.querySelector('.img-upload__form');
const uploadFileField = form.querySelector('#upload-file');
const overlay = document.querySelector('.img-upload__overlay');
const cancelButton = overlay.querySelector('.img-upload__cancel');

const hashtagsField = form.querySelector('.text__hashtags');
const commentField = form.querySelector('.text__description');
const submitButton = form.querySelector('.img-upload__submit');

const previewImg = overlay.querySelector('.img-upload__preview img');

// scale
const scaleSmallerButton = overlay.querySelector('.scale__control--smaller');
const scaleBiggerButton = overlay.querySelector('.scale__control--bigger');
const scaleValueField = overlay.querySelector('.scale__control--value');

// effects
const effectsList = overlay.querySelector('.effects__list');
const effectLevelContainer = overlay.querySelector('.img-upload__effect-level');
const effectLevelSlider = overlay.querySelector('.effect-level__slider');
const effectLevelValue = overlay.querySelector('.effect-level__value');

// ---------- Pristine ----------
const pristine = new Pristine(form, {
  classTo: 'img-upload__field-wrapper',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextTag: 'p',
  errorTextClass: 'img-upload__error',
});

// ---------- Hashtags / comment validation ----------
const HASHTAG_MAX_COUNT = 5;
const HASHTAG_REGEXP = /^#[a-zа-яё0-9]{1,19}$/i;
const COMMENT_MAX_LENGTH = 140;

const normalizeHashtags = (value) =>
  value
    .trim()
    .split(/\s+/)
    .filter((tag) => tag.length > 0);

const hasValidHashtags = (value) => normalizeHashtags(value).every((tag) => HASHTAG_REGEXP.test(tag));
const hasValidCount = (value) => normalizeHashtags(value).length <= HASHTAG_MAX_COUNT;
const hasUniqueHashtags = (value) => {
  const hashtags = normalizeHashtags(value).map((tag) => tag.toLowerCase());
  return hashtags.length === new Set(hashtags).size;
};
const hasValidCommentLength = (value) => value.length <= COMMENT_MAX_LENGTH;

pristine.addValidator(
  hashtagsField,
  hasValidHashtags,
  'Хэш-тег должен начинаться с #, содержать только буквы и цифры и быть не длиннее 20 символов',
);

pristine.addValidator(hashtagsField, hasValidCount, 'Нельзя указать больше пяти хэш-тегов');
pristine.addValidator(hashtagsField, hasUniqueHashtags, 'Хэш-теги не должны повторяться');
pristine.addValidator(commentField, hasValidCommentLength, 'Комментарий не может быть длиннее 140 символов');

// ---------- Scale ----------
const SCALE = { MIN: 25, MAX: 100, STEP: 25, DEFAULT: 100 };
let currentScale = SCALE.DEFAULT;

const applyScale = (value) => {
  currentScale = value;
  scaleValueField.value = `${value}%`;
  previewImg.style.transform = `scale(${value / 100})`;
};

const resetScale = () => applyScale(SCALE.DEFAULT);

scaleSmallerButton.addEventListener('click', () => {
  applyScale(Math.max(SCALE.MIN, currentScale - SCALE.STEP));
});

scaleBiggerButton.addEventListener('click', () => {
  applyScale(Math.min(SCALE.MAX, currentScale + SCALE.STEP));
});

// ---------- Effects + noUiSlider ----------
const EFFECTS = {
  none: { filter: 'none', min: 0, max: 100, start: 100, step: 1, unit: '' },
  chrome: { filter: 'grayscale', min: 0, max: 1, start: 1, step: 0.1, unit: '' },
  sepia: { filter: 'sepia', min: 0, max: 1, start: 1, step: 0.1, unit: '' },
  marvin: { filter: 'invert', min: 0, max: 100, start: 100, step: 1, unit: '%' },
  phobos: { filter: 'blur', min: 0, max: 3, start: 3, step: 0.1, unit: 'px' },
  heat: { filter: 'brightness', min: 1, max: 3, start: 3, step: 0.1, unit: '' },
};

let currentEffect = 'none';

const hideSlider = () => effectLevelContainer.classList.add('hidden');
const showSlider = () => effectLevelContainer.classList.remove('hidden');

noUiSlider.create(effectLevelSlider, {
  range: { min: EFFECTS.none.min, max: EFFECTS.none.max },
  start: EFFECTS.none.start,
  step: EFFECTS.none.step,
  connect: 'lower',
});

const updateEffect = () => {
  const value = effectLevelSlider.noUiSlider.get();
  effectLevelValue.value = value;

  const effect = EFFECTS[currentEffect];

  if (currentEffect === 'none') {
    previewImg.style.filter = 'none';
    return;
  }

  previewImg.style.filter = `${effect.filter}(${value}${effect.unit})`;
};

effectLevelSlider.noUiSlider.on('update', updateEffect);

const setEffect = (effectName) => {
  currentEffect = effectName;
  const effect = EFFECTS[effectName];

  if (effectName === 'none') {
    hideSlider();
    effectLevelSlider.noUiSlider.updateOptions({
      range: { min: EFFECTS.none.min, max: EFFECTS.none.max },
      start: EFFECTS.none.start,
      step: EFFECTS.none.step,
    });
    previewImg.style.filter = 'none';
    return;
  }

  showSlider();
  effectLevelSlider.noUiSlider.updateOptions({
    range: { min: effect.min, max: effect.max },
    start: effect.start,
    step: effect.step,
  });
};

const resetEffects = () => {
  form.querySelector('#effect-none').checked = true;
  setEffect('none');
};

effectsList.addEventListener('change', (evt) => {
  if (evt.target.name === 'effect') {
    setEffect(evt.target.value);
  }
});

// ---------- Overlay ----------
const stopEscPropagation = (evt) => {
  if (evt.key === 'Escape') {
    evt.stopPropagation();
  }
};

hashtagsField.addEventListener('keydown', stopEscPropagation);
commentField.addEventListener('keydown', stopEscPropagation);

const onDocumentKeydown = (evt) => {
  if (evt.key === 'Escape') {
    evt.preventDefault();
    closeOverlay();
  }
};

let previewUrl = null;

function openOverlay() {
  overlay.classList.remove('hidden');
  body.classList.add('modal-open');

  resetScale();
  resetEffects();
  pristine.reset();

  document.addEventListener('keydown', onDocumentKeydown);
}

function closeOverlay() {
  form.reset();
  pristine.reset();

  resetScale();
  resetEffects();

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }

  overlay.classList.add('hidden');
  body.classList.remove('modal-open');
  document.removeEventListener('keydown', onDocumentKeydown);
}

// open on file choose + preview
uploadFileField.addEventListener('change', () => {
  const file = uploadFileField.files[0];
  if (!file) {
    return;
  }

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }
  previewUrl = URL.createObjectURL(file);
  previewImg.src = previewUrl;

  openOverlay();
});

cancelButton.addEventListener('click', closeOverlay);

// ---------- Success / Error messages ----------
const isEscapeKey = (evt) => evt.key === 'Escape';

const showMessage = (templateId) => {
  const template = document.querySelector(templateId).content.querySelector('section');
  const message = template.cloneNode(true);
  document.body.append(message);

  const removeMessage = () => {
    message.remove();
    document.removeEventListener('keydown', onKeydown);
  };

  function onKeydown(evt) {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      removeMessage();
    }
  }

  message.addEventListener('click', (evt) => {
    if (evt.target.closest('button') || evt.target === message) {
      removeMessage();
    }
  });

  document.addEventListener('keydown', onKeydown);
};

const blockSubmit = (isBlocked) => {
  submitButton.disabled = isBlocked;
  submitButton.textContent = isBlocked ? 'Публикую…' : 'Опубликовать';
};

// ---------- Submit (AJAX) ----------
form.addEventListener('submit', async (evt) => {
  evt.preventDefault();

  const isValid = pristine.validate();
  if (!isValid) {
    return;
  }

  blockSubmit(true);

  try {
    await sendData(new FormData(form));
    closeOverlay();
    showMessage('#success');
  } catch {
    showMessage('#error');
  } finally {
    blockSubmit(false);
  }
});
