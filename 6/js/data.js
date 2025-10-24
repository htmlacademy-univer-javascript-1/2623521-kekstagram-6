import { getRandomInt, getRandomArrayElement } from './util.js';

const NAMES = ['Анна', 'Мария', 'Иван', 'Павел', 'София', 'Олег', 'Елена'];
const MESSAGES = ['Отлично!', 'Супер', 'Норм', 'Топ', 'Красота'];
const DESCRIPTIONS = ['Моё фото', 'Котик', 'Отпуск', 'Вид из окна', 'Рабочий день'];

const createComment = (id) => ({
  id,
  avatar: `img/avatar-${getRandomInt(1, 6)}.svg`,
  message: getRandomArrayElement(MESSAGES),
  name: getRandomArrayElement(NAMES),
});

const createPhoto = (id) => ({
  id,
  url: `photos/${id}.jpg`,
  description: getRandomArrayElement(DESCRIPTIONS),
  likes: getRandomInt(15, 200),
  comments: Array.from({ length: getRandomInt(0, 3) }, (_, i) => createComment(id * 10 + i + 1)),
});

export const createPhotos = (count = 25) =>
  Array.from({ length: count }, (_, i) => createPhoto(i + 1));
