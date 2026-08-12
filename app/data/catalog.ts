export type TopicId = "stories" | "learning" | "vehicles" | "songs" | "adventures";

export type TopicTone = "berry" | "sun" | "sky" | "mint" | "violet";

export interface CartoonTopic {
  id: TopicId;
  title: string;
  shortTitle: string;
  description: string;
  icon: "heart" | "sparkles" | "truck" | "music" | "rocket";
  tone: TopicTone;
}

export interface CartoonVideo {
  id: string;
  playbackId?: string;
  title: string;
  channel: string;
  language: "ru" | "en";
  topicId: TopicId;
}

export const TOPICS: CartoonTopic[] = [
  {
    id: "stories",
    title: "Любимые истории",
    shortTitle: "Истории",
    description: "Маша, Три кота, Смешарики и другие знакомые герои",
    icon: "heart",
    tone: "berry",
  },
  {
    id: "learning",
    title: "Учимся и узнаём",
    shortTitle: "Учимся",
    description: "Буквы, числа, правила поведения и ответы на «почему?»",
    icon: "sparkles",
    tone: "sun",
  },
  {
    id: "vehicles",
    title: "Машинки и техника",
    shortTitle: "Машинки",
    description: "Поезда, тракторы, грузовики и строительные машины",
    icon: "truck",
    tone: "sky",
  },
  {
    id: "songs",
    title: "Песенки и танцы",
    shortTitle: "Песенки",
    description: "Музыка, движения и любимые детские песни",
    icon: "music",
    tone: "mint",
  },
  {
    id: "adventures",
    title: "Приключения и спасатели",
    shortTitle: "Приключения",
    description: "Волшебство, дружба, спасательные миссии и открытия",
    icon: "rocket",
    tone: "violet",
  },
];

