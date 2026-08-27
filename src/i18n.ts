import type { Person, Rank } from './data';

export type Locale = 'en' | 'zh';
export type Theme = 'light' | 'dark';

export const LOCALE_STORAGE_KEY = 'afs_locale';
export const THEME_STORAGE_KEY = 'afs_theme';

export function initialLocale(): Locale {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (fromUrl === 'zh' || fromUrl === 'en') return fromUrl;
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === 'zh' || stored === 'en') return stored;
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export function initialTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function personLabel(person: Person, locale: Locale) {
  return locale === 'zh' ? person.nameZh : person.name;
}

export function rankLabel(rank: Rank, locale: Locale) {
  return locale === 'zh' ? rank.zh : rank.en;
}

export const UI = {
  en: {
    eyebrow: 'REPUTATION RHEOSTAT',
    dek: 'Pick a person. Slide their status. Cast your vote. Share the verdict.',
    people: 'People',
    subject: 'SUBJECT',
    memeSource: 'Meme image sources ↗',
    communityNow: 'COMMUNITY NOW',
    liveUnavailable: 'live results unavailable',
    anonymousVotes: (total: number) => `${total} anonymous vote${total === 1 ? '' : 's'}`,
    rankTag: (rank: number, label: string) => `RANK ${rank + 1} / 6 · ${label}`,
    sliderLabel: 'Reputation rank',
    yourVerdict: 'YOUR VERDICT',
    castVote: 'Cast vote',
    savingVote: 'Saving vote…',
    shareToX: 'Share to X',
    preparingImage: 'Preparing image…',
    currentDistribution: 'Current vote distribution',
    live: 'LIVE',
    offline: 'OFFLINE',
    resultsUnavailable: 'Live voting data could not be loaded. No sample votes are shown.',
    fine: 'Voting happens on this site, not through the X API. One anonymous browser device keeps one active vote per person; voting again updates it. Network rate limits discourage rapid repeat submissions. Sharing never changes the vote, and every selected rank has its own share image.',
    footer: 'Parody / internet sentiment toy. Meme imagery is used for parody/transformative internet culture commentary. Not affiliated with the people or companies shown.',
    openedShare: 'You opened a shared verdict. Slide it and cast your own vote.',
    rateLimited: 'Too many vote changes from this network. Try again in about 10 minutes.',
    voteSaved: (label: string) => `Vote saved: ${label}. Sharing to X is optional and does not affect your vote.`,
    voteFailed: 'Could not save your vote. Nothing was changed.',
    preparingSelected: 'Preparing your selected image…',
    nativeShared: 'Share sheet opened with your selected image attached. Choose X to publish it.',
    copiedImage: 'X composer opened. Your selected image is copied — paste it with Ctrl/⌘+V. The shared link also uses this same image card.',
    configuredImage: 'X composer opened. The shared link is configured to render your selected image card.',
    fallbackShare: 'X composer opened. The shared URL still points to the image card for your selected rank.',
    languageButton: '中文',
    languageAria: 'Switch to Chinese',
    lightTheme: 'Light',
    darkTheme: 'Dark',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
    shareTitle: (person: Person, rank: Rank) => `${rank.en} · ${person.name}`,
    shareText: (person: Person, rank: Rank) => `My vote for ${person.name}: ${rank.zh} (${rank.en}). What's your verdict?`,
  },
  zh: {
    eyebrow: '声望滑动变阻器',
    dek: '选一个人，滑动他的江湖地位，投票，再分享你的判定。',
    people: '人物',
    subject: '人物',
    memeSource: '六档梗图来源 ↗',
    communityNow: '社区当前',
    liveUnavailable: '暂时无法获取实时结果',
    anonymousVotes: (total: number) => `共 ${total} 票（匿名）`,
    rankTag: (rank: number, label: string) => `第 ${rank + 1} / 6 档 · ${label}`,
    sliderLabel: '声望档位',
    yourVerdict: '你的判定',
    castVote: '投票',
    savingVote: '正在保存…',
    shareToX: '分享到 X',
    preparingImage: '正在准备图片…',
    currentDistribution: '当前投票分布',
    live: '实时',
    offline: '离线',
    resultsUnavailable: '暂时无法加载实时投票数据，也不会显示虚构的示例票数。',
    fine: '投票直接发生在本站，不依赖 X API。每个匿名浏览器设备对每个人物只保留一张有效票，再次投票会更新原来的选择。网络级限流用于抑制快速重复提交。分享不会改变投票，每个档位都有自己对应的分享图。',
    footer: '戏仿 / 网络情绪玩具。梗图用于戏仿和互联网文化评论，与图中人物及其公司无隶属关系。',
    openedShare: '你打开了别人分享的判定。可以继续滑动并投出自己的票。',
    rateLimited: '这个网络短时间内修改投票次数过多，请大约 10 分钟后再试。',
    voteSaved: (label: string) => `已保存投票：${label}。分享到 X 是可选操作，不会影响你的票。`,
    voteFailed: '投票保存失败，没有任何数据被修改。',
    preparingSelected: '正在准备你选择的图片…',
    nativeShared: '系统分享面板已打开，并附带你选择的图片；选择 X 即可发布。',
    copiedImage: 'X 发布框已打开，所选图片也已复制到剪贴板，可用 Ctrl/⌘+V 粘贴；分享链接会使用同一张卡片。',
    configuredImage: 'X 发布框已打开，分享链接已经配置为显示你选择的图片卡片。',
    fallbackShare: 'X 发布框已打开，分享链接仍然指向你当前档位对应的图片卡片。',
    languageButton: 'EN',
    languageAria: '切换为英文',
    lightTheme: '亮色',
    darkTheme: '暗色',
    switchToLight: '切换为亮色模式',
    switchToDark: '切换为暗色模式',
    shareTitle: (person: Person, rank: Rank) => `${rank.zh} · ${person.nameZh}`,
    shareText: (person: Person, rank: Rank) => `我给${person.nameZh}的评级：${rank.zh}。你怎么看？`,
  },
} as const;
