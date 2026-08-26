type PendingShare = { state: string; code_verifier: string; person_id: string; rank: number; media_base64: string };
type Env = { DB: D1Database; ASSETS: Fetcher; APP_ORIGIN: string; X_CLIENT_ID?: string; X_CLIENT_SECRET?: string; X_REDIRECT_URI?: string };

type PersonMeta = { name: string; ranks: string[] };

const PEOPLE: Record<string, PersonMeta> = {
  liang: { name: 'Liang Wenfeng', ranks: ['小难梁', '牢梁', '梁子', '梁圣', '梁神', '梁祖'] },
  musk: { name: 'Elon Musk', ranks: ['小难马', '牢马', '马子', '马圣', '马神', '马祖'] },
  altman: { name: 'Sam Altman', ranks: ['小难奥', '牢奥', '奥子', '奥圣', '奥神', '奥祖'] },
  tibo: { name: 'Tibo Sottiaux', ranks: ['小难Tibo', '牢Tibo', 'Tibo子', 'Tibo圣', 'Tibo神', 'Tibo祖'] },
  huang: { name: 'Jensen Huang', ranks: ['小难黄', '牢黄', '黄子', '黄圣', '黄神', '黄祖'] },
  zuck: { name: 'Mark Zuckerberg', ranks: ['小难扎', '牢扎', '扎子', '扎圣', '扎神', '扎祖'] },
  dario: { name: 'Dario Amodei', ranks: ['小难Dario', '牢Dario', 'Dario子', 'Dario圣', 'Dario神', 'Dario祖'] },
  demis: { name: 'Demis Hassabis', ranks: ['小难哈', '牢哈', '哈子', '哈圣', '哈神', '哈祖'] },
};

const SCOPES = 'tweet.read tweet.write users.read media.write';
const NEUTRAL_RANK = 2;
const SHARE_START_LIMIT = 8;

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('cache-control', 'no-store');
  return Response.json(data, { ...init, headers });
}
export function validRank(value: unknown) { const n = Number(value); return Number.isInteger(n) && n >= 0 && n <= 5 ? n : null; }
function b64url(bytes: Uint8Array) { let s=''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function randomToken(size = 32) { const bytes = new Uint8Array(size); crypto.getRandomValues(bytes); return b64url(bytes); }
async function challenge(verifier: string) { return b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)))); }
export function canonicalOrigin(env: Pick<Env, 'APP_ORIGIN'>) { return env.APP_ORIGIN.replace(/\/$/,''); }
function redirectUri(env: Env) { return env.X_REDIRECT_URI || `${canonicalOrigin(env)}/api/auth/x/callback`; }
function personExists(id: string) { return Object.prototype.hasOwnProperty.call(PEOPLE, id); }

export function leader(counts: number[]) {
  const max = Math.max(...counts);
  if (max <= 0) return NEUTRAL_RANK;
  const tied = counts.map((count, rank) => ({ count, rank })).filter((item) => item.count === max);
  return tied.sort((a, b) => Math.abs(a.rank - NEUTRAL_RANK) - Math.abs(b.rank - NEUTRAL_RANK) || a.rank - b.rank)[0].rank;
}

async function voteSummary(env: Env, personId: string) {
  const rows = await env.DB.prepare('SELECT rank, COUNT(*) AS count FROM votes WHERE person_id = ? GROUP BY rank').bind(personId).all<{rank:number;count:number}>();
  const counts=[0,0,0,0,0,0];
  for(const row of rows.results) if (row.rank >= 0 && row.rank <= 5) counts[row.rank]=Number(row.count);
  return { counts, total: counts.reduce((a,b)=>a+b,0), leader: leader(counts) };
}

async function xJson<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json<T & { errors?: unknown; detail?: string }>();
  if (!res.ok) throw new Error(`X API ${res.status}: ${JSON.stringify(data)}`);
  return data as T;
}

