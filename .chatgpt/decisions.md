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

## 2026-08-26 — Checkpoint before first Cloudflare deployment

- Project is intentionally paused before any production Cloudflare Worker or D1 resource has been created.
- Repository, package, Worker target, D1 target, frontend GitHub link, Deploy workflow, README, and RPM canonical identity are aligned to `awesome-fame-slider`.
- CI is green after the free-sharing refactor and naming changes.
- Resume by configuring `CF_API_TOKEN`, `CF_ACCOUNT_ID`, and account-specific `APP_ORIGIN`, then run the manual Deploy workflow.
- First production deployment should create `awesome-fame-slider-db`, deploy the `awesome-fame-slider` Worker, apply migrations, and pass `/api/health` plus `/api/ready`.
- After deployment, verify anonymous vote upsert behavior, aggregate refresh, X Web Intent sharing, social-card metadata/image rendering, and mobile/X in-app browser behavior.

## 2026-08-26 — Remove APP_ORIGIN from free-sharing architecture

This decision supersedes the remaining APP_ORIGIN requirements above.

- The first production Deploy successfully created `awesome-fame-slider-db`, applied migrations, uploaded assets, and deployed the `awesome-fame-slider` Worker, but its final smoke check failed because the manually supplied APP_ORIGIN hostname did not resolve.
- Because the current architecture no longer uses X OAuth callbacks, a configured canonical origin is unnecessary.
- Share-page metadata and redirect URLs now derive their origin from the incoming request URL, so workers.dev and future custom domains work without a deployment-specific origin variable.
- Anonymous voter and rate-limit hashes use a fixed application namespace rather than the origin, preventing identity churn when the public hostname changes.
- `/api/ready` now checks only required D1 tables.
- Production deployment now requires only `CF_API_TOKEN` and `CF_ACCOUNT_ID`.
- The Deploy workflow parses the actual `workers.dev` URL from Wrangler deployment output and uses that discovered URL for `/api/health` and `/api/ready` smoke checks.

## 2026-08-26 — Adopt AI-Native Repository Delivery

This decision supersedes the earlier requirement to manually trigger normal production releases.

- The project adopts **AI-Native Repository Delivery (ANRD)** as its development and delivery model: human intent enters through the ChatGPT Project; ChatGPT operates the GitHub repository; GitHub Actions performs CI/CD; Cloudflare is the production runtime.
- Zero-local development is an explicit project property. A local checkout, local build, git command, or Wrangler command is not required from the human for normal development or release.
- CI remains the production quality gate. Product-relevant pushes to `main` run CI automatically.
- Deploy is triggered through `workflow_run` only when CI concluded successfully, the triggering CI event was a trusted `push`, and the branch was `main`. Pull-request CI cannot enter the production deploy path.
- Automatic Deploy checks out `workflow_run.head_sha`, verifies that exact revision, and deploys the exact commit that passed CI rather than an unrelated newer checkout.
- Production Deploy runs are serialized with concurrency group `production-deploy`; an in-progress deployment is not cancelled mid-migration/deploy.
- `workflow_dispatch` is retained as a recovery/re-run fallback, not as the normal release path.
- Pure `.chatgpt/**`, `docs/**`, and `README.md` pushes are ignored by CI so RPM checkpoints and documentation edits do not create production releases.
- The reusable operating model is documented at `docs/CHATGPT_GITHUB_CLOUDFLARE_PLAYBOOK.md` under the name AI-Native Repository Delivery.
- The zero-touch path was validated in production: CI run 86 passed for commit `052cc4a9a800803ed8ff398e22ea832e505a474b`; GitHub automatically created Deploy run 4 with no human click; Deploy checked out that exact SHA, reused D1, found no pending migrations, deployed Cloudflare Worker version `daae83d8-4ee2-46d1-8674-1c23391260ff`, and passed `/api/health` plus `/api/ready` on the first attempt.

## 2026-08-26 — Spin out the delivery model as ZeroLocal

This decision records the handoff from the founding application into a standalone methodology project.

