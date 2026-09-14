# Decisions

This file is the active Agnir decision surface. The complete pre-Agnir chronology remains preserved in `.chatgpt/decisions.md` as legacy evidence; it is not the active decision log after the 2026-09-14 cutover.

## Active durable decisions imported from RPM

### Product and branding

- English product display name is **Awesome Fame Slider**.
- Chinese product display name is **弟位变祖器**.
- Repository, package, Worker, D1, and application identity namespaces remain `awesome-fame-slider`; localized branding does not rename infrastructure.
- `Reputation rheostat` is descriptive language, not the product name.

### Product behavior

- Launch roster: Liang Wenfeng, Elon Musk, Sam Altman, Tibo Sottiaux, Jensen Huang, Mark Zuckerberg, Dario Amodei, and Demis Hassabis.
- Voting and X sharing are independent.
- One active anonymous vote is stored per browser device/person; a later vote updates the existing row.
- Community results never fall back to fabricated sample votes.
- X sharing uses native Web Share / free `x.com/intent/tweet`; no X Developer App, OAuth write flow, or paid X write API is required.
- Shared verdict pages expose localized Open Graph/X metadata and build-time 1200×675 PNG result cards.
- Locale is preserved through `lang=zh` / `lang=en` deep links and share URLs.
- Theme is client-only presentation state and does not affect anonymous voter identity.
- Roster art is fixed neutral/default art; SUBJECT art follows the community leader; the large image follows the community leader after refresh until explicit user selection, then follows that selection.
- Meme/image subjects use a mechanical pointer on the slider.

### Delivery and infrastructure

- Frontend is Vite + React + TypeScript.
- Cloudflare Workers is the unified deployment target; D1 stores anonymous active votes and rate-limit state.
- The project follows AI-Native Repository Delivery / zero-local operation: ChatGPT operates the repository, GitHub Actions is the verifier/delivery control plane, and Cloudflare is runtime.
- Product-relevant `main` pushes run CI; Deploy is triggered only from successful trusted `main` CI and checks out the exact passing SHA.
- Production Deploy runs are serialized and are not cancelled mid-deploy/migration.
- `workflow_dispatch` is a recovery fallback, not the normal release path.
- Pure continuity/documentation changes should not create production releases.
- The current `workers.dev` origin is the v1 public origin; custom-domain work is deferred until there is a concrete need.

## 2026-09-14 — Agnir supersedes RPM

- Install Agnir from the latest published stable release, `v1.0.1`, exact authoritative source revision `f56d25b22997c259c660651e7357334b063093e1`.
- Adopt Agnir Core `1.0` + `repository-filesystem/1.0` for this Project.
- Agnir becomes canonical for Current State, Next Actions, Decisions, Evidence, fresh activation, and checkpoint evaluation.
- RPM is retired as an active continuity mechanism. Existing `.chatgpt/state.yaml`, `.chatgpt/next-steps.md`, and `.chatgpt/decisions.md` remain preserved as historical migration input/evidence.
- `.chatgpt/project-memory.yaml` remains only as a compatibility bridge that redirects old RPM-aware execution surfaces to `AGENTS.md → AGNIR.md → AGNIR.yaml`.
- Future `收尾`, `结束`, `先到这里`, `checkpoint`, `save progress`, repository commit, and equivalent save boundaries use Agnir checkpoint semantics.
