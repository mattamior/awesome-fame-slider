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

const people = [
  { id: 'liang', avatarIndex: 0, name: 'Liang Wenfeng', role: 'DeepSeek', ranks: standard('Liang') },
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

const avatarSprite = await readFile(path.resolve('public/avatars.svg'));
const avatarData = avatarSprite.toString('base64');

for (const person of people) {
  const avatarViewX = person.avatarIndex * 256;

  for (let rank = 0; rank < 6; rank += 1) {
    const dots = Array.from({ length: 6 }, (_, index) => {
      const x = 110 + index * 196;
      const radius = index === rank ? 27 : 13;
      const fill = index === rank ? '#171717' : '#a8987c';
      return `<circle cx="${x}" cy="395" r="${radius}" fill="${fill}" />`;
    }).join('');

    const svg = `
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

    await sharp(Buffer.from(svg), { density: 144 }).png().toFile(path.join(outputDir, `${person.id}-${rank}.png`));
  }
}

console.log(`Generated ${people.length * 6} share cards in ${outputDir}`);
