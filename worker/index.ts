type Env = { DB: D1Database; ASSETS: Fetcher; APP_ORIGIN: string };

type RankMeta = { zh: string; en: string };
type PersonMeta = { name: string; role: string; ranks: RankMeta[] };

const standard = (surname: string): RankMeta[] => [
  { zh: `小难${surname}`, en: `Delayed ${surname}` },
  { zh: `牢${surname}`, en: `Jailed ${surname}` },
  { zh: `${surname}子`, en: `${surname}` },
  { zh: `${surname}圣`, en: `Saint ${surname}` },
  { zh: `${surname}神`, en: `God ${surname}` },
  { zh: `${surname}祖`, en: `Ancestor ${surname}` },
];

const PEOPLE: Record<string, PersonMeta> = {
  liang: { name: 'Liang Wenfeng', role: 'DeepSeek', ranks: standard('梁') },
  musk: { name: 'Elon Musk', role: 'xAI · Tesla · SpaceX', ranks: standard('马') },
  altman: { name: 'Sam Altman', role: 'OpenAI', ranks: standard('奥') },
  tibo: { name: 'Tibo Sottiaux', role: 'Codex', ranks: standard('Tibo') },
  huang: { name: 'Jensen Huang', role: 'NVIDIA', ranks: standard('黄') },
  zuck: { name: 'Mark Zuckerberg', role: 'Meta', ranks: standard('扎') },
  dario: { name: 'Dario Amodei', role: 'Anthropic', ranks: standard('Dario') },
  demis: { name: 'Demis Hassabis', role: 'Google DeepMind', ranks: standard('哈') },
};

const NEUTRAL_RANK = 2;
const VOTE_WRITE_LIMIT = 24;
const VOTER_COOKIE = 'sr_voter';
const VOTER_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('cache-control', 'no-store');
  return Response.json(data, { ...init, headers });
}

function b64url(bytes: Uint8Array) {
  let value = '';
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomToken(size = 24) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return b64url(bytes);
}

function personExists(id: string) {
  return Object.prototype.hasOwnProperty.call(PEOPLE, id);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function validRank(value: unknown) {
  const rank = Number(value);
  return Number.isInteger(rank) && rank >= 0 && rank <= 5 ? rank : null;
}

export function canonicalOrigin(env: Pick<Env, 'APP_ORIGIN'>) {
  return env.APP_ORIGIN.replace(/\/$/, '');
}

export function leader(counts: number[]) {
  const max = Math.max(...counts);
  if (max <= 0) return NEUTRAL_RANK;
  const tied = counts.map((count, rank) => ({ count, rank })).filter((item) => item.count === max);
  return tied.sort((a, b) => Math.abs(a.rank - NEUTRAL_RANK) - Math.abs(b.rank - NEUTRAL_RANK) || a.rank - b.rank)[0].rank;
}

export function shareCopy(personId: string, rank: number) {
  const person = PEOPLE[personId];
  const verdict = person?.ranks[rank];
  if (!person || !verdict) return 'I set a reputation rheostat. What is your verdict?';
  return `My vote for ${person.name}: ${verdict.zh} (${verdict.en}). What's your verdict?`;
}

export function sharePath(personId: string, rank: number) {
  return `/share/${encodeURIComponent(personId)}/${rank}`;
}

export function shareCardPath(personId: string, rank: number) {
  return `/share-cards/${encodeURIComponent(personId)}-${rank}.png`;
}

export function sharePageHtml(personId: string, rank: number, env: Pick<Env, 'APP_ORIGIN'>) {
  const person = PEOPLE[personId];
  const verdict = person?.ranks[rank];
  if (!person || !verdict) return null;

  const origin = canonicalOrigin(env);
  const pageUrl = `${origin}${sharePath(personId, rank)}`;
  const appUrl = `${origin}/?who=${encodeURIComponent(personId)}&rank=${rank}&from=share`;
  const imageUrl = `${origin}${shareCardPath(personId, rank)}`;
  const title = `${verdict.zh} · ${person.name} | Slide Rheostat`;
  const description = shareCopy(personId, rank);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(pageUrl)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(pageUrl)}" />
  <meta property="og:image" content="${escapeHtml(imageUrl)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="675" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
  <meta name="twitter:image:alt" content="${escapeHtml(`${person.name}: ${verdict.en}, rank ${rank + 1} of 6`)}" />
  <meta http-equiv="refresh" content="0;url=${escapeHtml(appUrl)}" />
</head>
<body>
  <p><a href="${escapeHtml(appUrl)}">Open this verdict in Slide Rheostat</a></p>
</body>
</html>`;
}

async function voteSummary(env: Env, personId: string) {
  const rows = await env.DB.prepare('SELECT rank, COUNT(*) AS count FROM anonymous_votes WHERE person_id = ? GROUP BY rank')
    .bind(personId)
    .all<{ rank: number; count: number }>();
  const counts = [0, 0, 0, 0, 0, 0];
  for (const row of rows.results) if (row.rank >= 0 && row.rank <= 5) counts[row.rank] = Number(row.count);
  return { counts, total: counts.reduce((a, b) => a + b, 0), leader: leader(counts) };
}

function cookieValue(request: Request, name: string) {
  const cookie = request.headers.get('cookie') || '';
  for (const part of cookie.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return '';
}

function voterToken(request: Request) {
  const existing = cookieValue(request, VOTER_COOKIE);
  return /^[A-Za-z0-9_-]{24,64}$/.test(existing) ? existing : randomToken();
}

function voterCookie(request: Request, token: string) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${VOTER_COOKIE}=${token}; Path=/; Max-Age=${VOTER_MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax${secure}`;
}

