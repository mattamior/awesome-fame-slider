export type Rank = { id: string; zh: string; en: string };
export type Person = {
  id: string;
  name: string;
  nameZh: string;
  role: string;
  accent: string;
  avatarIndex: number;
  avatarUrl?: string;
  rankImageUrls?: readonly string[];
  avatarSourceUrl?: string;
  ranks: Rank[];
};

const standard = (surname: string): Rank[] => [
  { id: 'delay', zh: `小难${surname}`, en: `Delayed ${surname}` },
  { id: 'jail', zh: `牢${surname}`, en: `Jailed ${surname}` },
  { id: 'guy', zh: `${surname}子`, en: `${surname}` },
  { id: 'saint', zh: `${surname}圣`, en: `Saint ${surname}` },
  { id: 'god', zh: `${surname}神`, en: `God ${surname}` },
  { id: 'ancestor', zh: `${surname}祖`, en: `Ancestor ${surname}` },
];

const BIANZU_REV = '3f6f20fd260dd791e0a2ccd4676db1e47f793fa0';

const LIANG_BIANZU_BASE = `https://raw.githubusercontent.com/makerjackie/bianzu/${BIANZU_REV}/public/ranks/liang`;
const LIANG_RANK_IMAGES = [
  `${LIANG_BIANZU_BASE}/y-00-nan.webp`, `${LIANG_BIANZU_BASE}/y-02-lao.webp`, `${LIANG_BIANZU_BASE}/y2-03-zi.webp`,
  `${LIANG_BIANZU_BASE}/y-04-saint.webp`, `${LIANG_BIANZU_BASE}/y-05-god.webp`, `${LIANG_BIANZU_BASE}/y-06-zu.webp`,
] as const;
const LIANG_MEME_SOURCE = `https://github.com/makerjackie/bianzu/tree/${BIANZU_REV}/public/ranks/liang`;

const TIBO_BIANZU_BASE = `https://raw.githubusercontent.com/makerjackie/bianzu/${BIANZU_REV}/public/ranks/tibo`;
const TIBO_RANK_IMAGES = [
  `${TIBO_BIANZU_BASE}/y-00-nan.webp`, `${TIBO_BIANZU_BASE}/y-02-lao.webp`, `${TIBO_BIANZU_BASE}/y-03-zi.webp`,
  `${TIBO_BIANZU_BASE}/y-04-saint.webp`, `${TIBO_BIANZU_BASE}/y-05-god.webp`, `${TIBO_BIANZU_BASE}/y-06-zu.webp`,
] as const;
const TIBO_MEME_SOURCE = `https://github.com/makerjackie/bianzu/tree/${BIANZU_REV}/public/ranks/tibo`;

const MUSK_BIANZU_BASE = `https://raw.githubusercontent.com/makerjackie/bianzu/${BIANZU_REV}/public/ranks/musk`;
const MUSK_RANK_IMAGES = [
  `${MUSK_BIANZU_BASE}/v2-00-nan.webp`, `${MUSK_BIANZU_BASE}/v1-02-lao.webp`, `${MUSK_BIANZU_BASE}/v1-03-zi.webp`,
  `${MUSK_BIANZU_BASE}/v1-04-saint.webp`, `${MUSK_BIANZU_BASE}/v1-05-god.webp`, `${MUSK_BIANZU_BASE}/v1-06-ancestor.webp`,
] as const;
const MUSK_MEME_SOURCE = `https://github.com/makerjackie/bianzu/tree/${BIANZU_REV}/public/ranks/musk`;

const HUANG_RANK_IMAGES = ['https://i.imgflip.com/8fdvq3.png','https://i.imgflip.com/619cwz.png','https://i.imgflip.com/9fxjcj.png','https://i.imgflip.com/4eh9y9.jpg','https://i.imgflip.com/9fvflj.jpg','https://i.imgflip.com/8z7k4x.png'] as const;
const HUANG_MEME_SOURCE = 'https://imgflip.com/memetemplates?q=jensen%20huang';
const ZUCK_RANK_IMAGES = ['https://i.kym-cdn.com/photos/images/original/001/875/863/04d.png','https://i.kym-cdn.com/photos/images/original/001/361/248/ce2.jpeg','https://i.imgflip.com/37gc2f.png','https://i.imgflip.com/4g9c0h.jpg','https://i.imgflip.com/7s77r8.jpg','https://i.imgflip.com/66fabj.jpg'] as const;
const ZUCK_MEME_SOURCE = 'https://imgflip.com/memetemplates?q=mark%20zuckerberg';
const ALTMAN_RANK_IMAGES = ['https://i.imgflip.com/86zdzo.png','https://i.imgflip.com/86ojl6.png','https://i.imgflip.com/80n9l4.jpg','https://i.imgflip.com/aetmra.png','https://i.imgflip.com/9ghfcx.png','https://i.imgflip.com/a2cbqu.jpg'] as const;
const ALTMAN_MEME_SOURCE = 'https://imgflip.com/memetemplates?q=sam%20altman';

