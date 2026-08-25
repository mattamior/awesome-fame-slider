# Decisions

## 2026-08-26 — Initialize RPM

- The GitHub repository `mattamior/slide-rheostat` is the canonical source of truth for project state.
- RPM state is stored under `.chatgpt/`.
- The manifest is `.chatgpt/project-memory.yaml`.
- Project state, next steps, and durable decisions are tracked in the files referenced by that manifest.

## 2026-08-26 — Initial product constraints

- The application will be a simple React frontend.
- The concept is inspired by the 梁文锋“滑动变阻器/滑动变祖器” meme, but the product is not Liang-only.
- The product should support many recognizable public figures.
- X is a primary distribution surface; the experience should be easy to share and fun to open/play from an X post.

## 2026-08-26 — X-native voting loop

- Add Tibo to the initial public-figure roster. The launch roster is currently Liang Wenfeng, Elon Musk, Sam Altman, Jensen Huang, Mark Zuckerberg, Dario Amodei, Demis Hassabis, and Tibo.
- The primary conversion action is `Share & Vote`: the user chooses a person's rank (for example `牢梁`) and publishes that verdict to X.
- The shared X post should contain the user's selected verdict, a deep link back to that state, and an attached result image.
- A vote is counted only after X confirms successful post creation. Opening a share composer or clicking a Web Intent is not sufficient evidence of a vote.
- Because X Web Intents do not provide the required verified media-post success flow, the product will use authenticated X API posting for the voting action.
- This requires a minimal backend/API layer despite the UI remaining a simple React application. The backend owns X OAuth token exchange, media upload, post creation, and vote persistence.
- Recommended vote integrity rule: one active vote per X account per person. A later successful share changes that account's current vote instead of incrementing unlimited duplicate votes. Raw successful-share count may be tracked separately if desired.
- Each person page will show the vote distribution and a derived community/current rank such as `梁子`.
