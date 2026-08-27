import { mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const standard = (surname) => [
  `Delayed ${surname}`,
  `Jailed ${surname}`,
  `${surname}`,
  `Saint ${surname}`,
  `God ${surname}`,
  `Ancestor ${surname}`,
];

const LIANG_MEME_THUMB = 'https://raw.githubusercontent.com/cholf5/liang-slider/main/img/thumb.png';

const people = [
  { id: 'liang', avatarIndex: 0, avatarUrl: LIANG_MEME_THUMB, name: 'Liang Wenfeng', role: 'DeepSeek', ranks: standard('Liang') },
  { id: 'musk', avatarIndex: 1, name: 'Elon Musk', role: 'xAI / Tesla / SpaceX', ranks: standard('Musk') },
  { id: 'altman', avatarIndex: 2, name: 'Sam Altman', role: 'OpenAI', ranks: standard('Altman') },
  { id: 'tibo', avatarIndex: 3, name: 'Tibo Sottiaux', role: 'Codex', ranks: standard('Tibo') },
  { id: 'huang', avatarIndex: 4, name: 'Jensen Huang', role: 'NVIDIA', ranks: standard('Huang') },
  { id: 'zuck', avatarIndex: 5, name: 'Mark Zuckerberg', role: 'Meta', ranks: standard('Zuck') },
  { id: 'dario', avatarIndex: 6, name: 'Dario Amodei', role: 'Anthropic', ranks: standard('Dario') },
  { id: 'demis', avatarIndex: 7, name: 'Demis Hassabis', role: 'Google DeepMind', ranks: standard('Hassabis') },
];

const outputDir = path.resolve('public/share-cards');
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function fetchPngData(url) {
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': 'awesome-fame-slider-share-card-builder/1.0' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    return bytes.toString('base64');
  } catch (error) {
    console.warn(`Could not fetch ${url}; falling back to the local illustrated avatar.`, error);
    return null;
  }
}

const avatarSprite = await readFile(path.resolve('public/avatars.svg'));
const avatarData = avatarSprite.toString('base64');
const liangMemeData = await fetchPngData(LIANG_MEME_THUMB);

function memeAvatar(person, x, y, size) {
  if (person.id === 'liang' && liangMemeData) {
    return `<image x="${x}" y="${y}" width="${size}" height="${size}" href="data:image/png;base64,${liangMemeData}" preserveAspectRatio="xMidYMid meet" />`;
  }

  const avatarViewX = person.avatarIndex * 256;
  return `
    <svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${avatarViewX} 0 256 256">
      <image
        x="0"
        y="0"
        width="2048"
        height="256"
        href="data:image/svg+xml;base64,${avatarData}"
        preserveAspectRatio="none"
      />
    </svg>`;
}

