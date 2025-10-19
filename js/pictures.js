export const renderPictures = (photos) => {
  const template = document
    .querySelector('#picture')
    .content
    .querySelector('.picture');

  const container = document.querySelector('.pictures');
  const fragment = document.createDocumentFragment();

  photos.forEach(({ url, description, likes, comments }) => {
    const node = template.cloneNode(true);

    const img = node.querySelector('.picture__img');
    img.src = url;
    img.alt = description;

    node.querySelector('.picture__likes').textContent = likes;
    node.querySelector('.picture__comments').textContent = comments.length;

    fragment.appendChild(node);
  });

  container.appendChild(fragment);
};
