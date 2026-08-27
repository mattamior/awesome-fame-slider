# Next Steps

## Final device verification — active

1. Verify the production site on a real mobile browser. Confirm layout/safe-area behavior, anonymous cookie persistence across reloads, moving the same person's vote without creating an extra voter, live/offline state, and the user-facing 429 message if a controlled rate-limit test is practical.
2. Verify the production site inside the X in-app browser. Open a rank-specific shared URL, confirm the selected rank/deep-link state is preserved, exercise Share to X through native Web Share or Web Intent as exposed by that client, and confirm returning to the site leaves the experience usable.
3. Treat these two true-device checks as the only remaining launch verification. Repository CI already covers Worker revision convergence, health/readiness, all 48 social pages/cards, exact 1200x675 PNG dimensions, and self-cleaning production vote-upsert semantics.
4. After true-device checks pass, record the final launch checkpoint in RPM. Keep `https://awesome-fame-slider.mattamior.workers.dev` as the v1 public origin; attach a custom domain only when there is a concrete branding/distribution need.

## Completed automated verification

- All eight initial subjects have six-rank internet meme/image packs in production.
- Public product branding is aligned to **Awesome Fame Slider** across the app shell, browser/Open Graph metadata, shared verdict pages, and generated social cards.
- Production Deploy waits until `/api/health` and `/api/ready` confirm share-card revision 5, preventing verification from racing a stale Cloudflare edge Worker.
- Every Deploy validates all 8 people × 6 ranks: exact X/Open Graph image metadata, no crawler-hostile meta refresh, non-empty `image/png`, and exact 1200×675 dimensions for all 48 cards.
- Every Deploy runs a temporary anonymous-vote smoke test that inserts one voter/person row, moves it to another rank without duplication, then deletes the temporary row and confirms cleanup.
- X sharing remains independent from voting and uses free Web Intent / native Web Share mechanics; no X Developer App or paid write API is required.