export function postText(personId: string, rank: number, env: Pick<Env, 'APP_ORIGIN'>) {
  const person = PEOPLE[personId];
  const verdict = person?.ranks[rank] || `rank ${rank + 1}/6`;
  const origin = canonicalOrigin(env);
  return `My vote for ${person?.name || personId}: ${verdict}\n\nWhat's your verdict? → ${origin}/?who=${encodeURIComponent(personId)}&rank=${rank}`;
}

async function cleanupExpiredPending(env: Env) {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM oauth_pending WHERE expires_at <= datetime('now')"),
    env.DB.prepare("DELETE FROM rate_limits WHERE window_start <= datetime('now','-1 day')"),
  ]);
}

async function rateLimitKey(request: Request, env: Env) {
  const forwarded = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${canonicalOrigin(env)}|${forwarded}`)));
  return b64url(bytes).slice(0, 32);
}

async function allowShareStart(request: Request, env: Env) {
  const key = await rateLimitKey(request, env);
  const row = await env.DB.prepare(`
    INSERT INTO rate_limits (key, window_start, count)
    VALUES (?, datetime('now'), 1)
    ON CONFLICT(key) DO UPDATE SET
      count = CASE WHEN window_start <= datetime('now','-10 minutes') THEN 1 ELSE count + 1 END,
      window_start = CASE WHEN window_start <= datetime('now','-10 minutes') THEN datetime('now') ELSE window_start END
    RETURNING count
  `).bind(key).first<{ count: number }>();
  return Number(row?.count || 0) <= SHARE_START_LIMIT;
}

async function readiness(env: Env) {
  try {
    const rows = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('votes','share_events','oauth_pending','rate_limits')").all<{name:string}>();
    const tables = new Set(rows.results.map((row) => row.name));
    const required = ['votes','share_events','oauth_pending','rate_limits'];
    const missingTables = required.filter((name) => !tables.has(name));
    const xConfigured = Boolean(env.X_CLIENT_ID && env.X_CLIENT_SECRET);
    const appOriginConfigured = Boolean(env.APP_ORIGIN && !env.APP_ORIGIN.includes('example'));
    const ready = missingTables.length === 0 && xConfigured && appOriginConfigured;
    return json({ ok: ready, database: { ok: missingTables.length === 0, missingTables }, x: { configured: xConfigured }, appOrigin: { configured: appOriginConfigured, value: canonicalOrigin(env) } }, { status: ready ? 200 : 503 });
  } catch (error) {
    return json({ ok: false, database: { ok: false, error: error instanceof Error ? error.message : String(error) } }, { status: 503 });
  }
}

async function beginShare(request: Request, env: Env) {
  if (!env.X_CLIENT_ID) return json({error:'X OAuth is not configured'},{status:503});
  const body = await request.json<{personId?:string;rank?:unknown;mediaBase64?:string}>().catch(()=>({}));
  const personId = body.personId || '';
  const rank = validRank(body.rank);
  if (!personExists(personId) || rank === null || !body.mediaBase64) return json({error:'invalid share payload'},{status:400});
  if (body.mediaBase64.length > 2_000_000) return json({error:'share image too large'},{status:413});

  await cleanupExpiredPending(env);
  if (!(await allowShareStart(request, env))) return json({ error: 'too many share attempts; try again shortly' }, { status: 429, headers: { 'retry-after': '600' } });

  const state=randomToken(24), verifier=randomToken(48), codeChallenge=await challenge(verifier);
  await env.DB.prepare(`INSERT INTO oauth_pending (state,code_verifier,person_id,rank,media_base64,expires_at) VALUES (?,?,?,?,?,datetime('now','+10 minutes'))`)
    .bind(state,verifier,personId,rank,body.mediaBase64).run();

  const u=new URL('https://x.com/i/oauth2/authorize');
  u.searchParams.set('response_type','code');
  u.searchParams.set('client_id',env.X_CLIENT_ID);
  u.searchParams.set('redirect_uri',redirectUri(env));
  u.searchParams.set('scope',SCOPES);
  u.searchParams.set('state',state);
  u.searchParams.set('code_challenge',codeChallenge);
  u.searchParams.set('code_challenge_method','S256');
  return json({authUrl:u.toString()});
}

async function oauthCallback(request: Request, env: Env) {
  if (!env.X_CLIENT_ID || !env.X_CLIENT_SECRET) return new Response('X OAuth is not configured',{status:503});
  const url=new URL(request.url);
  const state=url.searchParams.get('state')||'';
  const code=url.searchParams.get('code')||'';
  const oauthError=url.searchParams.get('error');

  if (!state) return Response.redirect(`${canonicalOrigin(env)}/?shareError=oauth_cancelled`,302);

  const pending = await env.DB.prepare(`SELECT state,code_verifier,person_id,rank,media_base64 FROM oauth_pending WHERE state=? AND expires_at > datetime('now')`).bind(state).first<PendingShare>();
  await env.DB.prepare('DELETE FROM oauth_pending WHERE state=?').bind(state).run();

  if (!pending) return Response.redirect(`${canonicalOrigin(env)}/?shareError=expired`,302);
  const returnBase = `${canonicalOrigin(env)}/?who=${encodeURIComponent(pending.person_id)}&rank=${pending.rank}`;
  if (oauthError || !code) return Response.redirect(`${returnBase}&shareError=oauth_cancelled`,302);

  try {
    const form=new URLSearchParams({grant_type:'authorization_code',code,redirect_uri:redirectUri(env),code_verifier:pending.code_verifier});
    const basic=btoa(`${env.X_CLIENT_ID}:${env.X_CLIENT_SECRET}`);
    const token=await xJson<{access_token:string}>('https://api.x.com/2/oauth2/token',{method:'POST',headers:{authorization:`Basic ${basic}`,'content-type':'application/x-www-form-urlencoded'},body:form});
    const auth={authorization:`Bearer ${token.access_token}`};
    const me=await xJson<{data:{id:string}}>('https://api.x.com/2/users/me',{headers:auth});
    const media=await xJson<{data:{id:string}}>('https://api.x.com/2/media/upload',{method:'POST',headers:{...auth,'content-type':'application/json'},body:JSON.stringify({media:pending.media_base64,media_category:'tweet_image',media_type:'image/png',shared:false})});
    const post=await xJson<{data:{id:string}}>('https://api.x.com/2/tweets',{method:'POST',headers:{...auth,'content-type':'application/json'},body:JSON.stringify({text:postText(pending.person_id,pending.rank,env),media:{media_ids:[media.data.id]}})});

    await env.DB.batch([
      env.DB.prepare('INSERT INTO share_events (x_user_id,person_id,rank,post_id) VALUES (?,?,?,?)').bind(me.data.id,pending.person_id,pending.rank,post.data.id),
      env.DB.prepare(`INSERT INTO votes (x_user_id,person_id,rank,post_id) VALUES (?,?,?,?) ON CONFLICT(x_user_id,person_id) DO UPDATE SET rank=excluded.rank,post_id=excluded.post_id,updated_at=CURRENT_TIMESTAMP`).bind(me.data.id,pending.person_id,pending.rank,post.data.id),
    ]);

    return Response.redirect(`${returnBase}&shared=1`,302);
  } catch (error) {
    console.error(JSON.stringify({event:'x_share_failed',personId:pending.person_id,rank:pending.rank,message:error instanceof Error?error.message:String(error)}));
    return Response.redirect(`${returnBase}&shareError=failed`,302);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url=new URL(request.url);
    if(url.pathname==='/api/health') return json({ok:true,service:'slide-rheostat'});
    if(url.pathname==='/api/ready') return readiness(env);
    if(url.pathname.startsWith('/api/people/') && request.method==='GET') {
      const id=url.pathname.split('/').pop()||'';
      return personExists(id)?json(await voteSummary(env,id)):json({error:'unknown person'},{status:404});
    }
    if(url.pathname==='/api/x/share/start' && request.method==='POST') return beginShare(request,env);
    if(url.pathname==='/api/auth/x/callback' && request.method==='GET') return oauthCallback(request,env);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
