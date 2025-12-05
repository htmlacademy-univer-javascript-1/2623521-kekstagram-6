import { createPhotos } from './data.js';

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

// ---------- COMENTARIOS EN LA FOTO GRANDE ----------

const clearComments = () => {
  commentsListElement.innerHTML = '';
};

const createCommentElement = (comment) => {
  const li = document.createElement('li');
  li.classList.add('social__comment');

  const avatarElement = document.createElement('img');
  avatarElement.classList.add('social__picture');
  avatarElement.src = comment.avatar;      // viene de data.js
  avatarElement.alt = comment.name;        // viene de data.js
  avatarElement.width = 35;
  avatarElement.height = 35;

  const textElement = document.createElement('p');
  textElement.classList.add('social__text');
  textElement.textContent = comment.message; // viene de data.js

  li.append(avatarElement, textElement);
  return li;
};

const renderComments = (comments) => {
  clearComments();
  const fragment = document.createDocumentFragment();

  comments.forEach((comment) => {
    fragment.append(createCommentElement(comment));
  });

  commentsListElement.append(fragment);
};

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
  commentsCountElement.textContent = photo.comments.length;
  descriptionElement.textContent = photo.description;

  renderComments(photo.comments);

  // según la tarea, ocultar contador y botón de cargar comentarios
  commentsCountBlock.classList.add('hidden');
  commentsLoader.classList.add('hidden');

  bigPictureElement.classList.remove('hidden');
  document.body.classList.add('modal-open');

  document.addEventListener('keydown', onDocumentKeydown);
}

function closeBigPicture() {
  bigPictureElement.classList.add('hidden');
  document.body.classList.remove('modal-open');

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
