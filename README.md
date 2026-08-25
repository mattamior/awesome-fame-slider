# slide-rheostat

A reputation rheostat for the internet. Pick a public figure, slide their status, share your verdict to X, and update the community result.

## MVP stack

- React + TypeScript + Vite
- Cloudflare Workers for static assets + API
- Cloudflare D1 for votes
- X OAuth/API for authenticated share-and-vote

## Local development

```bash
npm install
npm run build
npm run cf:dev
```

Create the D1 database before production deploy, replace `REPLACE_AFTER_D1_CREATE` in `wrangler.jsonc`, then apply migrations.

## Vote rule

One current vote per X account per person. A successful authenticated X post updates that vote; repeat shares move the existing vote instead of adding duplicate voters. Share events are stored separately.
