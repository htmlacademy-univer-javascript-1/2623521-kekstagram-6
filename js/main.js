// Количество публикаций
const PHOTO_COUNT = 25;

const LIKES_MIN = 15;
const LIKES_MAX = 200;
const COMMENTS_MIN = 0;
const COMMENTS_MAX = 30;

const NAMES = [
  'Sofia', 'Иван', 'Pedro', 'Ксения', 'Dilan', 'Софья',
  'Ana', 'Екатерина', 'Dyami', 'Полина', 'Cris', 'Анна',
  'Nicolas', 'Вероника', 'Thayak', 'Дарья', 'Damaris', 'Варвара'
];

const PHRASES = [
  'Всё отлично!',
  'В целом всё неплохо. Но не всё.',
  'Когда вы делаете фотографию, хорошо бы убирать палец из кадра. В конце концов это просто непрофессионально.',
  'Моя бабушка случайно чихнула с фотоаппаратом в руках и у неё получилась фотография лучше.',
  'Я поскользнулся на банановой кожуре и уронил фотоаппарат на кота и у меня получилась фотография лучше.',
  'Лица у людей на фотке перекошены, как будто их избивают. Как можно было поймать такой неудачный момент?!'
];

/* Утилиты */

const getRandomInt = (min, max) => {
  const lower = Math.ceil(Math.min(min, max));
  const upper = Math.floor(Math.max(min, max));
  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
};

const getRandomItem = (arr) => arr[getRandomInt(0, arr.length - 1)];

/* Генерация данных */

const makeMessage = () => {
  // 50/50 — одна фраза или две
  if (Math.random() < 0.5) {
    return getRandomItem(PHRASES);
  }
  const first = getRandomItem(PHRASES);
  let second = getRandomItem(PHRASES);
  // Гарантируем, что фразы не совпадают
  while (second === first) {
    second = getRandomItem(PHRASES);
  }
  return `${first} ${second}`;
};

// Комментарий
let commentIdSeq = 1;
const makeComment = () => ({
  id: commentIdSeq++,
  avatar: `img/avatar-${getRandomInt(1, 6)}.svg`,
  message: makeMessage(),
  name: getRandomItem(NAMES),
});

// Публикация (фото)
const makePhoto = (index) => {
  const commentsCount = getRandomInt(COMMENTS_MIN, COMMENTS_MAX);
  const comments = Array.from({ length: commentsCount }, makeComment);

  return {
    id: index,
    url: `photos/${index}.jpg`,
    description: `Описание фотографии #${index}`,
    likes: getRandomInt(LIKES_MIN, LIKES_MAX),
    comments,
  };
};

// Итоговый массив из 25 объектов
const photos = Array.from({ length: PHOTO_COUNT }, (_, i) => makePhoto(i + 1));

// Экспортируем в глобальную область, чтобы проект мог подхватить данные
window.photos = photos;
