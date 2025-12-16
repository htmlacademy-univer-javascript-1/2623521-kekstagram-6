/* global Pristine, noUiSlider */

// js/upload-form.js

const body = document.body;

const form = document.querySelector('.img-upload__form');
const uploadFileField = form.querySelector('#upload-file');
const overlay = document.querySelector('.img-upload__overlay');
const cancelButton = overlay.querySelector('.img-upload__cancel');
const hashtagsField = form.querySelector('.text__hashtags');
const commentField = form.querySelector('.text__description');
const imagePreview = form.querySelector('.img-upload__preview img');

// ---- элементы для масштаба ----
const scaleSmallerButton = form.querySelector('.scale__control--smaller');
const scaleBiggerButton = form.querySelector('.scale__control--bigger');
const scaleValueField = form.querySelector('.scale__control--value');

// ---- элементы для эффектов ----
const effectsList = form.querySelector('.effects__list');
const effectLevelContainer = form.querySelector('.img-upload__effect-level');
const effectLevelSlider = form.querySelector('.effect-level__slider');
const effectValueField = form.querySelector('.effect-level__value');

// ----------  Escala (scale)  ----------

const MIN_SCALE = 25;
const MAX_SCALE = 100;
const STEP_SCALE = 25;

const smallerButton = overlay.querySelector('.scale__control--smaller');
const biggerButton = overlay.querySelector('.scale__control--bigger');
const scaleValueInput = overlay.querySelector('.scale__control--value');
const previewImage = overlay.querySelector('.img-upload__preview img');

let currentScale = MAX_SCALE;

const applyScale = (value) => {
  currentScale = value;
  scaleValueInput.value = `${value}%`;
  previewImage.style.transform = `scale(${value / 100})`;
};

const onSmallerClick = () => applyScale(Math.max(MIN_SCALE, currentScale - STEP_SCALE));
const onBiggerClick = () => applyScale(Math.min(MAX_SCALE, currentScale + STEP_SCALE));

const resetScale = () => applyScale(MAX_SCALE);

const initScale = () => {
  smallerButton.addEventListener('click', onSmallerClick);
  biggerButton.addEventListener('click', onBiggerClick);
  resetScale();
};

// ----------  Efectos + noUiSlider  ----------

const effectLevel = overlay.querySelector('.img-upload__effect-level');
const sliderElement = effectLevel.querySelector('.effect-level__slider');
const effectValueInput = effectLevel.querySelector('.effect-level__value');
const effectsContainer = overlay.querySelector('.effects__list');

const EFFECTS = {
  none: {
    hideSlider: true,
    min: 0,
    max: 100,
    start: 100,
    step: 1,
    getFilter: () => '',
  },
  chrome: {
    hideSlider: false,
    min: 0,
    max: 1,
    start: 1,
    step: 0.1,
    getFilter: (v) => `grayscale(${v})`,
  },
  sepia: {
    hideSlider: false,
    min: 0,
    max: 1,
    start: 1,
    step: 0.1,
    getFilter: (v) => `sepia(${v})`,
  },
  marvin: {
    hideSlider: false,
    min: 0,
    max: 100,
    start: 100,
    step: 1,
    getFilter: (v) => `invert(${v}%)`,
  },
  phobos: {
    hideSlider: false,
    min: 0,
    max: 3,
    start: 3,
    step: 0.1,
    getFilter: (v) => `blur(${v}px)`,
  },
  heat: {
    hideSlider: false,
    min: 1,
    max: 3,
    start: 3,
    step: 0.1,
    getFilter: (v) => `brightness(${v})`,
  },
};

let currentEffect = 'none';

const setSliderVisibility = (hide) => {
  effectLevel.classList.toggle('hidden', hide);
};

