interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  APP_ORIGIN: string;
  X_CLIENT_ID?: string;
  X_CLIENT_SECRET?: string;
  X_REDIRECT_URI?: string;
}

const PEOPLE = new Set(['liang', 'musk', 'altman', 'tibo', 'huang', 'zuck', 'dario', 'demis']);

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'content-type': 'application/json; charset=utf-8', ...(init.headers || {}) },
  });
}

function leader(counts: number[]) {
  let best = 0;
  for (let i = 1; i < counts.length; i++) if (counts[i] > counts[best]) best = i;
  return best;
}

async function voteSummary(env: Env, personId: string) {
  const rows = await env.DB.prepare(
    'SELECT rank, COUNT(*) AS count FROM votes WHERE person_id = ? GROUP BY rank',
  ).bind(personId).all<{ rank: number; count: number }>();

  const counts = [0, 0, 0, 0, 0, 0];
  for (const row of rows.results) counts[row.rank] = Number(row.count);
  const total = counts.reduce((a, b) => a + b, 0);
  return { counts, total, leader: leader(counts) };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/people/')) {
      const personId = url.pathname.split('/').pop() || '';
      if (!PEOPLE.has(personId)) return json({ error: 'unknown person' }, { status: 404 });
      return json(await voteSummary(env, personId));
    }

    if (url.pathname === '/api/health') {
      return json({ ok: true, service: 'slide-rheostat' });
    }

    if (url.pathname === '/api/auth/x/start') {
      if (!env.X_CLIENT_ID || !env.X_REDIRECT_URI) {
        return json({ error: 'X OAuth is not configured' }, { status: 503 });
      }
      return json({ error: 'OAuth flow scaffolded; token exchange pending implementation' }, { status: 501 });
    }

    if (url.pathname === '/api/x/share' && request.method === 'POST') {
      if (!env.X_CLIENT_ID || !env.X_CLIENT_SECRET) {
        return json({ error: 'X API is not configured' }, { status: 401 });
      }
      return json({ error: 'Authenticated X media upload + post creation pending implementation' }, { status: 501 });
    }

    return env.ASSETS.fetch(request);
  },
};