// js/main.js
import './upload-form.js';
import { getData } from './api.js';
import { initFilters } from './filters.js';

// ---------- MINIATURAS ----------
const picturesContainer = document.querySelector('.pictures');
const pictureTemplate = document
  .querySelector('#picture')
  .content
  .querySelector('.picture');

// ---------- ЭЛЕМЕНТЫ БОЛЬШОЙ ФОТО ----------
const bigPictureElement = document.querySelector('.big-picture');
const bigPictureImg = bigPictureElement.querySelector('.big-picture__img img');
const likesCountElement = bigPictureElement.querySelector('.likes-count');
const commentsCountElement = bigPictureElement.querySelector('.comments-count');
const commentsListElement = bigPictureElement.querySelector('.social__comments');
const descriptionElement = bigPictureElement.querySelector('.social__caption');
const closeButton = bigPictureElement.querySelector('.big-picture__cancel');

const commentsCountBlock = bigPictureElement.querySelector('.social__comment-count');
const commentsLoader = bigPictureElement.querySelector('.comments-loader');

const COMMENTS_PER_PORTION = 5;

let currentComments = [];
let renderedCommentsCount = 0;

// ---------- DATA ERROR ----------
const showDataError = () => {
  const errorElement = document.createElement('div');
  errorElement.classList.add('data-error');
  errorElement.textContent = 'НЕ УДАЛОСЬ ЗАГРУЗИТЬ ДАННЫЕ. ПОПРОБУЙТЕ ОБНОВИТЬ СТРАНИЦУ.';
  document.body.append(errorElement);

  setTimeout(() => {
    errorElement.remove();
  }, 5000);
};

// ---------- КОММЕНТАРИИ ----------
const clearComments = () => {
  commentsListElement.innerHTML = '';
};

const createCommentElement = (comment) => {
  const li = document.createElement('li');
  li.classList.add('social__comment');

  const avatarElement = document.createElement('img');
  avatarElement.classList.add('social__picture');
  avatarElement.src = comment.avatar;
  avatarElement.alt = comment.name;
  avatarElement.width = 35;
  avatarElement.height = 35;

  const textElement = document.createElement('p');
  textElement.classList.add('social__text');
  textElement.textContent = comment.message;

  li.append(avatarElement, textElement);

  return li;
};

const updateCommentsCounter = () => {
  commentsCountBlock.textContent = `${renderedCommentsCount} из ${currentComments.length} комментариев`;
};

const showNextComments = () => {
  const fragment = document.createDocumentFragment();

  const start = renderedCommentsCount;
  const end = Math.min(start + COMMENTS_PER_PORTION, currentComments.length);

  for (let i = start; i < end; i++) {
    fragment.append(createCommentElement(currentComments[i]));
  }

  commentsListElement.append(fragment);

  renderedCommentsCount = end;
  updateCommentsCounter();

  if (renderedCommentsCount >= currentComments.length) {
    commentsLoader.classList.add('hidden');
  }
};

const renderComments = (comments) => {
  currentComments = comments;
  clearComments();
  renderedCommentsCount = 0;

  commentsCountBlock.classList.remove('hidden');
  commentsLoader.classList.remove('hidden');

  commentsCountElement.textContent = currentComments.length;

  showNextComments();
};

commentsLoader.addEventListener('click', showNextComments);

// ---------- ОТКРЫТИЕ / ЗАКРЫТИЕ БОЛЬШОЙ ФОТО ----------
const onDocumentKeydown = (evt) => {
  if (evt.key === 'Escape') {
    evt.preventDefault();
    closeBigPicture();
  }
};

function openBigPicture(photo) {
  bigPictureImg.src = photo.url;
  bigPictureImg.alt = photo.description;

  likesCountElement.textContent = photo.likes;
  descriptionElement.textContent = photo.description;

  renderComments(photo.comments);

  bigPictureElement.classList.remove('hidden');
  document.body.classList.add('modal-open');

  document.addEventListener('keydown', onDocumentKeydown);
}

function closeBigPicture() {
  bigPictureElement.classList.add('hidden');
  document.body.classList.remove('modal-open');

  commentsCountBlock.classList.add('hidden');
  commentsLoader.classList.add('hidden');

  document.removeEventListener('keydown', onDocumentKeydown);
}

closeButton.addEventListener('click', closeBigPicture);

// ---------- МИНИАТЮРЫ ----------
const clearThumbnails = () => {
  picturesContainer.querySelectorAll('.picture').forEach((el) => el.remove());
};

const renderThumbnails = (photosArray) => {
  clearThumbnails();

  const fragment = document.createDocumentFragment();

  photosArray.forEach((photo) => {
    const pictureElement = pictureTemplate.cloneNode(true);

    const imgElement = pictureElement.querySelector('.picture__img');
    const likesElement = pictureElement.querySelector('.picture__likes');
    const commentsElement = pictureElement.querySelector('.picture__comments');

    imgElement.src = photo.url;
    imgElement.alt = photo.description;
    likesElement.textContent = photo.likes;
    demonstrateCommentsCount(photo, commentsElement);

    pictureElement.addEventListener('click', (evt) => {
      evt.preventDefault();
      openBigPicture(photo);
    });

    fragment.append(pictureElement);
  });

  picturesContainer.append(fragment);
};

function demonstrateCommentsCount(photo, commentsElement) {
  commentsElement.textContent = photo.comments.length;
}

// ---------- СТАРТ ----------
getData()
  .then((photos) => {
    renderThumbnails(photos);
    initFilters(photos, renderThumbnails);
  })
  .catch(() => {
    showDataError();
  });
