import { createPhotos } from './data.js';
import { renderPictures } from './pictures.js';

function init() {
  // genera 25 objetos con datos temporales
  const photos = createPhotos(25);

  renderPictures(photos);
}

init();
