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
- Generate the initial 1200x675 result card in the browser with Canvas and send its PNG base64 into a short-lived D1 `oauth_pending` row.
- The OAuth callback exchanges the code, resolves `/2/users/me`, uploads the pending PNG, creates the Post, then inserts `share_events` and upserts `votes` only after the Post succeeds.
- `APP_ORIGIN` is the canonical production origin. The OAuth callback defaults to `${APP_ORIGIN}/api/auth/x/callback`.
- Cloudflare Workers Static Assets use `run_worker_first: ["/api/*"]`.
- X API production use is credit based, so launch budget must account for API writes.

## 2026-08-26 — Community-state and share-copy behavior

- A person with zero votes defaults to the neutral third rank (`子` / rank index 2).
- Vote ties are broken toward the rank closest to neutral.
- Verified X posts use the person's actual verdict label, e.g. `牢梁` or `Tibo神`.
- Expired pending OAuth share rows are removed opportunistically and cancelled OAuth callbacks do not record votes.
- GitHub Actions CI is the remote build/type validation environment.

## 2026-08-26 — Pre-launch hardening

- `/api/x/share/start` has a D1-backed per-network rate limit: eight attempts per ten-minute window.
- The limiter stores a short SHA-256-derived identifier rather than a raw request IP.
- `/api/ready` returns 200 only when required D1 tables, `APP_ORIGIN`, and X client credentials are configured.
- Production deployment verification must check `/api/ready` before testing the live OAuth/media/post/vote transaction.

## 2026-08-26 — Voting-data integrity and live refresh

- The frontend never fabricates community sentiment when the vote API is unavailable.
- Client-side zero-vote and tie-breaking semantics mirror the Worker.
- Live aggregate results refresh on person/share changes, foregrounding, and every 30 seconds while visible.
- Mobile styling accounts for safe-area insets, narrow screens, horizontal roster scrolling, touch interaction, and reduced motion.

## 2026-08-26 — GitHub-driven production deployment

- A manual GitHub Actions `Deploy` workflow is the production rollout path.
- Production account material is supplied through repository secrets: `CF_API_TOKEN`, `CF_ACCOUNT_ID`, `APP_ORIGIN`, `X_CLIENT_ID`, and `X_CLIENT_SECRET`.
- Deploy discovers `slide-rheostat-db` using `wrangler d1 list --json`; if absent, it creates the database and resolves its UUID.
- The workflow modifies only the runner workspace copy of `wrangler.jsonc` for production IDs/origin.
- The workflow validates secrets, runs tests/build, provisions/resolves D1, applies migrations, deploys Worker/static assets, configures X OAuth Worker secrets, and requires `/api/health` and `/api/ready` success.

## 2026-08-26 — Checkpoint before production launch

- Implementation is paused intentionally at the production-launch boundary.
- The code path and CI are prepared; production deployment and end-to-end verification remain incomplete.
- Resume from `.chatgpt/next-steps.md`: configure the five production secrets, configure the exact X callback and credits, run Deploy, verify Share & Vote end-to-end, then record the live URL.

## 2026-08-26 — Replace paid X API writes with free sharing

This decision supersedes the X-native voting loop, OAuth share transaction, X-specific readiness requirements, and five-secret deployment requirements above. Those entries remain as historical context only.

- Voting and X sharing are now independent product actions.
- A vote is written directly to D1 when the visitor presses `Cast vote`; X publication is not evidence for, or a prerequisite of, a vote.
- Voting identity is an anonymous browser-device identifier held in a random HttpOnly cookie. Only a SHA-256-derived identifier is persisted in D1.
- One active anonymous vote is kept per browser device/person; later votes update the existing row.
- A D1-backed per-network write limiter remains as lightweight abuse resistance. Results are internet sentiment, not verified-person polling.
- X distribution uses `https://x.com/intent/tweet` with pre-populated verdict text and an absolute result URL. This requires no X Developer App, OAuth credentials, or paid X API write.
- Stable `/share/:personId/:rank` pages are served by the Worker for social crawlers. They publish `summary_large_image`/Open Graph metadata and immediately return human visitors to the corresponding interactive state.
- 48 result-specific 1200×675 PNG cards are generated at build time (8 people × 6 ranks) and served as static assets.
- Production deployment now requires only `CF_API_TOKEN`, `CF_ACCOUNT_ID`, and `APP_ORIGIN`; `/api/ready` no longer checks X credentials.
- Legacy OAuth/share-event database migrations remain in migration history so previously initialized databases stay compatible, but current application code does not use those tables.

## 2026-08-26 — Rename repository and pre-launch Cloudflare resources

This decision supersedes the original repository/resource identifiers while preserving the product display name for now.

- GitHub repository renamed from `mattamior/slide-rheostat` to `mattamior/awesome-fame-slider`.
- RPM canonical repository is now `mattamior/awesome-fame-slider`.
- The Cloudflare Worker had not yet been created, so its intended name is changed to `awesome-fame-slider` before first deployment.
- The D1 database had not yet been created by the deployment workflow, so its intended name is changed to `awesome-fame-slider-db`.
- The default workers.dev origin placeholder is `https://awesome-fame-slider.workers.dev`; production `APP_ORIGIN` still uses the account-specific workers.dev hostname or a custom domain.
- The current on-page product display name remains `Slide Rheostat`; repository/infrastructure naming is intentionally allowed to differ from the product brand.
