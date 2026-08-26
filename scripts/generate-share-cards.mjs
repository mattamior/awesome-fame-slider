import { mkdir, rm } from 'node:fs/promises';
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
  { id: 'liang', name: 'Liang Wenfeng', role: 'DeepSeek', ranks: standard('Liang') },
  { id: 'musk', name: 'Elon Musk', role: 'xAI / Tesla / SpaceX', ranks: standard('Musk') },
  { id: 'altman', name: 'Sam Altman', role: 'OpenAI', ranks: standard('Altman') },
  { id: 'tibo', name: 'Tibo Sottiaux', role: 'Codex', ranks: standard('Tibo') },
  { id: 'huang', name: 'Jensen Huang', role: 'NVIDIA', ranks: standard('Huang') },
  { id: 'zuck', name: 'Mark Zuckerberg', role: 'Meta', ranks: standard('Zuck') },
  { id: 'dario', name: 'Dario Amodei', role: 'Anthropic', ranks: standard('Dario') },
  { id: 'demis', name: 'Demis Hassabis', role: 'Google DeepMind', ranks: standard('Hassabis') },
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

for (const person of people) {
  for (let rank = 0; rank < 6; rank += 1) {
    const selectedX = 110 + rank * 196;
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
        <text x="76" y="205" font-family="DejaVu Sans, Arial, sans-serif" font-size="70" font-weight="800" fill="#171717">${escapeXml(person.name)}</text>
        <text x="78" y="252" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" font-weight="500" fill="#625948">${escapeXml(person.role)}</text>
        <line x1="95" y1="395" x2="1105" y2="395" stroke="#402b1f" stroke-width="18" stroke-linecap="round" />
        ${dots}
        <text x="76" y="535" font-family="DejaVu Sans, Arial, sans-serif" font-size="78" font-weight="900" fill="#171717">${escapeXml(person.ranks[rank])}</text>
        <text x="80" y="582" font-family="DejaVu Sans, Arial, sans-serif" font-size="28" font-weight="700" fill="#625948">YOUR VERDICT</text>
        <text x="1115" y="575" text-anchor="end" font-family="DejaVu Sans Mono, monospace" font-size="28" font-weight="700" fill="#171717">RANK ${rank + 1} / 6</text>
      </svg>`;

    await sharp(Buffer.from(svg)).png().toFile(path.join(outputDir, `${person.id}-${rank}.png`));
  }
}

console.log(`Generated ${people.length * 6} share cards in ${outputDir}`);
