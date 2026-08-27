# Next Steps

## Meme-pack rollout — final subject

1. Complete Demis Hassabis: source or assemble a recognizable six-rank public internet meme/image pack from stable assets, wire fixed roster / community SUBJECT / explicit-selection large art, regenerate his six X cards, pass CI/Deploy, then RPM checkpoint.
2. After all eight people are complete, add and run a production sweep of `/share/:person/:rank` and `/share-cards/:person-:rank.png` for all 48 combinations, checking exact crawler metadata and `image/png` responses.
3. Keep the established semantics for Demis: fixed default roster image; SUBJECT follows community leader; refresh defaults large art to community leader; explicit user selection takes over large art; slider uses a mechanical pointer; X shares preserve the user's selected rank image.
4. Prefer pinned or stable existing internet assets and record source URLs. Configured meme/image assets must succeed at build time; do not silently substitute the generic avatar.

## Launch verification after visual rollout

5. Verify anonymous vote upsert end to end in a normal browser: vote once, vote again for the same person, confirm total voter count stays constant and the vote moves ranks.
6. Verify mobile layout and X in-app browser behavior: cookie persistence, Web Intent/native share behavior, live/offline state, and 429 messaging.
7. Decide whether to keep the workers.dev URL for public launch or attach a custom domain.
8. Record the final launch checkpoint in RPM after the full 8-person visual rollout and production verification are complete.
