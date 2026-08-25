# slide-rheostat

A reputation rheostat for the internet. Pick a public figure, slide their status, share your verdict to X, and update the community result.

## MVP stack

- React + TypeScript + Vite
- Cloudflare Workers for static assets + API
- Cloudflare D1 for votes, pending OAuth shares, and lightweight share-start rate limiting
- X OAuth 2.0 PKCE + X API v2 for authenticated image-post-and-vote

## Local development

```bash
npm install
npm run build
npm run cf:dev
```

## Cloudflare deployment

1. Create a D1 database named `slide-rheostat-db`.
2. Replace `REPLACE_AFTER_D1_CREATE` in `wrangler.jsonc` with the D1 database ID.
3. Apply all migrations:

```bash
npm run db:migrate:remote
```

4. Configure Worker secrets:

```bash
npx wrangler secret put X_CLIENT_ID
npx wrangler secret put X_CLIENT_SECRET
```

5. Set `APP_ORIGIN` in `wrangler.jsonc` to the final Worker/custom-domain origin and configure this exact X OAuth callback in the X Developer Console:

```text
${APP_ORIGIN}/api/auth/x/callback
```

6. Deploy:

```bash
npm run cf:deploy
```

7. Verify liveness and production readiness:

```text
GET /api/health
GET /api/ready
```

`/api/ready` returns HTTP 200 only when the required D1 tables are present and the production X credentials plus app origin are configured. The Worker explicitly runs first for `/api/*`; SPA navigation and static assets are served by Workers Static Assets.

## Share & vote transaction

1. The browser renders a 1200×675 PNG result card for the selected person/rank.
2. `/api/x/share/start` validates the payload, applies a lightweight per-IP 10-minute rate limit, stores a short-lived pending share, and starts OAuth 2.0 Authorization Code + PKCE with `tweet.read tweet.write users.read media.write`.
3. The callback exchanges the code, resolves the authenticated X user, uploads the PNG, and creates the X Post.
4. Only after X returns a successful Post ID does D1 insert the share event and upsert the user's active vote.

## Vote rule

One current vote per X account per person. A successful authenticated X post updates that vote; repeat shares move the existing vote instead of adding duplicate voters. Share events are stored separately.

## Notes

- Web Intent fallback may open the normal X composer when API credentials are unavailable, but it never counts a vote.
- X API v2 is pay-per-use, so production launch requires Developer Console credits in addition to App credentials.
- The rate limiter stores only a short hash derived from the request IP and app origin, not the raw IP; stale limiter rows are cleaned opportunistically.
