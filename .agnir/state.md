# Current State

Updated: 2026-09-14

## Project status

- Project: `awesome-fame-slider`
- Status: active
- Phase: final-device-verification
- Canonical repository: `mattamior/awesome-fame-slider`
- Production: `https://awesome-fame-slider.mattamior.workers.dev`
- Cloudflare Worker: `awesome-fame-slider`
- D1 database: `awesome-fame-slider-db`
- Latest production revision verified by automated deployment checks: `24fdeac4c02322cf3cd221694a598b2e73d92373`
- Share-card revision: `7`
- Repository `main` at Agnir cutover base: `4abf51306c407b2c56284d3356d13562687305e2`

## Product truth

- English product brand: **Awesome Fame Slider**.
- Chinese product brand: **弟位变祖器**.
- Frontend: Vite + React + TypeScript.
- Runtime: Cloudflare Workers with D1.
- Initial roster: Liang Wenfeng, Elon Musk, Sam Altman, Tibo Sottiaux, Jensen Huang, Mark Zuckerberg, Dario Amodei, and Demis Hassabis.
- All eight subjects have six-rank internet meme/image packs in production.
- The app supports persistent Chinese/English switching and persistent light/dark themes.
- Anonymous voting is D1-backed: one active anonymous browser-device vote per person; later votes update that row.
- Voting and X sharing are independent actions.
- X distribution uses native Web Share / free X Web Intent; no X Developer App or paid X write API is required.
- Shared verdict pages expose localized crawler metadata and exact 1200×675 PNG cards for the selected person/rank/locale.
- Community results never fall back to fabricated sample votes.
- Roster art is fixed neutral/default art; the SUBJECT art follows the community leader; the large image follows the community leader after refresh until the user explicitly selects a rank, then follows the selection.
- Meme/image subjects use a mechanical slider pointer rather than repeating the rank image in the thumb.

## Delivery truth

- Delivery is zero-local: GitHub PR/CI → `main` CI → automatic serialized Cloudflare Deploy → health/readiness/card/vote smoke checks.
- Deploy verifies the exact tested SHA, D1 migrations, `/api/health`, `/api/ready`, localized share metadata/cards, and a self-cleaning vote-upsert smoke test.
- Pure continuity/documentation changes are intended not to create production releases.
- The `workers.dev` hostname remains the v1 public origin; a custom domain is optional later.

## Remaining verification

Automated verification is green. The only launch verification still open is true-device testing in a normal mobile browser and the X in-app browser, including locale/theme persistence, native-share/Web Intent behavior, localized social previews, deep-link locale/rank preservation, and anonymous cookie persistence.

## Continuity system

Agnir Core/Profile `1.0` is now the canonical durable-continuity system. It supersedes RPM for Current State, Next Actions, Decisions, Evidence, and checkpoints. Legacy `.chatgpt/` files are retained only as historical migration material.
