# Next Steps

## Meme-pack rollout — active

1. Complete Dario Amodei next: assemble a recognizable six-rank public internet image pack from stable sources, wire fixed roster / community SUBJECT / explicit-selection large art, regenerate his six X cards, pass CI/Deploy, then RPM checkpoint.
2. Complete Demis Hassabis next using the same semantics and checkpoint after production deployment.
3. For every completed person, keep the established semantics: fixed default roster image; SUBJECT follows community leader; refresh defaults large art to community leader; explicit user selection takes over large art; slider uses a mechanical pointer; X shares preserve the user's selected rank image.
4. Prefer pinned or stable existing internet assets and record source URLs. Configured meme/image assets must succeed at build time; do not silently substitute the generic avatar.
5. After all eight people are complete, add/run a production sweep of `/share/:person/:rank` and `/share-cards/:person-:rank.png` for all 48 combinations, checking exact crawler metadata and `image/png` responses.

## Launch verification after visual rollout

6. Verify anonymous vote upsert end to end in a normal browser: vote once, vote again for the same person, confirm total voter count stays constant and the vote moves ranks.
7. Verify mobile layout and X in-app browser behavior: cookie persistence, Web Intent/native share behavior, live/offline state, and 429 messaging.
8. Decide whether to keep the workers.dev URL for public launch or attach a custom domain.
9. Record the final launch checkpoint in RPM after the full 8-person visual rollout and production verification are complete.