export const VIDEOS: CartoonVideo[] = [
  {
    id: "ZcZVtt-baas",
    title: "Маша и Медведь — летние серии",
    channel: "Маша и Медведь",
    language: "ru",
    topicId: "stories",
  },
  {
    id: "ppOWBAxT-Eg",
    title: "Малышарики — весёлые серии",
    channel: "Малышарики",
    language: "ru",
    topicId: "stories",
  },
  {
    id: "jzZKgl_29bw",
    title: "Барбоскины — новые серии",
    channel: "Барбоскины",
    language: "ru",
    topicId: "stories",
  },
  {
    id: "KCJniIY2Uy4",
    title: "Котики, вперёд! — все серии",
    channel: "Котики, вперёд!",
    language: "ru",
    topicId: "stories",
  },
  {
    id: "t6vApLGmp6E",
    title: "Смешарики Пин-код — бактерии и вирусы",
    channel: "Смешарики",
    language: "ru",
    topicId: "stories",
  },
  {
    id: "Psuuom9ZS5A",
    title: "Три кота — замечательные серии",
    channel: "Три кота",
    language: "ru",
    topicId: "stories",
  },
  {
    id: "t2ycMgAW6u8",
    title: "Монсики — Бесстрашие",
    channel: "Монсики",
    language: "ru",
    topicId: "stories",
  },
  {
    id: "kFoYNforU4Y",
    title: "Кто чем занимается",
    channel: "Развивающие мультики",
    language: "ru",
    topicId: "learning",
  },
  {
    id: "To5yh3rDuRs",
    title: "Фиксики — Помогатор",
    channel: "Фиксики",
    language: "ru",
    topicId: "learning",
  },
  {
    id: "1axK79unKEY",
    title: "Уроки хорошего поведения",
    channel: "Уроки тётушки Совы",
    language: "ru",
    topicId: "learning",
  },
  {
    id: "Wec8wGSOQ6A",
    title: "Безопасность: не прячемся в тесных местах",
    channel: "BabyBus",
    language: "ru",
    topicId: "learning",
  },
  {
    id: "vMuTrVbAOcs",
    title: "Я могу одеться сам",
    channel: "BabyBus",
    language: "ru",
    topicId: "learning",
  },
  {
    id: "_pWhx7l_48g",
    title: "Blippi — тонет или плавает?",
    channel: "Blippi",
    language: "en",
    topicId: "learning",
  },
  {
    id: "Hs0fNvQ0qaQ",
    title: "Elmo's World — снова в школу",
    channel: "Sesame Street",
    language: "en",
    topicId: "learning",
  },
  {
    id: "VHwlKl5SsHc",
    title: "Считаем до 100 с DJ Count",
    channel: "Jack Hartmann Kids Music",
    language: "en",
    topicId: "learning",
  },
  {
    id: "HIcNKigvJy0",
    title: "Поезда и вагоны",
    channel: "Развивающие мультики",
    language: "ru",
    topicId: "vehicles",
  },
  {
    id: "vrLu-gdkG6I",
    title: "Синий трактор — едет трактор",
    channel: "Синий трактор",
    language: "ru",
    topicId: "vehicles",
  },
  {
    id: "NzCsLa_ec30",
    title: "Грузовичок Лёва — лучшие серии",
    channel: "Грузовичок Лёва",
    language: "ru",
    topicId: "vehicles",
  },
  {
    id: "q-yhcaW_ZQk",
    title: "Строительные машины",
    channel: "BabyBus",
    language: "ru",
    topicId: "vehicles",
  },
  {
    id: "LrAtBtQnvCE",
    title: "Five Little Ducks + More",
    channel: "Super Simple Songs",
    language: "en",
    topicId: "songs",
  },
  {
    id: "VkL0PQ3WYs0",
    title: "Новый танец Baby Shark",
    channel: "Pinkfong",
    language: "en",
    topicId: "songs",
  },
  {
    id: "wk4KHNJjpjQ",
    title: "Twinkle Twinkle Little Star + More",
    channel: "Super Simple Songs",
    language: "en",
    topicId: "songs",
  },
  {
    id: "frN3nvhIHUk",
    title: "Do You Like Broccoli Ice Cream?",
    channel: "Super Simple Songs",
    language: "en",
    topicId: "songs",
  },
  {
    id: "-Z95SxV8PZc",
    title: "Rain Rain Go Away",
    channel: "ChuChu TV",
    language: "en",
    topicId: "songs",
  },
  {
    id: "XhpGp9d9jSA",
    title: "Badanamu — Super Hits",
    channel: "Badanamu",
    language: "en",
    topicId: "songs",
  },
  {
    id: "8deypue7SdQ",
    title: "Ball Pit Party",
    channel: "Bounce Patrol",
    language: "en",
    topicId: "songs",
  },
  {
    id: "OBjkNW11ujM",
    playbackId: "oX_smlVKYUI",
    title: "Лунтик — Включая грозу",
    channel: "Лунтик",
    language: "ru",
    topicId: "adventures",
  },
  {
    id: "ur3A8uT-l3E",
    title: "Спасатели конфет",
    channel: "BabyBus",
    language: "ru",
    topicId: "adventures",
  },
  {
    id: "KZSMYjmL-4g",
    title: "Волшебный торговый автомат",
    channel: "BabyBus",
    language: "ru",
    topicId: "adventures",
  },
  {
    id: "fT-ciS7dk-U",
    title: "Щенячий патруль — спасательные миссии",
    channel: "PAW Patrol",
    language: "en",
    topicId: "adventures",
  },
  {
    id: "bdNbUw5FIQo",
    title: "Найди свою акулу",
    channel: "Baby Shark",
    language: "en",
    topicId: "adventures",
  },
  {
    id: "RIWRqjcbJcs",
    title: "Morphle — учим цвета",
    channel: "Morphle",
    language: "en",
    topicId: "adventures",
  },
  {
    id: "DoULakpoynA",
    title: "Talking Tom — необычные события",
    channel: "Talking Tom & Friends",
    language: "en",
    topicId: "adventures",
  },
  {
    id: "eUs3h7-jKIk",
    title: "Caillou и школьный тест",
    channel: "Caillou",
    language: "en",
    topicId: "adventures",
  },
];

export const getTopic = (topicId: string | null): CartoonTopic | undefined =>
  TOPICS.find((topic) => topic.id === topicId);

export const getVideosForTopic = (topicId: TopicId): CartoonVideo[] =>
  VIDEOS.filter((video) => video.topicId === topicId);

export const getVideo = (videoId: string | null): CartoonVideo | undefined =>
  VIDEOS.find((video) => video.id === videoId);

export const getPlaybackId = (video: CartoonVideo): string =>
  video.playbackId ?? video.id;

export const isValidYouTubeId = (value: string | null): value is string =>
  Boolean(value && /^[A-Za-z0-9_-]{11}$/.test(value));

export const getThumbnailUrl = (videoId: string): string =>
  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