// Existing Dario/Anthropic internet meme frames. The first five are public Imgflip
// templates; the sixth is an existing Imgflip meme about Amodei's AI-risk commentary.
const DARIO_RANK_IMAGES = [
  'https://i.imgflip.com/2/aw0dpn.jpg',
  'https://i.imgflip.com/ao4swp.png',
  'https://i.imgflip.com/2/apqq2f.jpg',
  'https://i.imgflip.com/2/avgcsc.jpg',
  'https://i.imgflip.com/attuh6.png',
  'https://i.imgflip.com/am7eh2.jpg',
] as const;
const DARIO_MEME_SOURCE = 'https://imgflip.com/memetemplates?q=dario%20amodei';

export const PEOPLE: Person[] = [
  { id:'liang', name:'Liang Wenfeng', nameZh:'梁文锋', role:'DeepSeek', accent:'梁', avatarIndex:0, avatarUrl:LIANG_RANK_IMAGES[2], rankImageUrls:LIANG_RANK_IMAGES, avatarSourceUrl:LIANG_MEME_SOURCE, ranks:standard('梁') },
  { id:'musk', name:'Elon Musk', nameZh:'马斯克', role:'xAI · Tesla · SpaceX', accent:'马', avatarIndex:1, avatarUrl:MUSK_RANK_IMAGES[2], rankImageUrls:MUSK_RANK_IMAGES, avatarSourceUrl:MUSK_MEME_SOURCE, ranks:standard('马') },
  { id:'altman', name:'Sam Altman', nameZh:'奥特曼', role:'OpenAI', accent:'奥', avatarIndex:2, avatarUrl:ALTMAN_RANK_IMAGES[2], rankImageUrls:ALTMAN_RANK_IMAGES, avatarSourceUrl:ALTMAN_MEME_SOURCE, ranks:standard('奥') },
  { id:'tibo', name:'Tibo Sottiaux', nameZh:'Tibo', role:'Codex', accent:'T', avatarIndex:3, avatarUrl:TIBO_RANK_IMAGES[2], rankImageUrls:TIBO_RANK_IMAGES, avatarSourceUrl:TIBO_MEME_SOURCE, ranks:standard('Tibo') },
  { id:'huang', name:'Jensen Huang', nameZh:'黄仁勋', role:'NVIDIA', accent:'黄', avatarIndex:4, avatarUrl:HUANG_RANK_IMAGES[2], rankImageUrls:HUANG_RANK_IMAGES, avatarSourceUrl:HUANG_MEME_SOURCE, ranks:standard('黄') },
  { id:'zuck', name:'Mark Zuckerberg', nameZh:'扎克伯格', role:'Meta', accent:'扎', avatarIndex:5, avatarUrl:ZUCK_RANK_IMAGES[2], rankImageUrls:ZUCK_RANK_IMAGES, avatarSourceUrl:ZUCK_MEME_SOURCE, ranks:standard('扎') },
  { id:'dario', name:'Dario Amodei', nameZh:'Dario', role:'Anthropic', accent:'D', avatarIndex:6, avatarUrl:DARIO_RANK_IMAGES[2], rankImageUrls:DARIO_RANK_IMAGES, avatarSourceUrl:DARIO_MEME_SOURCE, ranks:standard('Dario') },
  { id:'demis', name:'Demis Hassabis', nameZh:'哈萨比斯', role:'Google DeepMind', accent:'哈', avatarIndex:7, ranks:standard('哈') },
];

export const EMPTY_VOTES: Record<string, number[]> = Object.fromEntries(PEOPLE.map((p) => [p.id, [0,0,0,0,0,0]]));
