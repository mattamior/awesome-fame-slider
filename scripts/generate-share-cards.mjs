import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const NOTO_REV = 'f8d157532fbfaeda587e826d4cd5b21a49186f7c';
const FONT_URL = `https://raw.githubusercontent.com/notofonts/noto-cjk/${NOTO_REV}/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Bold.otf`;
const fontDir = path.resolve('.cache/share-card-fonts');
const fontCacheDir = path.join(fontDir, 'cache');
const fontPath = path.join(fontDir, 'NotoSansCJKsc-Bold.otf');
const fontConfigPath = path.join(fontDir, 'fonts.conf');

await mkdir(fontCacheDir, { recursive: true });

async function fetchBuffer(url, label) {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch(url, {
      headers: { 'user-agent': 'awesome-fame-slider-share-card-builder/2.0 (public social-card build)' },
    });
    if (response.ok) return Buffer.from(await response.arrayBuffer());
    if ((response.status !== 429 && response.status < 500) || attempt === 4) {
      throw new Error(`Could not fetch ${label} ${url}: HTTP ${response.status}`);
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
  }
  throw new Error(`Could not fetch ${label} ${url}`);
}

try {
  await access(fontPath);
} catch {
  await writeFile(fontPath, await fetchBuffer(FONT_URL, 'share-card font'));
}

await writeFile(fontConfigPath, `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${fontDir}</dir>
  <cachedir>${fontCacheDir}</cachedir>
  <config></config>
</fontconfig>
`);
process.env.FONTCONFIG_PATH = fontDir;
process.env.FONTCONFIG_FILE = fontConfigPath;

const { default: sharp } = await import('sharp');

const standard = (surnameZh, surnameEn) => [
  { zh: `小难${surnameZh}`, en: `Delayed ${surnameEn}` },
  { zh: `牢${surnameZh}`, en: `Jailed ${surnameEn}` },
  { zh: `${surnameZh}子`, en: `${surnameEn}` },
  { zh: `${surnameZh}圣`, en: `Saint ${surnameEn}` },
  { zh: `${surnameZh}神`, en: `God ${surnameEn}` },
  { zh: `${surnameZh}祖`, en: `Ancestor ${surnameEn}` },
];

const BIANZU_REV = '3f6f20fd260dd791e0a2ccd4676db1e47f793fa0';
const bianzu = (id, files) => files.map((file) => `https://raw.githubusercontent.com/makerjackie/bianzu/${BIANZU_REV}/public/ranks/${id}/${file}`);
const LIANG_RANK_IMAGES = bianzu('liang', ['y-00-nan.webp', 'y-02-lao.webp', 'y2-03-zi.webp', 'y-04-saint.webp', 'y-05-god.webp', 'y-06-zu.webp']);
const TIBO_RANK_IMAGES = bianzu('tibo', ['y-00-nan.webp', 'y-02-lao.webp', 'y-03-zi.webp', 'y-04-saint.webp', 'y-05-god.webp', 'y-06-zu.webp']);
const MUSK_RANK_IMAGES = bianzu('musk', ['v2-00-nan.webp', 'v1-02-lao.webp', 'v1-03-zi.webp', 'v1-04-saint.webp', 'v1-05-god.webp', 'v1-06-ancestor.webp']);
const HUANG_RANK_IMAGES = ['https://i.imgflip.com/8fdvq3.png', 'https://i.imgflip.com/619cwz.png', 'https://i.imgflip.com/9fxjcj.png', 'https://i.imgflip.com/4eh9y9.jpg', 'https://i.imgflip.com/9fvflj.jpg', 'https://i.imgflip.com/8z7k4x.png'];
const ZUCK_RANK_IMAGES = ['https://i.kym-cdn.com/photos/images/original/001/875/863/04d.png', 'https://i.kym-cdn.com/photos/images/original/001/361/248/ce2.jpeg', 'https://i.imgflip.com/37gc2f.png', 'https://i.imgflip.com/4g9c0h.jpg', 'https://i.imgflip.com/7s77r8.jpg', 'https://i.imgflip.com/66fabj.jpg'];
const ALTMAN_RANK_IMAGES = ['https://i.imgflip.com/86zdzo.png', 'https://i.imgflip.com/86ojl6.png', 'https://i.imgflip.com/80n9l4.jpg', 'https://i.imgflip.com/aetmra.png', 'https://i.imgflip.com/9ghfcx.png', 'https://i.imgflip.com/a2cbqu.jpg'];
const DARIO_RANK_IMAGES = ['https://i.imgflip.com/2/aw0dpn.jpg', 'https://i.imgflip.com/ao4swp.png', 'https://i.imgflip.com/2/apqq2f.jpg', 'https://i.imgflip.com/2/avgcsc.jpg', 'https://i.imgflip.com/attuh6.png', 'https://i.imgflip.com/am7eh2.jpg'];
const DEMIS_RANK_IMAGES = ['https://i.ytimg.com/vi/vcLU0DhDhi0/hqdefault.jpg', 'https://i.ytimg.com/vi/Gfr50f6ZBvo/hqdefault.jpg', 'https://i.ytimg.com/vi/DsewHeVbL-0/hqdefault.jpg', 'https://i.ytimg.com/vi/AJf23bIjS8w/hqdefault.jpg', 'https://i.ytimg.com/vi/nkb4qEuxoJc/hqdefault.jpg', 'https://i.ytimg.com/vi/-HzgcbRXUK8/hqdefault.jpg'];

