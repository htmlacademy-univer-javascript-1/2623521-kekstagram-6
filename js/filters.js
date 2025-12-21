// js/filters.js
import { debounce } from './util.js';

const FILTERS_BLOCK_HIDDEN_CLASS = 'img-filters--inactive';
const ACTIVE_BUTTON_CLASS = 'img-filters__button--active';
const RANDOM_COUNT = 10;

const filtersBlock = document.querySelector('.img-filters');
const form = filtersBlock.querySelector('.img-filters__form');

let currentFilter = 'filter-default';

const showFilters = () => {
  filtersBlock.classList.remove(FILTERS_BLOCK_HIDDEN_CLASS);
};

const setActiveButton = (filterId) => {
  const currentActive = form.querySelector(`.${ACTIVE_BUTTON_CLASS}`);
  if (currentActive) {
    currentActive.classList.remove(ACTIVE_BUTTON_CLASS);
  }
  const newActive = form.querySelector(`#${filterId}`);
  if (newActive) {
    newActive.classList.add(ACTIVE_BUTTON_CLASS);
  }
};

const shuffleArray = (array) => {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const getFilteredPictures = (pictures, filterId) => {
  switch (filterId) {
    case 'filter-random':
      return shuffleArray(pictures).slice(0, RANDOM_COUNT);

    case 'filter-discussed':
      return pictures.slice().sort((a, b) => b.comments.length - a.comments.length);

    case 'filter-default':
    default:
      return pictures.slice();
  }
};

export const initFilters = (loadedPictures, onFilterChange) => {
  showFilters();

  const debouncedApply = debounce(() => {
    onFilterChange(getFilteredPictures(loadedPictures, currentFilter));
  }, 500);

  form.addEventListener('click', (evt) => {
    const button = evt.target.closest('.img-filters__button');
    if (!button) {
      return;
    }

    if (button.id === currentFilter) {
      return;
    }

    currentFilter = button.id;
    setActiveButton(currentFilter);

    debouncedApply();
  });
};
