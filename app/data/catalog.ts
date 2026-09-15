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
  language: "ru" | "en" | "unknown";
  topicId: TopicId;
  durationLabel?: string;
}

export const TOPICS: CartoonTopic[] = [
  {
    id: "stories",
    title: "Любимые истории",
    shortTitle: "Истории",
    description: "Peppa Pig, Bluey и Caillou на английском",
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

// English editions selected from publisher channels; video IDs link to their YouTube source.
export const VIDEOS: CartoonVideo[] = [
  {
    "id": "eUs3h7-jKIk",
    "title": "Caillou and the School Test",
    "channel": "Caillou - WildBrain",
    "language": "en",
    "topicId": "stories"
  },
  {
    "id": "Jg9jztRqyTQ",
    "title": "Peppa Pig - Muddy Puddles",
    "channel": "Peppa Pig and Friends",
    "language": "en",
    "topicId": "stories"
  },
  {
    "id": "xy589Tyo3Go",
    "title": "Peppa Pig - Muddy Puddle Adventures",
    "channel": "Peppa Pig - Official Channel",
    "language": "en",
    "topicId": "stories"
  },
  {
    "id": "EJkn-r-rJJY",
    "title": "Bluey - Keepy Uppy and Friends",
    "channel": "Disney Jr.",
    "language": "en",
    "topicId": "stories"
  },
  {
    "id": "_pWhx7l_48g",
    "title": "Blippi - Sink or Float",
    "channel": "Blippi - Educational Videos for Kids",
    "language": "en",
    "topicId": "learning"
  },
  {
    "id": "Hs0fNvQ0qaQ",
    "title": "Elmo's World - Back to School",
    "channel": "Sesame Street",
    "language": "en",
    "topicId": "learning"
  },
  {
    "id": "VHwlKl5SsHc",
    "title": "DJ Count - Count to 100",
    "channel": "Jack Hartmann Kids Music Channel",
    "language": "en",
    "topicId": "learning"
  },
  {
    "id": "V3wzuwVWeoE",
    "title": "Leo the Truck - Planes and Boats",
    "channel": "KidsFirstTV",
    "language": "en",
    "topicId": "vehicles"
  },
  {
    "id": "qlmAp8kYJyY",
    "title": "Leo the Truck - Tow Truck and Bulldozer",
    "channel": "KidsFirstTV",
    "language": "en",
    "topicId": "vehicles"
  },
  {
    "id": "LrAtBtQnvCE",
    "title": "Five Little Ducks and More",
    "channel": "Super Simple Songs - Kids Songs",
    "language": "en",
    "topicId": "songs"
  },
  {
    "id": "VkL0PQ3WYs0",
    "title": "Baby Shark Dance",
    "channel": "Baby Shark - Pinkfong Kids’ Songs & Stories",
    "language": "en",
    "topicId": "songs"
  },
  {
    "id": "wk4KHNJjpjQ",
    "title": "Twinkle Twinkle Little Star and More",
    "channel": "Super Simple Songs - Kids Songs",
    "language": "en",
    "topicId": "songs"
  },
  {
    "id": "frN3nvhIHUk",
    "title": "Do You Like Broccoli Ice Cream?",
    "channel": "Super Simple Songs - Kids Songs",
    "language": "en",
    "topicId": "songs"
  },
  {
    "id": "-Z95SxV8PZc",
    "title": "Rain Rain Go Away and More",
    "channel": "ChuChu TV Nursery Rhymes & Kids Songs",
    "language": "en",
    "topicId": "songs"
  },
  {
    "id": "XhpGp9d9jSA",
    "title": "Badanamu - Super Hits",
    "channel": "Badanamu",
    "language": "en",
    "topicId": "songs"
  },
  {
    "id": "8deypue7SdQ",
    "title": "Ball Pit Party",
    "channel": "Bounce Patrol - Kids Songs",
    "language": "en",
    "topicId": "songs"
  },
  {
    "id": "1XPgV_Z71M0",
    "title": "Sofia the First - We Have to Be Friends",
    "channel": "Disney Jr.",
    "language": "en",
    "topicId": "songs",
    "durationLabel": "1:52"
  },
  {
    "id": "NI1Itabkzqc",
    "title": "Gabby's Dollhouse - Cat of the Day",
    "channel": "Netflix Jr.",
    "language": "en",
    "topicId": "songs",
    "durationLabel": "13:19"
  },
  {
    "id": "Zkd88Aa94ac",
    "title": "Sing and Sing 2 - Pop Songs",
    "channel": "Mini Moments",
    "language": "en",
    "topicId": "songs",
    "durationLabel": "14:56"
  },
  {
    "id": "fT-ciS7dk-U",
    "title": "PAW Patrol - Rocky's Runaway Box Fort",
    "channel": "PAW Patrol Official & Friends",
    "language": "en",
    "topicId": "adventures"
  },
  {
    "id": "bdNbUw5FIQo",
    "title": "Baby Shark and 99 Friends",
    "channel": "Baby Shark Official",
    "language": "en",
    "topicId": "adventures"
  },
  {
    "id": "RIWRqjcbJcs",
    "title": "Morphle - Colors",
    "channel": "Morphle’s Magic Universe - Kids Cartoon",
    "language": "en",
    "topicId": "adventures"
  },
  {
    "id": "DoULakpoynA",
    "title": "Talking Tom and Friends - Unusual Events",
    "channel": "Talking Tom & Friends TV",
    "language": "en",
    "topicId": "adventures"
  }
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
