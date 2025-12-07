import { getRandomInt, getRandomArrayElement } from './util.js';

const NAMES = ['Анна', 'Мария', 'Иван', 'Павел', 'София', 'Олег', 'Елена'];

const MESSAGES = [
  'Отлично!',
  'Супер',
  'Норм',
  'Топ',
  'Красота',
  'Очень красиво!',
  'Мне нравится',
  'Хочу туда!',
  'Классное фото',
  'Шикарно'
];

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
  comments: Array.from(
    { length: getRandomInt(10, 20) }, // entre 10 y 20 comentarios
    (_, i) => createComment(id * 10 + i + 1),
  ),
});

export const createPhotos = (count = 25) =>
  Array.from({ length: count }, (_, i) => createPhoto(i + 1));
