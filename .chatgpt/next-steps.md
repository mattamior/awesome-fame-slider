# Next Steps

## ZeroLocal spinout

1. Create a new ChatGPT Project named `ZeroLocal` and use project-only memory.
2. In `iorLab`, create two empty repositories: `iorLab/zerolocal` and `iorLab/zerolocal-cloudflare-starter`. The `iorLab` GitHub App installation is already authorized for all repositories and has been verified from ChatGPT.
3. Add ZeroLocal Project Instructions that make `iorLab/zerolocal` canonical, require RPM at `.chatgpt/project-memory.yaml`, forbid asking for secrets in chat, and prefer GitHub-native zero-local operation.
4. Start the new Project with: canonical repo `iorLab/zerolocal`; reference implementation `iorLab/zerolocal-cloudflare-starter`; founding case study `mattamior/awesome-fame-slider`; initialize RPM; begin ZeroLocal Specification v0.1.
5. In the ZeroLocal project, define the core protocol, roles, lifecycle, trust boundary, Repository/RPM/CI/Deployment/Provider contracts, conformance model, and Cloudflare reference implementation.
6. After Specification v0.1 and the starter stabilize, build a reusable ZeroLocal Skill, then evaluate a Plugin packaging skills, integrations, and starter templates for other users.

## awesome-fame-slider product verification

7. Open `https://awesome-fame-slider.mattamior.workers.dev` in a normal browser and verify the live vote flow: choose person/rank -> cast vote -> anonymous browser cookie -> D1 upsert -> aggregate status refresh.
8. From the same browser/person, change the rank and cast again. Confirm the total voter count does not increase and the existing vote moves to the new rank.
9. Verify the live share flow: `Share to X` -> `https://x.com/intent/tweet` composer with verdict text + `/share/:person/:rank` URL, with no OAuth prompt from this app and no X API credentials.
10. Verify X/Open Graph crawling for `/share/:person/:rank` renders the corresponding generated 1200x675 result-card image and that human clicks return to the selected person/rank in the app.
11. Verify mobile layout and X in-app browser behavior before announcing the MVP publicly; confirm voting cookie persistence, Web Intent opening, live/offline state, and 429 messaging on narrow screens.
12. Decide whether to keep the current `workers.dev` URL for the initial public test or attach a custom domain before announcement.
13. Add production-grade portrait/character artwork and make result cards visually match the on-page rheostat more closely after the functional launch path is verified.
14. Once production behavior is verified, update RPM with the verified live URL, any custom-domain choice, and a launch checkpoint.
