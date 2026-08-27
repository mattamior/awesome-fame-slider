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

const LIANG_BIANZU_REV = '3f6f20fd260dd791e0a2ccd4676db1e47f793fa0';
const LIANG_BIANZU_BASE = `https://raw.githubusercontent.com/makerjackie/bianzu/${LIANG_BIANZU_REV}/public/ranks/liang`;
const LIANG_RANK_IMAGES = [
  `${LIANG_BIANZU_BASE}/y-00-nan.webp`,
  `${LIANG_BIANZU_BASE}/y-02-lao.webp`,
  `${LIANG_BIANZU_BASE}/y2-03-zi.webp`,
  `${LIANG_BIANZU_BASE}/y-04-saint.webp`,
  `${LIANG_BIANZU_BASE}/y-05-god.webp`,
  `${LIANG_BIANZU_BASE}/y-06-zu.webp`,
] as const;
const LIANG_MEME_SOURCE = `https://github.com/makerjackie/bianzu/tree/${LIANG_BIANZU_REV}/public/ranks/liang`;

export const PEOPLE: Person[] = [
  {
    id: 'liang',
    name: 'Liang Wenfeng',
    nameZh: '梁文锋',
    role: 'DeepSeek',
    accent: '梁',
    avatarIndex: 0,
    avatarUrl: LIANG_RANK_IMAGES[2],
    rankImageUrls: LIANG_RANK_IMAGES,
    avatarSourceUrl: LIANG_MEME_SOURCE,
    ranks: standard('梁'),
  },
  { id: 'musk', name: 'Elon Musk', nameZh: '马斯克', role: 'xAI · Tesla · SpaceX', accent: '马', avatarIndex: 1, ranks: standard('马') },
  { id: 'altman', name: 'Sam Altman', nameZh: '奥特曼', role: 'OpenAI', accent: '奥', avatarIndex: 2, ranks: standard('奥') },
  { id: 'tibo', name: 'Tibo Sottiaux', nameZh: 'Tibo', role: 'Codex', accent: 'T', avatarIndex: 3, ranks: standard('Tibo') },
  { id: 'huang', name: 'Jensen Huang', nameZh: '黄仁勋', role: 'NVIDIA', accent: '黄', avatarIndex: 4, ranks: standard('黄') },
  { id: 'zuck', name: 'Mark Zuckerberg', nameZh: '扎克伯格', role: 'Meta', accent: '扎', avatarIndex: 5, ranks: standard('扎') },
  { id: 'dario', name: 'Dario Amodei', nameZh: 'Dario', role: 'Anthropic', accent: 'D', avatarIndex: 6, ranks: standard('Dario') },
  { id: 'demis', name: 'Demis Hassabis', nameZh: '哈萨比斯', role: 'Google DeepMind', accent: '哈', avatarIndex: 7, ranks: standard('哈') },
];

// Never fabricate community sentiment when the API is unavailable. Zero votes render
// the neutral rank while the UI clearly marks live results as unavailable.
export const EMPTY_VOTES: Record<string, number[]> = Object.fromEntries(
  PEOPLE.map((p) => [p.id, [0, 0, 0, 0, 0, 0]]),
);
