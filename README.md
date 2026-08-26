# awesome-fame-slider

A reputation rheostat for the internet. Pick a public figure, slide their status, cast an anonymous site vote, and share the verdict to X without paid X API writes.

The current product display name is **Slide Rheostat**.

## MVP stack

- React + TypeScript + Vite
- Cloudflare Workers for static assets, dynamic social share pages, and API
- Cloudflare D1 for anonymous device votes and lightweight network rate limiting
- X Web Intent for free pre-populated sharing; no X Developer App or X API credentials required
- Build-time 1200×675 PNG cards for X/Open Graph link previews

## Local development

```bash
npm install
npm run build
npm run cf:dev
```

`npm run build` generates 48 result cards (8 people × 6 ranks) into `public/share-cards/` before Vite copies them into the production bundle.

## Cloudflare deployment

### Recommended: GitHub Actions

The repository includes `.github/workflows/deploy.yml`. Configure these GitHub Actions repository secrets:

- `CF_API_TOKEN` — Cloudflare API token with Worker/D1 deployment access
- `CF_ACCOUNT_ID` — Cloudflare account ID
- `APP_ORIGIN` — final public origin, initially something like `https://awesome-fame-slider.<account-subdomain>.workers.dev`

Then run the **Deploy** workflow manually. It validates the three required values, runs tests, builds the React app and share cards, discovers an existing D1 database named `awesome-fame-slider-db` or creates it automatically, injects its UUID and the production origin into the runner-only Wrangler config, applies all remote migrations, deploys the `awesome-fame-slider` Worker/static assets, and smoke-tests `/api/health` plus `/api/ready`.

There is no X callback URL to configure and no X API credit requirement for the share flow.

### Manual Wrangler path

1. Create a D1 database named `awesome-fame-slider-db`.
2. Replace `REPLACE_AFTER_D1_CREATE` in `wrangler.jsonc` with the D1 database ID.
3. Apply all migrations:

```bash
npm run db:migrate:remote
```

4. Set `APP_ORIGIN` in `wrangler.jsonc` to the final Worker/custom-domain origin.
5. Deploy:

```bash
npm run cf:deploy
```

6. Verify liveness and production readiness:

```text
GET /api/health
GET /api/ready
```

`/api/ready` returns HTTP 200 when the anonymous voting tables and production app origin are configured. The Worker runs first for `/api/*` and `/share/*`; SPA navigation and generated card assets are served by Workers Static Assets.

## Vote flow

1. The visitor selects a person and one of six ranks.
2. `POST /api/people/:personId/vote` validates the rank and applies a per-network write limit.
3. The Worker creates or reuses a random HttpOnly browser cookie, hashes that opaque identifier, and stores only the hash in D1.
4. D1 upserts one active vote per anonymous browser device and person. Voting again moves that device's vote instead of increasing the voter count.
5. The API returns the refreshed aggregate distribution immediately.

The cookie is an abuse-reduction mechanism, not a claim of strong real-world identity. Clearing browser storage or switching devices can create another anonymous voter, so aggregate results should be treated as internet sentiment rather than verified-person polling.

## Share flow

1. The frontend opens `https://x.com/intent/tweet` with pre-populated verdict text and a result URL such as `/share/liang/1`.
2. X Web Intent handles login/composer UX without authorizing this application or calling the paid X API.
3. `/share/:personId/:rank` returns crawler-friendly Open Graph/X Card metadata whose `twitter:image` points at the corresponding generated 1200×675 PNG.
4. Human visitors who open that shared URL are redirected into the interactive app with the person and rank preselected.

Sharing and voting are deliberately independent: opening or publishing an X composer never creates, changes, or verifies a vote.

## Notes

- Current community results are never replaced with fabricated sample data when the API is unavailable.
- A short SHA-256-derived network identifier is used for rate limiting; raw request IPs are not stored in D1.
- Old OAuth/share-event tables remain in historical migrations for compatibility with databases created from earlier versions, but the current application does not use them.
