// js/upload-form.js

const body = document.body;

const form = document.querySelector('.img-upload__form');
const uploadFileField = form.querySelector('#upload-file');

const overlay = document.querySelector('.img-upload__overlay');
const cancelButton = overlay.querySelector('.img-upload__cancel');

const hashtagsField = form.querySelector('.text__hashtags');
const commentField = form.querySelector('.text__description');

// Preview
const imagePreview = overlay.querySelector('.img-upload__preview img');

// Scale
const scaleSmallerButton = overlay.querySelector('.scale__control--smaller');
const scaleBiggerButton = overlay.querySelector('.scale__control--bigger');
const scaleValueField = overlay.querySelector('.scale__control--value');

// Effects + slider
const effectsList = overlay.querySelector('.effects__list');
const effectLevelContainer = overlay.querySelector('.img-upload__effect-level');
const effectLevelSlider = overlay.querySelector('.effect-level__slider');
const effectValueField = overlay.querySelector('.effect-level__value');

// ----------------- Pristine (validation) -----------------

const pristine = new window.Pristine(form, {
  classTo: 'img-upload__field-wrapper',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextTag: 'p',
  errorTextClass: 'img-upload__error',
});

// ----------------- Hashtags + comment rules -----------------

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

// ----------------- Esc behavior -----------------

const stopEscPropagation = (evt) => {
  if (evt.key === 'Escape') {
    evt.stopPropagation();
  }
};

hashtagsField.addEventListener('keydown', stopEscPropagation);
commentField.addEventListener('keydown', stopEscPropagation);

// ----------------- Scale (task 9.2) -----------------

const SCALE = {
  MIN: 25,
  MAX: 100,
  STEP: 25,
  DEFAULT: 100,
};

let currentScale = SCALE.DEFAULT;

const setScale = (value) => {
  currentScale = value;
  scaleValueField.value = `${value}%`;
  imagePreview.style.transform = `scale(${value / 100})`;
};

const onScaleSmaller = () => {
  setScale(Math.max(SCALE.MIN, currentScale - SCALE.STEP));
};

const onScaleBigger = () => {
  setScale(Math.min(SCALE.MAX, currentScale + SCALE.STEP));
};

const resetScale = () => {
  setScale(SCALE.DEFAULT);
};

// ----------------- Effects + noUiSlider (task 9.2) -----------------

const EFFECTS = {
  none: {
    filter: 'none',
    min: 0,
    max: 100,
    step: 1,
    unit: '',
  },
  chrome: {
    filter: 'grayscale',
    min: 0,
    max: 1,
    step: 0.1,
    unit: '',
  },
  sepia: {
    filter: 'sepia',
    min: 0,
    max: 1,
    step: 0.1,
    unit: '',
  },
  marvin: {
    filter: 'invert',
    min: 0,
    max: 100,
    step: 1,
    unit: '%',
  },
  phobos: {
    filter: 'blur',
    min: 0,
    max: 3,
    step: 0.1,
    unit: 'px',
  },
  heat: {
    filter: 'brightness',
    min: 1,
    max: 3,
    step: 0.1,
    unit: '',
  },
};

let currentEffect = EFFECTS.none;

const showSlider = () => {
  effectLevelContainer.classList.remove('hidden');
};

const hideSlider = () => {
  effectLevelContainer.classList.add('hidden');
};

const applyEffect = (value) => {
  effectValueField.value = value;

  if (currentEffect === EFFECTS.none) {
    imagePreview.style.filter = 'none';
    return;
  }

  imagePreview.style.filter = `${currentEffect.filter}(${value}${currentEffect.unit})`;
};

const updateSliderOptions = (effect) => {
  effectLevelSlider.noUiSlider.updateOptions({
    range: {
      min: effect.min,
      max: effect.max,
    },
    step: effect.step,
    start: effect.max,
  });

  effectLevelSlider.noUiSlider.set(effect.max);
};

const onEffectChange = (evt) => {
  const effectName = evt.target.value;
  currentEffect = EFFECTS[effectName];

  if (currentEffect === EFFECTS.none) {
    hideSlider();
    applyEffect(0);
    return;
  }

  showSlider();
  updateSliderOptions(currentEffect);
};

const initEffects = () => {
  window.noUiSlider.create(effectLevelSlider, {
    range: {
      min: EFFECTS.none.min,
      max: EFFECTS.none.max,
    },
    start: EFFECTS.none.max,
    step: EFFECTS.none.step,
    connect: 'lower',
  });

  hideSlider();

  effectLevelSlider.noUiSlider.on('update', () => {
    const value = Number(effectLevelSlider.noUiSlider.get());
    applyEffect(value);
  });

  effectsList.addEventListener('change', onEffectChange);
};

const resetEffect = () => {
  currentEffect = EFFECTS.none;
  imagePreview.style.filter = 'none';
  hideSlider();
  effectLevelSlider.noUiSlider.set(EFFECTS.none.max);
  const noneRadio = overlay.querySelector('#effect-none');
  if (noneRadio) {
    noneRadio.checked = true;
  }
};

// ----------------- Overlay open/close -----------------

let previewUrl = null;

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

  resetScale();
  resetEffect();

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }

  overlay.classList.add('hidden');
  body.classList.remove('modal-open');
  document.removeEventListener('keydown', onDocumentKeydown);
}

// ----------------- Events -----------------

uploadFileField.addEventListener('change', () => {
  const file = uploadFileField.files[0];
  if (file) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    previewUrl = URL.createObjectURL(file);
    imagePreview.src = previewUrl;
  }

  openOverlay();
});

cancelButton.addEventListener('click', () => closeOverlay());

scaleSmallerButton.addEventListener('click', onScaleSmaller);
scaleBiggerButton.addEventListener('click', onScaleBigger);

form.addEventListener('submit', (evt) => {
  const isValid = pristine.validate();
  if (!isValid) {
    evt.preventDefault();
  }
});

// init
resetScale();
initEffects();
