const getRandomInt = (a, b) => {
  const min = Math.ceil(Math.min(a, b));
  const max = Math.floor(Math.max(a, b));
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomArrayElement = (arr) => arr[getRandomInt(0, arr.length - 1)];

const isEscapeKey = (evt) => evt.key === 'Escape';

export { getRandomInt, getRandomArrayElement, isEscapeKey };
