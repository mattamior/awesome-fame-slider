import { mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const standard = (surname) => [`Delayed ${surname}`,`Jailed ${surname}`,`${surname}`,`Saint ${surname}`,`God ${surname}`,`Ancestor ${surname}`];
const BIANZU_REV='3f6f20fd260dd791e0a2ccd4676db1e47f793fa0';
const bianzu=(id,files)=>files.map((file)=>`https://raw.githubusercontent.com/makerjackie/bianzu/${BIANZU_REV}/public/ranks/${id}/${file}`);
const LIANG_RANK_IMAGES=bianzu('liang',['y-00-nan.webp','y-02-lao.webp','y2-03-zi.webp','y-04-saint.webp','y-05-god.webp','y-06-zu.webp']);
const TIBO_RANK_IMAGES=bianzu('tibo',['y-00-nan.webp','y-02-lao.webp','y-03-zi.webp','y-04-saint.webp','y-05-god.webp','y-06-zu.webp']);
const MUSK_RANK_IMAGES=bianzu('musk',['v2-00-nan.webp','v1-02-lao.webp','v1-03-zi.webp','v1-04-saint.webp','v1-05-god.webp','v1-06-ancestor.webp']);
const HUANG_RANK_IMAGES=['https://i.imgflip.com/8fdvq3.png','https://i.imgflip.com/619cwz.png','https://i.imgflip.com/9fxjcj.png','https://i.imgflip.com/4eh9y9.jpg','https://i.imgflip.com/9fvflj.jpg','https://i.imgflip.com/8z7k4x.png'];
const ZUCK_RANK_IMAGES=['https://i.kym-cdn.com/photos/images/original/001/875/863/04d.png','https://i.kym-cdn.com/photos/images/original/001/361/248/ce2.jpeg','https://i.imgflip.com/37gc2f.png','https://i.imgflip.com/4g9c0h.jpg','https://i.imgflip.com/7s77r8.jpg','https://i.imgflip.com/66fabj.jpg'];
const ALTMAN_RANK_IMAGES=['https://i.imgflip.com/86zdzo.png','https://i.imgflip.com/86ojl6.png','https://i.imgflip.com/80n9l4.jpg','https://i.imgflip.com/aetmra.png','https://i.imgflip.com/9ghfcx.png','https://i.imgflip.com/a2cbqu.jpg'];
const DARIO_RANK_IMAGES=['https://i.imgflip.com/2/aw0dpn.jpg','https://i.imgflip.com/ao4swp.png','https://i.imgflip.com/2/apqq2f.jpg','https://i.imgflip.com/2/avgcsc.jpg','https://i.imgflip.com/attuh6.png','https://i.imgflip.com/am7eh2.jpg'];
const DEMIS_RANK_IMAGES=['https://i.ytimg.com/vi/vcLU0DhDhi0/hqdefault.jpg','https://i.ytimg.com/vi/Gfr50f6ZBvo/hqdefault.jpg','https://i.ytimg.com/vi/DsewHeVbL-0/hqdefault.jpg','https://i.ytimg.com/vi/AJf23bIjS8w/hqdefault.jpg','https://i.ytimg.com/vi/nkb4qEuxoJc/hqdefault.jpg','https://i.ytimg.com/vi/-HzgcbRXUK8/hqdefault.jpg'];

const people=[
{id:'liang',avatarIndex:0,rankImageUrls:LIANG_RANK_IMAGES,sourceLabel:'makerjackie/bianzu · liang',name:'Liang Wenfeng',role:'DeepSeek',ranks:standard('Liang')},
{id:'musk',avatarIndex:1,rankImageUrls:MUSK_RANK_IMAGES,sourceLabel:'makerjackie/bianzu · musk',name:'Elon Musk',role:'xAI / Tesla / SpaceX',ranks:standard('Musk')},
{id:'altman',avatarIndex:2,rankImageUrls:ALTMAN_RANK_IMAGES,sourceLabel:'Imgflip · Sam Altman meme templates',name:'Sam Altman',role:'OpenAI',ranks:standard('Altman')},
{id:'tibo',avatarIndex:3,rankImageUrls:TIBO_RANK_IMAGES,sourceLabel:'makerjackie/bianzu · tibo',name:'Tibo Sottiaux',role:'Codex',ranks:standard('Tibo')},
{id:'huang',avatarIndex:4,rankImageUrls:HUANG_RANK_IMAGES,sourceLabel:'Imgflip · Jensen Huang meme templates',name:'Jensen Huang',role:'NVIDIA',ranks:standard('Huang')},
{id:'zuck',avatarIndex:5,rankImageUrls:ZUCK_RANK_IMAGES,sourceLabel:'Know Your Meme + Imgflip · Zuckerberg memes',name:'Mark Zuckerberg',role:'Meta',ranks:standard('Zuck')},
{id:'dario',avatarIndex:6,rankImageUrls:DARIO_RANK_IMAGES,sourceLabel:'Imgflip · Dario Amodei / Anthropic memes',name:'Dario Amodei',role:'Anthropic',ranks:standard('Dario')},
{id:'demis',avatarIndex:7,rankImageUrls:DEMIS_RANK_IMAGES,sourceLabel:'YouTube · Demis Hassabis interview frames',name:'Demis Hassabis',role:'Google DeepMind',ranks:standard('Hassabis')}];

const outputDir=path.resolve('public/share-cards');
await rm(outputDir,{recursive:true,force:true}); await mkdir(outputDir,{recursive:true});
function escapeXml(value){return value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');}
const sleep=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
async function fetchImagePngData(url){
  for(let attempt=1;attempt<=4;attempt+=1){
    const response=await fetch(url,{headers:{'user-agent':'awesome-fame-slider-share-card-builder/1.0 (public social-card build)'}});
    if(response.ok)return (await sharp(Buffer.from(await response.arrayBuffer())).png().toBuffer()).toString('base64');
    if(response.status!==429 || attempt===4)throw new Error(`Could not fetch meme asset ${url}: HTTP ${response.status}`);
    await sleep(attempt*1000);
  }
  throw new Error(`Could not fetch meme asset ${url}`);
}
const avatarData=(await readFile(path.resolve('public/avatars.svg'))).toString('base64');
const rankImageData=new Map();
for(const person of people){
  if(!person.rankImageUrls)continue;
  const images=[];
  for(const url of person.rankImageUrls)images.push(await fetchImagePngData(url));
  rankImageData.set(person.id,images);
}
function memeAvatar(person,rank,x,y,size){const data=rankImageData.get(person.id)?.[rank];if(!data)throw new Error(`Missing rank image data for ${person.id} rank ${rank}`);return `<image x="${x}" y="${y}" width="${size}" height="${size}" href="data:image/png;base64,${data}" preserveAspectRatio="xMidYMid meet" />`;}
function memeCard(person,rank){const dots=Array.from({length:6},(_,index)=>{const x=100+index*170,selected=index===rank;return `<circle cx="${x}" cy="438" r="${selected?24:13}" fill="${selected?'#8f271d':'#a9987c'}" stroke="#171717" stroke-width="${selected?6:3}" />${selected?`<circle cx="${x}" cy="438" r="36" fill="none" stroke="#d7a13b" stroke-width="5" opacity=".9" />`:''}`;}).join('');return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><defs><pattern id="paper-lines" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M0 23.5H24" stroke="#8b7252" stroke-width="1" opacity=".08" /></pattern></defs><rect width="1200" height="675" fill="#eadcc0"/><rect width="1200" height="675" fill="url(#paper-lines)"/><rect x="28" y="28" width="1144" height="619" fill="none" stroke="#171717" stroke-width="10"/><rect x="55" y="55" width="670" height="48" rx="4" fill="#171717"/><text x="78" y="90" font-family="DejaVu Sans,Arial,sans-serif" font-size="27" font-weight="800" fill="#f0dfbd" letter-spacing="2">AWESOME FAME SLIDER / ${escapeXml(person.id.toUpperCase())} MEME METER</text><text x="72" y="190" font-family="DejaVu Sans,Arial,sans-serif" font-size="70" font-weight="900" fill="#171717">${escapeXml(person.name)}</text><text x="75" y="235" font-family="DejaVu Sans,Arial,sans-serif" font-size="29" font-weight="700" fill="#5f5546">${escapeXml(person.role)} · INTERNET STATUS RHEOSTAT</text><path d="M70 270 H740" stroke="#171717" stroke-width="8"/><text x="72" y="362" font-family="DejaVu Sans,Arial,sans-serif" font-size="78" font-weight="900" fill="#8f271d">${escapeXml(person.ranks[rank])}</text><text x="75" y="399" font-family="DejaVu Sans Mono,monospace" font-size="20" font-weight="700" fill="#6b5c48" letter-spacing="2">THE KNOB MOVES. THE FACE MOVES.</text><line x1="100" y1="438" x2="950" y2="438" stroke="#4a3626" stroke-width="14" stroke-linecap="round"/>${dots}<circle cx="1015" cy="220" r="144" fill="#cdbb98" opacity=".7"/>${memeAvatar(person,rank,850,58,330)}<text x="1014" y="402" text-anchor="middle" font-family="DejaVu Sans Mono,monospace" font-size="18" font-weight="800" fill="#6b5c48">RANK-SPECIFIC MEME PORTRAIT</text><text x="72" y="545" font-family="DejaVu Sans Mono,monospace" font-size="26" font-weight="900" fill="#171717">RANK ${rank+1} / 6</text><text x="72" y="588" font-family="DejaVu Sans,Arial,sans-serif" font-size="20" font-weight="700" fill="#6b5c48">VISUAL SET: ${escapeXml(person.sourceLabel||'internet meme pack')} · parody / internet sentiment</text><text x="1125" y="585" text-anchor="end" font-family="DejaVu Sans,Arial,sans-serif" font-size="22" font-weight="900" fill="#171717">CAST YOUR VERDICT →</text></svg>`;}
function standardCard(person,rank){const avatarViewX=person.avatarIndex*256;const dots=Array.from({length:6},(_,index)=>{const x=110+index*196;return `<circle cx="${x}" cy="395" r="${index===rank?27:13}" fill="${index===rank?'#171717':'#a8987c'}"/>`;}).join('');return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><rect width="1200" height="675" fill="#eee3cf"/><rect x="36" y="36" width="1128" height="603" fill="none" stroke="#171717" stroke-width="8"/><text x="76" y="105" font-family="DejaVu Sans,Arial,sans-serif" font-size="34" font-weight="700" fill="#171717" letter-spacing="2">AWESOME FAME SLIDER / REPUTATION METER</text><circle cx="1030" cy="190" r="106" fill="#cdbd9f"/><svg x="932" y="92" width="196" height="196" viewBox="${avatarViewX} 0 256 256"><image x="0" y="0" width="2048" height="256" href="data:image/svg+xml;base64,${avatarData}" preserveAspectRatio="none"/></svg><text x="76" y="205" font-family="DejaVu Sans,Arial,sans-serif" font-size="70" font-weight="800" fill="#171717">${escapeXml(person.name)}</text><text x="78" y="252" font-family="DejaVu Sans,Arial,sans-serif" font-size="30" font-weight="500" fill="#625948">${escapeXml(person.role)}</text><line x1="95" y1="395" x2="1105" y2="395" stroke="#402b1f" stroke-width="18" stroke-linecap="round"/>${dots}<text x="76" y="535" font-family="DejaVu Sans,Arial,sans-serif" font-size="78" font-weight="900" fill="#171717">${escapeXml(person.ranks[rank])}</text><text x="80" y="582" font-family="DejaVu Sans,Arial,sans-serif" font-size="28" font-weight="700" fill="#625948">YOUR VERDICT</text><text x="1115" y="575" text-anchor="end" font-family="DejaVu Sans Mono,monospace" font-size="28" font-weight="700" fill="#171717">RANK ${rank+1} / 6</text></svg>`;}
for(const person of people){
  for(let rank=0;rank<6;rank+=1){
    const outputPath=path.join(outputDir,`${person.id}-${rank}.png`);
    await sharp(Buffer.from(person.rankImageUrls?memeCard(person,rank):standardCard(person,rank)),{density:144})
      .resize(1200,675,{fit:'fill'})
      .png()
      .toFile(outputPath);
    const metadata=await sharp(outputPath).metadata();
    if(metadata.format!=='png' || metadata.width!==1200 || metadata.height!==675){
      throw new Error(`Generated ${person.id}-${rank}.png as ${metadata.format} ${metadata.width}x${metadata.height}; expected png 1200x675`);
    }
  }
}
console.log(`Generated ${people.length*6} share cards in ${outputDir}`);