async function sha256Id(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return b64url(new Uint8Array(digest));
}

async function voterId(token: string, env: Env) {
  return sha256Id(`${canonicalOrigin(env)}|voter|${token}`);
}

async function rateLimitKey(request: Request, env: Env, scope: string) {
  const forwarded = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return sha256Id(`${canonicalOrigin(env)}|${scope}|${forwarded}`);
}

async function allowVote(request: Request, env: Env) {
  const key = await rateLimitKey(request, env, 'vote');
  const row = await env.DB.prepare(`
    INSERT INTO rate_limits (key, window_start, count)
    VALUES (?, datetime('now'), 1)
    ON CONFLICT(key) DO UPDATE SET
      count = CASE WHEN window_start <= datetime('now','-10 minutes') THEN 1 ELSE count + 1 END,
      window_start = CASE WHEN window_start <= datetime('now','-10 minutes') THEN datetime('now') ELSE window_start END
    RETURNING count
  `).bind(key).first<{ count: number }>();
  return Number(row?.count || 0) <= VOTE_WRITE_LIMIT;
}

async function castVote(request: Request, env: Env, personId: string) {
  if (!personExists(personId)) return json({ error: 'unknown person' }, { status: 404 });

  const requestOrigin = request.headers.get('origin');
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return json({ error: 'cross-origin vote rejected' }, { status: 403 });
  }

  const body = await request.json<{ rank?: unknown }>().catch(() => ({}));
  const rank = validRank(body.rank);
  if (rank === null) return json({ error: 'invalid rank' }, { status: 400 });

  await env.DB.prepare("DELETE FROM rate_limits WHERE window_start <= datetime('now','-1 day')").run();
  if (!(await allowVote(request, env))) {
    return json({ error: 'too many vote writes; try again shortly' }, { status: 429, headers: { 'retry-after': '600' } });
  }

  const token = voterToken(request);
  const id = await voterId(token, env);
  await env.DB.prepare(`
    INSERT INTO anonymous_votes (voter_id, person_id, rank)
    VALUES (?, ?, ?)
    ON CONFLICT(voter_id, person_id) DO UPDATE SET
      rank = excluded.rank,
      updated_at = CURRENT_TIMESTAMP
  `).bind(id, personId, rank).run();

  const summary = await voteSummary(env, personId);
  return json(summary, { headers: { 'set-cookie': voterCookie(request, token) } });
}

async function readiness(env: Env) {
  try {
    const rows = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('anonymous_votes','rate_limits')")
      .all<{ name: string }>();
    const tables = new Set(rows.results.map((row) => row.name));
    const required = ['anonymous_votes', 'rate_limits'];
    const missingTables = required.filter((name) => !tables.has(name));
    const appOriginConfigured = Boolean(env.APP_ORIGIN && !env.APP_ORIGIN.includes('example'));
    const ready = missingTables.length === 0 && appOriginConfigured;
    return json({
      ok: ready,
      database: { ok: missingTables.length === 0, missingTables },
      appOrigin: { configured: appOriginConfigured, value: canonicalOrigin(env) },
      xApiRequired: false,
    }, { status: ready ? 200 : 503 });
  } catch (error) {
    return json({ ok: false, database: { ok: false, error: error instanceof Error ? error.message : String(error) } }, { status: 503 });
  }
}

function sharePage(personId: string, rank: number, env: Env) {
  const page = sharePageHtml(personId, rank, env);
  if (!page) return new Response('Unknown verdict', { status: 404 });
  return new Response(page, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') return json({ ok: true, service: 'slide-rheostat' });
    if (url.pathname === '/api/ready') return readiness(env);

    const personMatch = url.pathname.match(/^\/api\/people\/([^/]+)$/);
    if (personMatch && request.method === 'GET') {
      const personId = decodeURIComponent(personMatch[1]);
      return personExists(personId) ? json(await voteSummary(env, personId)) : json({ error: 'unknown person' }, { status: 404 });
    }

    const voteMatch = url.pathname.match(/^\/api\/people\/([^/]+)\/vote$/);
    if (voteMatch && request.method === 'POST') {
      return castVote(request, env, decodeURIComponent(voteMatch[1]));
    }

    if (url.pathname.startsWith('/api/')) return json({ error: 'not found' }, { status: 404 });

    const shareMatch = url.pathname.match(/^\/share\/([^/]+)\/([0-5])\/?$/);
    if (shareMatch && request.method === 'GET') {
      return sharePage(decodeURIComponent(shareMatch[1]), Number(shareMatch[2]), env);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
