// js/upload-form.js

const body = document.body;

const form = document.querySelector('.img-upload__form');
const uploadFileField = form.querySelector('#upload-file');
const overlay = document.querySelector('.img-upload__overlay');
const cancelButton = overlay.querySelector('.img-upload__cancel');
const hashtagsField = form.querySelector('.text__hashtags');
const commentField = form.querySelector('.text__description');
const previewImg = overlay.querySelector('.img-upload__preview img');

// ----------------- PRISTINE -----------------
const pristine = new Pristine(form, {
  classTo: 'img-upload__field-wrapper',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextTag: 'p',
  errorTextClass: 'img-upload__error',
});

// ----------------- OPEN/CLOSE OVERLAY -----------------
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
  resetEffects();

  // limpiar preview
  previewImg.src = 'img/upload-default-image.jpg';
  previewImg.style.transform = 'scale(1)';
  previewImg.style.filter = '';

  overlay.classList.add('hidden');
  body.classList.remove('modal-open');
  document.removeEventListener('keydown', onDocumentKeydown);
}

// Bloquear cierre con ESC cuando estás escribiendo
const stopEscPropagation = (evt) => {
  if (evt.key === 'Escape') {
    evt.stopPropagation();
  }
};

hashtagsField.addEventListener('keydown', stopEscPropagation);
commentField.addEventListener('keydown', stopEscPropagation);

// ----------------- VALIDACIÓN -----------------
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
  const tags = normalizeHashtags(value).map((t) => t.toLowerCase());
  return tags.length === new Set(tags).size;
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

// ----------------- PREVIEW FILE (para que NO sea solo el gato) -----------------
const FILE_TYPES = ['jpg', 'jpeg', 'png', 'webp'];

uploadFileField.addEventListener('change', () => {
  const file = uploadFileField.files[0];
  if (!file) {
    return;
  }

  const fileName = file.name.toLowerCase();
  const matches = FILE_TYPES.some((ext) => fileName.endsWith(ext));

  if (!matches) {
    // si quieres, puedes mostrar un mensaje
    return;
  }

  // mostrar imagen seleccionada
  previewImg.src = URL.createObjectURL(file);

  openOverlay();
  resetScale();
  initEffects(); // asegurar slider listo
  resetEffects();
});

// cerrar
cancelButton.addEventListener('click', () => {
  closeOverlay();
});

// ----------------- SCALE (ZOOM) -----------------
const scaleSmaller = overlay.querySelector('.scale__control--smaller');
const scaleBigger = overlay.querySelector('.scale__control--bigger');
const scaleValue = overlay.querySelector('.scale__control--value');

const SCALE_STEP = 25;
const SCALE_MIN = 25;
const SCALE_MAX = 100;

let currentScale = 100;

const applyScale = (value) => {
  currentScale = value;
  scaleValue.value = `${value}%`;
  previewImg.style.transform = `scale(${value / 100})`;
};

function resetScale() {
  applyScale(100);
}

scaleSmaller.addEventListener('click', () => {
  applyScale(Math.max(SCALE_MIN, currentScale - SCALE_STEP));
});

scaleBigger.addEventListener('click', () => {
  applyScale(Math.min(SCALE_MAX, currentScale + SCALE_STEP));
});

// ----------------- EFFECTS (noUiSlider) -----------------
const sliderContainer = overlay.querySelector('.effect-level__slider');
const effectLevelValue = overlay.querySelector('.effect-level__value');
const effectsList = overlay.querySelector('.effects__list');
const effectsFieldset = overlay.querySelector('.img-upload__effect-level');

const EFFECTS = {
  none: { filter: '', unit: '', range: { min: 0, max: 100 }, start: 100, step: 1 },
  chrome: { filter: 'grayscale', unit: '', range: { min: 0, max: 1 }, start: 1, step: 0.1 },
  sepia: { filter: 'sepia', unit: '', range: { min: 0, max: 1 }, start: 1, step: 0.1 },
  marvin: { filter: 'invert', unit: '%', range: { min: 0, max: 100 }, start: 100, step: 1 },
  phobos: { filter: 'blur', unit: 'px', range: { min: 0, max: 3 }, start: 3, step: 0.1 },
  heat: { filter: 'brightness', unit: '', range: { min: 1, max: 3 }, start: 3, step: 0.1 },
};

let currentEffect = 'none';

const applyEffect = (value) => {
  const effect = EFFECTS[currentEffect];

  if (currentEffect === 'none') {
    previewImg.style.filter = '';
    effectLevelValue.value = '';
    return;
  }

  previewImg.style.filter = `${effect.filter}(${value}${effect.unit})`;
  effectLevelValue.value = value;
};

const updateSliderOptions = () => {
  const effect = EFFECTS[currentEffect];

  if (currentEffect === 'none') {
    effectsFieldset.classList.add('hidden');
    previewImg.style.filter = '';
    effectLevelValue.value = '';
    return;
  }

  effectsFieldset.classList.remove('hidden');

  sliderContainer.noUiSlider.updateOptions({
    range: effect.range,
    start: effect.start,
    step: effect.step,
  });

  applyEffect(effect.start);
};

function resetEffects() {
  currentEffect = 'none';
  previewImg.style.filter = '';
  effectLevelValue.value = '';
  effectsFieldset.classList.add('hidden');

  const noneRadio = overlay.querySelector('#effect-none');
  if (noneRadio) {
    noneRadio.checked = true;
  }

  if (sliderContainer.noUiSlider) {
    sliderContainer.noUiSlider.set(EFFECTS.none.start);
  }
}

function initEffects() {
  // si no está cargado noUiSlider, no hay slider funcional
  if (typeof window.noUiSlider === 'undefined') {
    // esto explica por qué no se podía mover: faltaba vendor/nouislider/
    return;
  }

  if (!sliderContainer.noUiSlider) {
    window.noUiSlider.create(sliderContainer, {
      range: EFFECTS.none.range,
      start: EFFECTS.none.start,
      step: EFFECTS.none.step,
      connect: 'lower',
    });

    sliderContainer.noUiSlider.on('update', () => {
      const value = sliderContainer.noUiSlider.get();
      applyEffect(value);
    });
  }

  effectsFieldset.classList.add('hidden');

  effectsList.addEventListener('change', (evt) => {
    currentEffect = evt.target.value;
    updateSliderOptions();
  });
}

// ----------------- SUBMIT -----------------
form.addEventListener('submit', (evt) => {
  const isValid = pristine.validate();
  if (!isValid) {
    evt.preventDefault();
  }
});
