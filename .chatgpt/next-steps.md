# Next Steps

## Production verification — active

1. Add and run a full production crawler/card sweep for all 8 people × 6 ranks. For every `/share/:person/:rank`, verify `twitter:card=summary_large_image`, exact `twitter:image` and `og:image`, PNG type metadata, and absence of crawler-hostile meta refresh. For every `/share-cards/:person-:rank.png`, verify a non-empty `image/png` response.
2. Keep the existing single-card post-deploy smoke as a fast sentinel, but make the 48-combination sweep part of the production Deploy verification path so regressions fail deployment verification automatically.
3. Verify anonymous vote upsert semantics end to end in production: use one temporary browser identity, cast a vote for one person, move that same vote to another rank, confirm total voter count does not increase, then remove the temporary test row so public totals are not polluted.
4. Verify mobile layout and X in-app browser behavior: cookie persistence, Web Intent/native share behavior, live/offline state, and 429 messaging.
5. Decide whether to keep the workers.dev URL for public launch or attach a custom domain.
6. Record the final launch checkpoint in RPM after the 48-card sweep, vote-upsert verification, and mobile/X verification are complete.

## Completed rollout

All eight initial subjects now have six-rank internet meme/image packs in production: Liang Wenfeng, Elon Musk, Sam Altman, Tibo Sottiaux, Jensen Huang, Mark Zuckerberg, Dario Amodei, and Demis Hassabis. Preserve the established semantics: fixed default roster image; SUBJECT follows community leader; refresh defaults large art to community leader; explicit user selection takes over large art; slider uses a mechanical pointer; X shares preserve the user's selected rank image.
