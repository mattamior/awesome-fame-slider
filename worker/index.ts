type PendingShare = { state: string; code_verifier: string; person_id: string; rank: number; media_base64: string };
type Env = { DB: D1Database; ASSETS: Fetcher; APP_ORIGIN: string; X_CLIENT_ID?: string; X_CLIENT_SECRET?: string; X_REDIRECT_URI?: string };

const PEOPLE = new Set(['liang','musk','altman','tibo','huang','zuck','dario','demis']);
const SCOPES = 'tweet.read tweet.write users.read media.write';

function json(data: unknown, init: ResponseInit = {}) { return Response.json(data, init); }
function validRank(value: unknown) { const n = Number(value); return Number.isInteger(n) && n >= 0 && n <= 5 ? n : null; }
function b64url(bytes: Uint8Array) { let s=''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function randomToken(size = 32) { const bytes = new Uint8Array(size); crypto.getRandomValues(bytes); return b64url(bytes); }
async function challenge(verifier: string) { return b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)))); }
function leader(counts: number[]) { let best=0; for(let i=1;i<counts.length;i++) if(counts[i]>counts[best]) best=i; return best; }
function redirectUri(env: Env) { return env.X_REDIRECT_URI || `${env.APP_ORIGIN.replace(/\/$/,'')}/api/auth/x/callback`; }

async function voteSummary(env: Env, personId: string) {
  const rows = await env.DB.prepare('SELECT rank, COUNT(*) AS count FROM votes WHERE person_id = ? GROUP BY rank').bind(personId).all<{rank:number;count:number}>();
  const counts=[0,0,0,0,0,0]; for(const row of rows.results) counts[row.rank]=Number(row.count);
  return { counts, total: counts.reduce((a,b)=>a+b,0), leader: leader(counts) };
}

async function xJson<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json<T & { errors?: unknown; detail?: string }>();
  if (!res.ok) throw new Error(`X API ${res.status}: ${JSON.stringify(data)}`);
  return data as T;
}

function postText(personId: string, rank: number, origin: string) {
  return `My verdict: ${personId} is rank ${rank + 1}/6.\n\nCast yours → ${origin}/?who=${encodeURIComponent(personId)}&rank=${rank}`;
}

async function beginShare(request: Request, env: Env) {
  if (!env.X_CLIENT_ID) return json({error:'X OAuth is not configured'},{status:503});
  const body = await request.json<{personId?:string;rank?:unknown;mediaBase64?:string}>().catch(()=>({}));
  const personId = body.personId || ''; const rank = validRank(body.rank);
  if (!PEOPLE.has(personId) || rank === null || !body.mediaBase64) return json({error:'invalid share payload'},{status:400});
  if (body.mediaBase64.length > 2_000_000) return json({error:'share image too large'},{status:413});
  const state=randomToken(24), verifier=randomToken(48), codeChallenge=await challenge(verifier);
  await env.DB.prepare(`INSERT INTO oauth_pending (state,code_verifier,person_id,rank,media_base64,expires_at) VALUES (?,?,?,?,?,datetime('now','+10 minutes'))`)
    .bind(state,verifier,personId,rank,body.mediaBase64).run();
  const u=new URL('https://x.com/i/oauth2/authorize');
  u.searchParams.set('response_type','code'); u.searchParams.set('client_id',env.X_CLIENT_ID); u.searchParams.set('redirect_uri',redirectUri(env));
  u.searchParams.set('scope',SCOPES); u.searchParams.set('state',state); u.searchParams.set('code_challenge',codeChallenge); u.searchParams.set('code_challenge_method','S256');
  return json({authUrl:u.toString()});
}

async function oauthCallback(request: Request, env: Env) {
  if (!env.X_CLIENT_ID || !env.X_CLIENT_SECRET) return new Response('X OAuth is not configured',{status:503});
  const url=new URL(request.url), state=url.searchParams.get('state')||'', code=url.searchParams.get('code')||'';
  if (!state || !code) return Response.redirect(`${env.APP_ORIGIN}/?shareError=oauth_cancelled`,302);
  const pending = await env.DB.prepare(`SELECT state,code_verifier,person_id,rank,media_base64 FROM oauth_pending WHERE state=? AND expires_at > datetime('now')`).bind(state).first<PendingShare>();
  if (!pending) return Response.redirect(`${env.APP_ORIGIN}/?shareError=expired`,302);
  await env.DB.prepare('DELETE FROM oauth_pending WHERE state=?').bind(state).run();
  try {
    const form=new URLSearchParams({grant_type:'authorization_code',code,redirect_uri:redirectUri(env),code_verifier:pending.code_verifier});
    const basic=btoa(`${env.X_CLIENT_ID}:${env.X_CLIENT_SECRET}`);
    const token=await xJson<{access_token:string}>('https://api.x.com/2/oauth2/token',{method:'POST',headers:{authorization:`Basic ${basic}`,'content-type':'application/x-www-form-urlencoded'},body:form});
    const auth={authorization:`Bearer ${token.access_token}`};
    const me=await xJson<{data:{id:string}}>('https://api.x.com/2/users/me',{headers:auth});
    const media=await xJson<{data:{id:string}}>('https://api.x.com/2/media/upload',{method:'POST',headers:{...auth,'content-type':'application/json'},body:JSON.stringify({media:pending.media_base64,media_category:'tweet_image',media_type:'image/png',shared:false})});
    const post=await xJson<{data:{id:string}}>('https://api.x.com/2/tweets',{method:'POST',headers:{...auth,'content-type':'application/json'},body:JSON.stringify({text:postText(pending.person_id,pending.rank,env.APP_ORIGIN),media:{media_ids:[media.data.id]}})});
    await env.DB.batch([
      env.DB.prepare('INSERT INTO share_events (x_user_id,person_id,rank,post_id) VALUES (?,?,?,?)').bind(me.data.id,pending.person_id,pending.rank,post.data.id),
      env.DB.prepare(`INSERT INTO votes (x_user_id,person_id,rank,post_id) VALUES (?,?,?,?) ON CONFLICT(x_user_id,person_id) DO UPDATE SET rank=excluded.rank,post_id=excluded.post_id,updated_at=CURRENT_TIMESTAMP`).bind(me.data.id,pending.person_id,pending.rank,post.data.id),
    ]);
    return Response.redirect(`${env.APP_ORIGIN}/?who=${pending.person_id}&rank=${pending.rank}&shared=1`,302);
  } catch (error) {
    console.error(JSON.stringify({event:'x_share_failed',message:error instanceof Error?error.message:String(error)}));
    return Response.redirect(`${env.APP_ORIGIN}/?who=${pending.person_id}&rank=${pending.rank}&shareError=failed`,302);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url=new URL(request.url);
    if(url.pathname==='/api/health') return json({ok:true,service:'slide-rheostat'});
    if(url.pathname.startsWith('/api/people/')) { const id=url.pathname.split('/').pop()||''; return PEOPLE.has(id)?json(await voteSummary(env,id)):json({error:'unknown person'},{status:404}); }
    if(url.pathname==='/api/x/share/start' && request.method==='POST') return beginShare(request,env);
    if(url.pathname==='/api/auth/x/callback' && request.method==='GET') return oauthCallback(request,env);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;