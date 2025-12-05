import { getRandomInt, getRandomArrayElement } from './util.js';

const NAMES = ['Анна', 'Мария', 'Иван', 'Павел', 'София', 'Олег', 'Елена'];
const MESSAGES = [
  'Отлично!',
  'Супер',
  'Норм',
  'Топ',
  'Красота',
];
const DESCRIPTIONS = ['Моё фото', 'Котик', 'Отпуск', 'Вид из окна', 'Рабочий день'];

/* --- NUEVO: construir 1-2 frases aleatorias para message --- */
const buildMessage = () => {
  const count = getRandomInt(1, 2);        // 1 или 2 предложения
  const picked = new Set();
  while (picked.size < count) {
    picked.add(getRandomArrayElement(MESSAGES));
  }
  return [...picked].join(' ');
};

const createComment = (id) => ({
  id,
  avatar: `img/avatar-${getRandomInt(1, 6)}.svg`,
  message: buildMessage(),                  // <— aquí usamos 1–2 frases
  name: getRandomArrayElement(NAMES),
});

const createPhoto = (id) => ({
  id,
  url: `photos/${id}.jpg`,
  description: getRandomArrayElement(DESCRIPTIONS),
  likes: getRandomInt(15, 200),
  comments: Array.from(
    { length: getRandomInt(0, 30) },       // <— 0..30 comentarios
    (_, i) => createComment(id * 10 + i + 1)
  ),
});

export const createPhotos = (count = 25) =>
  Array.from({ length: count }, (_, i) => createPhoto(i + 1));
