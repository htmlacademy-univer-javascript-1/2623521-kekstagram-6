import { createPhotos } from './data.js';

function init() {
  const photos = createPhotos(25);

  console.log('Fotos generadas:', photos);
}

init();
