// js/main.js
import './upload-form.js';                 // módulo con la forma
import { createPhotos } from './data.js';  // datos para las fotos

// ---------- DATOS ----------

const photos = createPhotos(25);

// ---------- ELEMENTOS PARA MINIATURAS ----------

const picturesContainer = document.querySelector('.pictures');
const pictureTemplate = document
  .querySelector('#picture')
  .content
  .querySelector('.picture');

// ---------- ELEMENTOS PARA LA FOTO GRANDE ----------

const bigPictureElement = document.querySelector('.big-picture');
const bigPictureImg = bigPictureElement.querySelector('.big-picture__img img');
const likesCountElement = bigPictureElement.querySelector('.likes-count');
const commentsCountElement = bigPictureElement.querySelector('.comments-count');
const commentsListElement = bigPictureElement.querySelector('.social__comments');
const descriptionElement = bigPictureElement.querySelector('.social__caption');
const closeButton = bigPictureElement.querySelector('.big-picture__cancel');

// elementos del contador de comentarios y botón de carga
const commentsCountBlock = bigPictureElement.querySelector('.social__comment-count');
const commentsLoader = bigPictureElement.querySelector('.comments-loader');

// cuántos comentarios mostramos cada vez
const COMMENTS_PER_PORTION = 5;

// estado actual de los comentarios de la foto abierta
let currentComments = [];
let renderedCommentsCount = 0;

// ---------- COMENTARIOS EN LA FOTO GRANDE ----------

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
    const commentElement = createCommentElement(currentComments[i]);
    fragment.append(commentElement);
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

// ---------- ABRIR / CERRAR FOTO GRANDE ----------

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

closeButton.addEventListener('click', () => {
  closeBigPicture();
});

// ---------- MINIATURAS EN LA PÁGINA PRINCIPAL ----------

const renderThumbnails = (photosArray) => {
  const fragment = document.createDocumentFragment();

  photosArray.forEach((photo) => {
    const pictureElement = pictureTemplate.cloneNode(true);

    const imgElement = pictureElement.querySelector('.picture__img');
    const likesElement = pictureElement.querySelector('.picture__likes');
    const commentsElement = pictureElement.querySelector('.picture__comments');

    imgElement.src = photo.url;
    imgElement.alt = photo.description;
    likesElement.textContent = photo.likes;
    commentsElement.textContent = photo.comments.length;

    pictureElement.addEventListener('click', () => {
      openBigPicture(photo);
    });

    fragment.append(pictureElement);
  });

  picturesContainer.append(fragment);
};

// ---------- INICIO ----------

renderThumbnails(photos);
