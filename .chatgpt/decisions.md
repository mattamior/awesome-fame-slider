# Decisions

## 2026-08-26 — Initialize RPM

- The GitHub repository `mattamior/slide-rheostat` is the canonical source of truth for project state.
- RPM state is stored under `.chatgpt/`.
- The manifest is `.chatgpt/project-memory.yaml`.
- Project state, next steps, and durable decisions are tracked in the files referenced by that manifest.

## 2026-08-26 — Initial product constraints

- The application will be a simple React frontend.
- The concept is inspired by the 梁文锋“滑动变阻器/滑动变祖器” meme, but the product is not Liang-only.
- The product should support many recognizable public figures.
- X is a primary distribution surface; the experience should be easy to share and fun to open/play from an X post.

## 2026-08-26 — X-native voting loop

- Add Tibo to the initial public-figure roster. The launch roster is Liang Wenfeng, Elon Musk, Sam Altman, Jensen Huang, Mark Zuckerberg, Dario Amodei, Demis Hassabis, and Tibo Sottiaux.
- The primary conversion action is `Share & Vote`: the user chooses a person's rank and publishes that verdict to X.
- The shared X post contains the user's selected verdict, a deep link back to that state, and an attached result image.
- A vote is counted only after X confirms successful Post creation. Opening a share composer or clicking a Web Intent is not sufficient evidence of a vote.
- One active vote per X account per person. A later successful share changes that account's current vote instead of incrementing unlimited duplicate voters. Raw successful-share events are stored separately.
- Each person page shows the vote distribution and a derived community/current rank.

## 2026-08-26 — Share transaction implementation

- Use X OAuth 2.0 Authorization Code with PKCE as a confidential Web App flow. Required scopes are `tweet.read`, `tweet.write`, `users.read`, and `media.write`; no refresh token/offline access is required for the one-shot sharing transaction.
- Generate the initial 1200x675 result card in the browser with Canvas and send its PNG base64 into a short-lived D1 `oauth_pending` row. This avoids adding an image-rendering service to the MVP while still giving X a real attached image.
- The OAuth callback immediately exchanges the code, resolves `/2/users/me`, uploads the pending PNG using the X v2 media endpoint, creates the Post, then inserts `share_events` and upserts `votes` only after the Post succeeds.
- `APP_ORIGIN` is the canonical production origin. The OAuth callback defaults to `${APP_ORIGIN}/api/auth/x/callback`, so it must exactly match the callback configured in the X Developer Console.
- Cloudflare Workers Static Assets must use `run_worker_first: ["/api/*"]` so API/navigation routing cannot accidentally bypass the Worker.
- X API production use is pay-per-use/credit based as of 2026-08-26, so the launch budget must account for API writes in addition to Cloudflare hosting.

## 2026-08-26 — Community-state and share-copy behavior

- A person with zero votes defaults to the neutral third rank (`子` / rank index 2), rather than accidentally appearing in the lowest rank.
- Vote ties are broken toward the rank closest to neutral, making early low-volume results less arbitrarily extreme.
- Verified X posts use the person's actual verdict label (for example `牢梁` or `Tibo神`) instead of generic `rank N/6` copy.
- Expired pending OAuth share rows are opportunistically removed when a new share begins, and cancelled OAuth callbacks remove their pending transaction without recording a vote.
- GitHub Actions CI is used for remote build/type validation because the ChatGPT runtime cannot currently install npm dependencies directly.

## 2026-08-26 — Pre-launch hardening

- `/api/x/share/start` is protected by a lightweight D1-backed per-network rate limit: eight attempts per ten-minute window.
- The limiter stores a short SHA-256-derived identifier rather than a raw request IP; rows older than one day are removed opportunistically.
- Add `/api/ready` separately from `/api/health`: liveness remains a simple process check, while readiness returns HTTP 200 only when the required D1 tables exist and `APP_ORIGIN` plus X client credentials are configured.
- Production deployment verification must check `/api/ready` before testing the live OAuth/media/post/vote transaction.

## 2026-08-26 — Voting-data integrity and live refresh

- The frontend must never fabricate community sentiment when the vote API is unavailable. The previous seeded fallback counts were removed; an unavailable API now renders zero bars, neutral rank, and an explicit offline/live-results-unavailable state.
- Client-side zero-vote and tie-breaking semantics mirror the Worker: zero votes use the neutral rank and ties prefer the rank closest to neutral.
- Live aggregate results refresh when the person changes, after a share result, when the tab returns to the foreground, and every 30 seconds while visible.
- Mobile styling must account for safe-area insets, narrow screens, horizontal roster scrolling, touch interaction, and reduced-motion preferences.