const people = [
  { id: 'liang', rankImageUrls: LIANG_RANK_IMAGES, sourceLabel: 'makerjackie/bianzu · liang', name: 'Liang Wenfeng', nameZh: '梁文锋', role: 'DeepSeek', ranks: standard('梁', 'Liang') },
  { id: 'musk', rankImageUrls: MUSK_RANK_IMAGES, sourceLabel: 'makerjackie/bianzu · musk', name: 'Elon Musk', nameZh: '马斯克', role: 'xAI / Tesla / SpaceX', ranks: standard('马', 'Musk') },
  { id: 'altman', rankImageUrls: ALTMAN_RANK_IMAGES, sourceLabel: 'Imgflip · Sam Altman meme templates', name: 'Sam Altman', nameZh: '奥特曼', role: 'OpenAI', ranks: standard('奥', 'Altman') },
  { id: 'tibo', rankImageUrls: TIBO_RANK_IMAGES, sourceLabel: 'makerjackie/bianzu · tibo', name: 'Tibo Sottiaux', nameZh: 'Tibo', role: 'Codex', ranks: standard('Tibo', 'Tibo') },
  { id: 'huang', rankImageUrls: HUANG_RANK_IMAGES, sourceLabel: 'Imgflip · Jensen Huang meme templates', name: 'Jensen Huang', nameZh: '黄仁勋', role: 'NVIDIA', ranks: standard('黄', 'Huang') },
  { id: 'zuck', rankImageUrls: ZUCK_RANK_IMAGES, sourceLabel: 'Know Your Meme + Imgflip · Zuckerberg memes', name: 'Mark Zuckerberg', nameZh: '扎克伯格', role: 'Meta', ranks: standard('扎', 'Zuck') },
  { id: 'dario', rankImageUrls: DARIO_RANK_IMAGES, sourceLabel: 'Imgflip · Dario Amodei / Anthropic memes', name: 'Dario Amodei', nameZh: 'Dario', role: 'Anthropic', ranks: standard('Dario', 'Dario') },
  { id: 'demis', rankImageUrls: DEMIS_RANK_IMAGES, sourceLabel: 'YouTube · Demis Hassabis interview frames', name: 'Demis Hassabis', nameZh: '哈萨比斯', role: 'Google DeepMind', ranks: standard('哈', 'Hassabis') },
];

const outputDir = path.resolve('public/share-cards');
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function fetchImagePngData(url) {
  return sharp(await fetchBuffer(url, 'meme asset')).png().toBuffer().then((buffer) => buffer.toString('base64'));
}

const rankImageData = new Map();
for (const person of people) {
  const images = [];
  for (const url of person.rankImageUrls) images.push(await fetchImagePngData(url));
  rankImageData.set(person.id, images);
}

function memeAvatar(person, rank, x, y, size) {
  const data = rankImageData.get(person.id)?.[rank];
  if (!data) throw new Error(`Missing rank image data for ${person.id} rank ${rank}`);
  return `<image x="${x}" y="${y}" width="${size}" height="${size}" href="data:image/png;base64,${data}" preserveAspectRatio="xMidYMid meet" />`;
}

function cardCopy(person, rank, locale) {
  if (locale === 'zh') {
    return {
      brand: `弟位变祖器 / ${person.id.toUpperCase()} 梗图刻度`,
      name: person.nameZh,
      subtitle: `${person.role} · 互联网弟位滑杆`,
      verdict: person.ranks[rank].zh,
      motion: '旋钮在动，脸也在动。',
      rank: `第 ${rank + 1} / 6 档`,
      source: `图源：${person.sourceLabel} · 戏仿 / 网络情绪`,
      cta: '投出你的判定 →',
      portrait: '当前档位梗图',
    };
  }
  return {
    brand: `AWESOME FAME SLIDER / ${person.id.toUpperCase()} MEME METER`,
    name: person.name,
    subtitle: `${person.role} · INTERNET STATUS RHEOSTAT`,
    verdict: person.ranks[rank].en,
    motion: 'THE KNOB MOVES. THE FACE MOVES.',
    rank: `RANK ${rank + 1} / 6`,
    source: `VISUAL SET: ${person.sourceLabel} · parody / internet sentiment`,
    cta: 'CAST YOUR VERDICT →',
    portrait: 'RANK-SPECIFIC MEME PORTRAIT',
  };
}