- The public-facing name for the reusable development model should be **ZeroLocal** because it communicates the user-visible property more directly than the ANRD acronym. `AI-native repository delivery` remains a useful technical description rather than the primary brand.
- The methodology should move into a dedicated ChatGPT Project named `ZeroLocal` with project-only memory so product-specific conversations from `awesome-fame-slider` do not become the durable context for the standard.
- The planned canonical specification repository is `iorLab/zerolocal`.
- The planned Cloudflare reference implementation repository is `iorLab/zerolocal-cloudflare-starter`.
- `mattamior/awesome-fame-slider` remains the founding case study and production proof that zero-local, CI-gated, zero-touch delivery works end to end.
- The `iorLab` GitHub App installation has been authorized for all organization repositories and access was verified from ChatGPT. New repositories created under `iorLab` should therefore be accessible without a second repository-selection step.
- At this checkpoint the new `ZeroLocal` ChatGPT Project and the two `iorLab` repositories have not yet been created. Those are the next human bootstrap actions.
- Once created, the first ZeroLocal Project turn should initialize RPM from `iorLab/zerolocal`, treat GitHub as canonical, cite `mattamior/awesome-fame-slider` as the founding case study, and begin **ZeroLocal Specification v0.1** plus the Cloudflare starter.
- ZeroLocal should later be evaluated as a reusable ChatGPT Skill and, once the protocol and adapters stabilize, as a Plugin that can package procedural skills, integrations, and starter templates for other users.

## 2026-08-28 — Align the public product brand with Awesome Fame Slider

This decision supersedes the earlier clause that intentionally kept `Slide Rheostat` as the on-page product name after the repository/infrastructure rename.

- The public product display name is now **Awesome Fame Slider**.
- The repository name, app header, browser title, Open Graph title, shared verdict-page title/link text, and generated social-card header should all use Awesome Fame Slider.
- `Reputation rheostat` remains useful descriptive language for the interaction concept, but it is no longer the product name.
- The social-card cache revision was bumped from v4 to v5 so X/OG crawlers and CDN caches do not retain the old Slide Rheostat branding.
- The rename shipped through PR #17 and main commit `8a345198c6cd21f711b3198694ddf03b80cfc563`.
- Production Worker version `1b2654c4-ea95-4b19-ba76-7f027b02f5af` serves share-card revision v5; the selected-rank sentinel, all 48 share-page/card checks, and the self-cleaning vote-upsert smoke passed on Deploy run `33096079530` after edge propagation settled.

## 2026-08-28 — Add persistent bilingual UI and light/dark themes

- Awesome Fame Slider supports explicit **Chinese / English** switching as a product-level setting rather than translating only isolated labels.
- On first visit, locale follows the browser language; once the user chooses a locale, that preference persists in `localStorage` and updates the document language.
- Person/rank labels, community state, vote/share actions, notices, results, explanatory copy, and share text localize together. English rank labels use Latin surnames/names rather than mixed Chinese/Latin forms.
- Rank/deep links and X share URLs carry `lang=zh` or `lang=en`, and Worker-rendered share pages localize `html lang`, title, description, link text, and X/Open Graph metadata from that parameter.
- Awesome Fame Slider also supports explicit **light / dark** switching. First visit follows `prefers-color-scheme`; an explicit theme choice persists in `localStorage`.
- Theme is applied before React renders to avoid a light-theme flash, and dark mode is visually adapted to the existing paper/mechanical design rather than implemented as a simple inversion.
- Locale/theme preferences are client-side presentation state only; they do not alter the anonymous voter cookie/hash or D1 vote identity.
- The social metadata/cache revision was bumped from v5 to v6 for the bilingual share-page rollout.
- The feature shipped through PR #18 and main commit `7cbbbbc2c15fb43744536a161001dcd9782bb13d`.
- Production Worker version `a2d41be0-2b04-44ea-9bde-a16eb727b31b` serves share revision v6. After the first bilingual crawler sentinel briefly raced stale edge metadata, rerunning the same Deploy after propagation passed the Chinese sentinel, the complete 48-share-page/card sweep, exact 1200×675 PNG checks, and the self-cleaning anonymous vote-upsert smoke on Deploy run `33102973784`.
