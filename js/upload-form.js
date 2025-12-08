/* global noUiSlider */

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
  resetEffect();
  document.addEventListener('keydown', onDocumentKeydown);
}

function closeOverlay() {
  form.reset();
  pristine.reset();
  resetScale();
  resetEffect();
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
    evt.preventDefault();
  }
});

// ===================================================================
//                        МАСШТАБ ИЗОБРАЖЕНИЯ
// ===================================================================

const SCALE = {
  MIN: 25,
  MAX: 100,
  STEP: 25,
  DEFAULT: 100,
};

const setScale = (value) => {
  scaleValueField.value = `${value}%`;
  imagePreview.style.transform = `scale(${value / 100})`;
};

const getCurrentScale = () => parseInt(scaleValueField.value, 10);

const onSmallerClick = () => {
  const newValue = Math.max(SCALE.MIN, getCurrentScale() - SCALE.STEP);
  setScale(newValue);
};

const onBiggerClick = () => {
  const newValue = Math.min(SCALE.MAX, getCurrentScale() + SCALE.STEP);
  setScale(newValue);
};

function resetScale() {
  setScale(SCALE.DEFAULT);
}

scaleSmallerButton.addEventListener('click', onSmallerClick);
scaleBiggerButton.addEventListener('click', onBiggerClick);

// ===================================================================
//                           ЭФФЕКТЫ И noUiSlider
// ===================================================================

const EFFECTS = {
  none: {
    name: 'none',
    style: 'none',
    min: 0,
    max: 100,
    step: 1,
    unit: '',
  },
  chrome: {
    name: 'chrome',
    style: 'grayscale',
    min: 0,
    max: 1,
    step: 0.1,
    unit: '',
  },
  sepia: {
    name: 'sepia',
    style: 'sepia',
    min: 0,
    max: 1,
    step: 0.1,
    unit: '',
  },
  marvin: {
    name: 'marvin',
    style: 'invert',
    min: 0,
    max: 100,
    step: 1,
    unit: '%',
  },
  phobos: {
    name: 'phobos',
    style: 'blur',
    min: 0,
    max: 3,
    step: 0.1,
    unit: 'px',
  },
  heat: {
    name: 'heat',
    style: 'brightness',
    min: 1,
    max: 3,
    step: 0.1,
    unit: '',
  },
};

let currentEffect = EFFECTS.none;

const isDefaultEffect = () => currentEffect === EFFECTS.none;

const showSlider = () => {
  effectLevelContainer.classList.remove('hidden');
};

const hideSlider = () => {
  effectLevelContainer.classList.add('hidden');
};

// создаём слайдер
noUiSlider.create(effectLevelSlider, {
  range: {
    min: EFFECTS.none.min,
    max: EFFECTS.none.max,
  },
  start: EFFECTS.none.max,
  step: EFFECTS.none.step,
  connect: 'lower',
});

hideSlider();

// применение значения слайдера к превью
const updateEffect = () => {
  const sliderValue = effectLevelSlider.noUiSlider.get();
  effectValueField.value = sliderValue;

  if (isDefaultEffect()) {
    imagePreview.style.filter = 'none';
    return;
  }

  imagePreview.style.filter = `${currentEffect.style}(${sliderValue}${currentEffect.unit})`;
};

// обновляем настройки слайдера под выбранный эффект
const updateSlider = () => {
  effectLevelSlider.noUiSlider.updateOptions({
    range: {
      min: currentEffect.min,
      max: currentEffect.max,
    },
    step: currentEffect.step,
    start: currentEffect.max,
  });
};

// обработчик изменения эффекта (переключение радиокнопок)
const onEffectChange = (evt) => {
  if (!evt.target.classList.contains('effects__radio')) {
    return;
  }

  const effectName = evt.target.value;
  currentEffect = EFFECTS[effectName];

  if (isDefaultEffect()) {
    hideSlider();
  } else {
    showSlider();
  }

  updateSlider();
  updateEffect();
};

effectsList.addEventListener('change', onEffectChange);
effectLevelSlider.noUiSlider.on('update', updateEffect);

function resetEffect() {
  currentEffect = EFFECTS.none;
  imagePreview.style.filter = 'none';
  hideSlider();
  effectLevelSlider.noUiSlider.set(EFFECTS.none.max);
}