function memeCard(person, rank, locale) {
  const copy = cardCopy(person, rank, locale);
  const fontFamily = 'Noto Sans CJK SC, sans-serif';
  const dots = Array.from({ length: 6 }, (_, index) => {
    const x = 100 + index * 170;
    const selected = index === rank;
    return `<circle cx="${x}" cy="438" r="${selected ? 24 : 13}" fill="${selected ? '#8f271d' : '#a9987c'}" stroke="#171717" stroke-width="${selected ? 6 : 3}" />${selected ? `<circle cx="${x}" cy="438" r="36" fill="none" stroke="#d7a13b" stroke-width="5" opacity=".9" />` : ''}`;
  }).join('');
  const brandSize = locale === 'zh' ? 32 : 27;
  const nameSize = locale === 'zh' ? 72 : 70;
  const verdictSize = locale === 'zh' ? 82 : 78;
  const motionSize = locale === 'zh' ? 24 : 20;
  const portraitSize = locale === 'zh' ? 22 : 18;
  const rankSize = locale === 'zh' ? 30 : 26;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
    <defs><pattern id="paper-lines" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M0 23.5H24" stroke="#8b7252" stroke-width="1" opacity=".08" /></pattern></defs>
    <rect width="1200" height="675" fill="#eadcc0"/>
    <rect width="1200" height="675" fill="url(#paper-lines)"/>
    <rect x="28" y="28" width="1144" height="619" fill="none" stroke="#171717" stroke-width="10"/>
    <rect x="55" y="55" width="670" height="48" rx="4" fill="#171717"/>
    <text x="78" y="90" font-family="${fontFamily}" font-size="${brandSize}" font-weight="800" fill="#f0dfbd" letter-spacing="${locale === 'zh' ? 1 : 2}">${escapeXml(copy.brand)}</text>
    <text x="72" y="190" font-family="${fontFamily}" font-size="${nameSize}" font-weight="900" fill="#171717">${escapeXml(copy.name)}</text>
    <text x="75" y="235" font-family="${fontFamily}" font-size="29" font-weight="700" fill="#5f5546">${escapeXml(copy.subtitle)}</text>
    <path d="M70 270 H740" stroke="#171717" stroke-width="8"/>
    <text x="72" y="362" font-family="${fontFamily}" font-size="${verdictSize}" font-weight="900" fill="#8f271d">${escapeXml(copy.verdict)}</text>
    <text x="75" y="399" font-family="${fontFamily}" font-size="${motionSize}" font-weight="700" fill="#6b5c48" letter-spacing="${locale === 'zh' ? 1 : 2}">${escapeXml(copy.motion)}</text>
    <line x1="100" y1="438" x2="950" y2="438" stroke="#4a3626" stroke-width="14" stroke-linecap="round"/>
    ${dots}
    <circle cx="1015" cy="220" r="144" fill="#cdbb98" opacity=".7"/>
    ${memeAvatar(person, rank, 850, 58, 330)}
    <text x="1014" y="402" text-anchor="middle" font-family="${fontFamily}" font-size="${portraitSize}" font-weight="800" fill="#6b5c48">${escapeXml(copy.portrait)}</text>
    <text x="72" y="545" font-family="${fontFamily}" font-size="${rankSize}" font-weight="900" fill="#171717">${escapeXml(copy.rank)}</text>
    <text x="72" y="588" font-family="${fontFamily}" font-size="20" font-weight="700" fill="#6b5c48">${escapeXml(copy.source)}</text>
    <text x="1125" y="585" text-anchor="end" font-family="${fontFamily}" font-size="22" font-weight="900" fill="#171717">${escapeXml(copy.cta)}</text>
  </svg>`;
}

let generated = 0;
for (const person of people) {
  for (let rank = 0; rank < 6; rank += 1) {
    for (const locale of ['en', 'zh']) {
      const suffix = locale === 'zh' ? '-zh' : '';
      const outputPath = path.join(outputDir, `${person.id}-${rank}${suffix}.png`);
      await sharp(Buffer.from(memeCard(person, rank, locale)), { density: 144 })
        .resize(1200, 675, { fit: 'fill' })
        .png()
        .toFile(outputPath);
      const metadata = await sharp(outputPath).metadata();
      if (metadata.format !== 'png' || metadata.width !== 1200 || metadata.height !== 675) {
        throw new Error(`Generated ${path.basename(outputPath)} as ${metadata.format} ${metadata.width}x${metadata.height}; expected png 1200x675`);
      }
      generated += 1;
    }
  }
}

if (generated !== people.length * 6 * 2) throw new Error(`Generated ${generated} cards; expected ${people.length * 6 * 2}`);
console.log(`Generated ${generated} localized share cards in ${outputDir}`);