const applyEffect = (effectName) => {
  currentEffect = effectName in EFFECTS ? effectName : 'none';
  const config = EFFECTS[currentEffect];

  setSliderVisibility(config.hideSlider);

  // Reset al cambiar de efecto (nivel vuelve al inicio/100%)
  sliderElement.noUiSlider.updateOptions(
    {
      range: { min: config.min, max: config.max },
      step: config.step,
    },
    false
  );

  sliderElement.noUiSlider.set(config.start);
};

const onSliderUpdate = () => {
  const config = EFFECTS[currentEffect];
  const value = Number(sliderElement.noUiSlider.get());

  effectValueInput.value = value;
  previewImage.style.filter = config.getFilter(value);
};

const resetEffects = () => {
  previewImage.style.filter = '';
  effectValueInput.value = 100;

  const noneRadio = overlay.querySelector('input[name="effect"][value="none"]');
  if (noneRadio) {
    noneRadio.checked = true;
  }

  applyEffect('none');
};

const initEffects = () => {
  if (!window.noUiSlider) {
    throw new Error('noUiSlider no está cargado. Revisa vendor/nouislider/nouislider.js');
  }

  if (!sliderElement.noUiSlider) {
    noUiSlider.create(sliderElement, {
      range: { min: 0, max: 100 },
      start: 100,
      step: 1,
      connect: 'lower',
    });

    sliderElement.noUiSlider.on('update', onSliderUpdate);
  }

  effectsContainer.addEventListener('change', (evt) => {
    if (evt.target.matches('input[type="radio"][name="effect"]')) {
      applyEffect(evt.target.value);

      if (evt.target.value === 'none') {
        previewImage.style.filter = '';
      }
    }
  });

  resetEffects();
};

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
    if (document.activeElement === hashtagsField || document.activeElement === commentField) {
      return;
    }
    closeOverlay();
  }
};

function openOverlay() {
  overlay.classList.remove('hidden');
  body.classList.add('modal-open');

  resetScale();
  resetEffects();

  document.addEventListener('keydown', onDocumentKeydown);
}

function closeOverlay() {
  form.reset();
  pristine.reset();

  resetScale();
  resetEffects();

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
  openOverlay();
});

cancelButton.addEventListener('click', () => {
  closeOverlay();
});

// ---- Правила для хэштегов ----

const HASHTAG_MAX_COUNT = 5;
const HASHTAG_REGEXP = /^#[a-zа-яё0-9]{1,19}$/i;
const COMMENT_MAX_LENGTH = 140;

const normalizeHashtags = (value) =>
  value
    .trim()
    .split(/\s+/)
    .filter((tag) => tag.length > 0);

const isValidHashtag = (tag) => HASHTAG_REGEXP.test(tag);

const hasValidHashtags = (value) => {
  const hashtags = normalizeHashtags(value);
  return hashtags.every(isValidHashtag);
};

const hasValidCount = (value) => {
  const hashtags = normalizeHashtags(value);
  return hashtags.length <= HASHTAG_MAX_COUNT;
};

const hasUniqueHashtags = (value) => {
  const hashtags = normalizeHashtags(value).map((tag) => tag.toLowerCase());
  const unique = new Set(hashtags);
  return hashtags.length === unique.size;
};

const hasValidCommentLength = (value) => value.length <= COMMENT_MAX_LENGTH;

pristine.addValidator(
  hashtagsField,
  hasValidHashtags,
  'Хэш-тег должен начинаться с #, содержать только буквы и цифры и быть не длиннее 20 символов'
);

pristine.addValidator(
  hashtagsField,
  hasValidCount,
  'Нельзя указать больше пяти хэш-тегов'
);

pristine.addValidator(
  hashtagsField,
  hasUniqueHashtags,
  'Хэш-теги не должны повторяться'
);

pristine.addValidator(
  commentField,
  hasValidCommentLength,
  'Комментарий не может быть длиннее 140 символов'
);

// ----------  Обработка отправки формы  ----------

form.addEventListener('submit', (evt) => {
  const isValid = pristine.validate();
  if (!isValid) {
    evt.preventDefault();
  }
});

// ----------  Inicializar controles ----------
initScale();
initEffects();