function liangCard(person, rank) {
  const dots = Array.from({ length: 6 }, (_, index) => {
    const x = 100 + index * 170;
    const selected = index === rank;
    return `
      <circle cx="${x}" cy="438" r="${selected ? 24 : 13}" fill="${selected ? '#8f271d' : '#a9987c'}" stroke="#171717" stroke-width="${selected ? 6 : 3}" />
      ${selected ? `<circle cx="${x}" cy="438" r="36" fill="none" stroke="#d7a13b" stroke-width="5" opacity=".9" />` : ''}
    `;
  }).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
      <defs>
        <pattern id="paper-lines" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M0 23.5H24" stroke="#8b7252" stroke-width="1" opacity=".08" />
        </pattern>
      </defs>
      <rect width="1200" height="675" fill="#eadcc0" />
      <rect width="1200" height="675" fill="url(#paper-lines)" />
      <rect x="28" y="28" width="1144" height="619" fill="none" stroke="#171717" stroke-width="10" />
      <rect x="55" y="55" width="670" height="48" rx="4" fill="#171717" />
      <text x="78" y="90" font-family="DejaVu Sans, Arial, sans-serif" font-size="27" font-weight="800" fill="#f0dfbd" letter-spacing="2">SLIDE RHEOSTAT / LIANG MEME METER</text>

      <text x="72" y="190" font-family="DejaVu Sans, Arial, sans-serif" font-size="70" font-weight="900" fill="#171717">${escapeXml(person.name)}</text>
      <text x="75" y="235" font-family="DejaVu Sans, Arial, sans-serif" font-size="29" font-weight="700" fill="#5f5546">${escapeXml(person.role)} · INTERNET STATUS RHEOSTAT</text>
      <path d="M70 270 H740" stroke="#171717" stroke-width="8" stroke-linecap="square" />
      <text x="72" y="362" font-family="DejaVu Sans, Arial, sans-serif" font-size="78" font-weight="900" fill="#8f271d">${escapeXml(person.ranks[rank])}</text>
      <text x="75" y="399" font-family="DejaVu Sans Mono, monospace" font-size="20" font-weight="700" fill="#6b5c48" letter-spacing="2">THE KNOB MOVES. THE REPUTATION MOVES.</text>

      <line x1="100" y1="438" x2="950" y2="438" stroke="#4a3626" stroke-width="14" stroke-linecap="round" />
      ${dots}

      <circle cx="1015" cy="220" r="144" fill="#cdbb98" opacity=".7" />
      ${memeAvatar(person, 850, 58, 330)}
      <text x="1014" y="402" text-anchor="middle" font-family="DejaVu Sans Mono, monospace" font-size="18" font-weight="800" fill="#6b5c48">ORIGINAL MEME KNOB</text>

      <text x="72" y="545" font-family="DejaVu Sans Mono, monospace" font-size="26" font-weight="900" fill="#171717">RANK ${rank + 1} / 6</text>
      <text x="72" y="588" font-family="DejaVu Sans, Arial, sans-serif" font-size="20" font-weight="700" fill="#6b5c48">SOURCE VISUAL: cholf5/liang-slider · parody / internet sentiment</text>
      <text x="1125" y="585" text-anchor="end" font-family="DejaVu Sans, Arial, sans-serif" font-size="22" font-weight="900" fill="#171717">CAST YOUR VERDICT →</text>
    </svg>`;
}

function standardCard(person, rank) {
  const avatarViewX = person.avatarIndex * 256;
  const dots = Array.from({ length: 6 }, (_, index) => {
    const x = 110 + index * 196;
    const radius = index === rank ? 27 : 13;
    const fill = index === rank ? '#171717' : '#a8987c';
    return `<circle cx="${x}" cy="395" r="${radius}" fill="${fill}" />`;
  }).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
      <rect width="1200" height="675" fill="#eee3cf" />
      <rect x="36" y="36" width="1128" height="603" fill="none" stroke="#171717" stroke-width="8" />
      <text x="76" y="105" font-family="DejaVu Sans, Arial, sans-serif" font-size="34" font-weight="700" fill="#171717" letter-spacing="2">SLIDE RHEOSTAT / REPUTATION METER</text>

      <circle cx="1030" cy="190" r="106" fill="#cdbd9f" />
      <svg x="932" y="92" width="196" height="196" viewBox="${avatarViewX} 0 256 256">
        <image
          x="0"
          y="0"
          width="2048"
          height="256"
          href="data:image/svg+xml;base64,${avatarData}"
          preserveAspectRatio="none"
        />
      </svg>

      <text x="76" y="205" font-family="DejaVu Sans, Arial, sans-serif" font-size="70" font-weight="800" fill="#171717">${escapeXml(person.name)}</text>
      <text x="78" y="252" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" font-weight="500" fill="#625948">${escapeXml(person.role)}</text>

      <line x1="95" y1="395" x2="1105" y2="395" stroke="#402b1f" stroke-width="18" stroke-linecap="round" />
      ${dots}

      <text x="76" y="535" font-family="DejaVu Sans, Arial, sans-serif" font-size="78" font-weight="900" fill="#171717">${escapeXml(person.ranks[rank])}</text>
      <text x="80" y="582" font-family="DejaVu Sans, Arial, sans-serif" font-size="28" font-weight="700" fill="#625948">YOUR VERDICT</text>
      <text x="1115" y="575" text-anchor="end" font-family="DejaVu Sans Mono, monospace" font-size="28" font-weight="700" fill="#171717">RANK ${rank + 1} / 6</text>
    </svg>`;
}

for (const person of people) {
  for (let rank = 0; rank < 6; rank += 1) {
    const svg = person.id === 'liang' ? liangCard(person, rank) : standardCard(person, rank);
    await sharp(Buffer.from(svg), { density: 144 }).png().toFile(path.join(outputDir, `${person.id}-${rank}.png`));
  }
}

console.log(`Generated ${people.length * 6} share cards in ${outputDir}`);
