// js/filters.js
import { debounce } from './util.js';

const FILTERS_BLOCK_CLASS = 'img-filters--inactive';
const ACTIVE_BUTTON_CLASS = 'img-filters__button--active';
const RANDOM_COUNT = 10;

const filtersBlock = document.querySelector('.img-filters');
const form = filtersBlock?.querySelector('.img-filters__form');

let currentFilter = 'filter-default';

const showFilters = () => {
  if (!filtersBlock) { return; }
  filtersBlock.classList.remove(FILTERS_BLOCK_CLASS);
};

const setActiveButton = (filterId) => {
  if (!form) { return; }
  const currentActive = form.querySelector(`.${ACTIVE_BUTTON_CLASS}`);
  currentActive?.classList.remove(ACTIVE_BUTTON_CLASS);

  const newActive = form.querySelector(`#${filterId}`);
  newActive?.classList.add(ACTIVE_BUTTON_CLASS);
};

// Mejor aleatorio sin sesgo (Fisher–Yates)
const getRandomPictures = (pictures) => {
  const arr = pictures.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, RANDOM_COUNT);
};

const getDiscussedPictures = (pictures) =>
  pictures.slice().sort((a, b) => b.comments.length - a.comments.length);

const applyFilter = (pictures, filterId) => {
  switch (filterId) {
    case 'filter-random':
      return getRandomPictures(pictures);
    case 'filter-discussed':
      return getDiscussedPictures(pictures);
    case 'filter-default':
    default:
      return pictures.slice();
  }
};

export const initFilters = (loadedPictures, onFilterChange) => {
  if (!filtersBlock || !form) { return; } // <- clave

  showFilters();

  const debouncedRender = debounce(() => {
    onFilterChange(applyFilter(loadedPictures, currentFilter));
  }, 500);

  form.addEventListener('click', (evt) => {
    const button = evt.target.closest('button');
    if (!button) { return; }

    if (button.id === currentFilter) { return; }

    currentFilter = button.id;
    setActiveButton(currentFilter);
    debouncedRender();
  });
};
