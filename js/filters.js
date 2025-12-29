// js/filters.js
import { debounce } from './util.js';

const FILTERS_BLOCK_CLASS = 'img-filters--inactive';
const ACTIVE_BUTTON_CLASS = 'img-filters__button--active';
const RANDOM_COUNT = 10;

const filtersBlock = document.querySelector('.img-filters');
const form = filtersBlock ? filtersBlock.querySelector('.img-filters__form') : null;

let currentFilter = 'filter-default';

const showFilters = () => {
  if (!filtersBlock) {
    return;
  }
  filtersBlock.classList.remove(FILTERS_BLOCK_CLASS);
};

const setActiveButton = (filterId) => {
  if (!form) {
    return;
  }

  const currentActive = form.querySelector(`.${ACTIVE_BUTTON_CLASS}`);
  if (currentActive) {
    currentActive.classList.remove(ACTIVE_BUTTON_CLASS);
  }

  const newActive = form.querySelector(`#${filterId}`);
  if (newActive) {
    newActive.classList.add(ACTIVE_BUTTON_CLASS);
  }
};

const getRandomPictures = (pictures) =>
  [...pictures].sort(() => Math.random() - 0.5).slice(0, RANDOM_COUNT);

const getDiscussedPictures = (pictures) =>
  [...pictures].sort((a, b) => b.comments.length - a.comments.length);

const applyFilter = (pictures, filterId) => {
  switch (filterId) {
    case 'filter-random':
      return getRandomPictures(pictures);
    case 'filter-discussed':
      return getDiscussedPictures(pictures);
    case 'filter-default':
    default:
      return [...pictures];
  }
};

export const initFilters = (loadedPictures, onFilterChange) => {
  if (!filtersBlock || !form) {
    return;
  }

  showFilters();

  const debouncedRender = debounce(() => {
    const filtered = applyFilter(loadedPictures, currentFilter);
    onFilterChange(filtered);
  }, 500);

  form.addEventListener('click', (evt) => {
    const button = evt.target.closest('button');
    if (!button) {
      return;
    }

    if (button.id === currentFilter) {
      return;
    }

    currentFilter = button.id;
    setActiveButton(currentFilter);
    debouncedRender();
  });
};
