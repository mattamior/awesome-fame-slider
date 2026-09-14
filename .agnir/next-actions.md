# Next Actions

## Final device verification — active

1. Verify production on a real mobile browser: layout/safe-area behavior, Chinese/English switching and persistence, light/dark switching and persistence, anonymous cookie persistence across reloads, moving the same person's vote without creating an extra voter, live/offline behavior, and the user-facing 429 message if a controlled rate-limit test is practical.
2. Verify production inside the X in-app browser. Open rank-specific shared URLs with both `lang=zh` and `lang=en`; confirm selected rank and locale preservation, usable dark/light rendering, native Web Share or Web Intent behavior as exposed by that client, localized social previews, and usable return-to-site behavior.
3. After true-device checks pass, reconcile and publish the final launch checkpoint through Agnir. Do not update legacy RPM state as the active checkpoint system.
4. Keep `https://awesome-fame-slider.mattamior.workers.dev` as the v1 public origin. Add a custom domain only when there is a concrete branding/distribution need.

## Already complete

- All eight launch subjects have six-rank production image packs.
- Bilingual UI and locale-preserving share/deep links are shipped.
- Persistent light/dark themes are shipped.
- Share-card revision 7 provides 96 localized cards (8 people × 6 ranks × 2 locales).
- Automated deployment verification covers health/readiness, localized crawler metadata, exact 1200×675 PNG dimensions, and anonymous vote-upsert semantics.
- X sharing remains independent from voting and uses free Web Intent / native Web Share mechanics.
