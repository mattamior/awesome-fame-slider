# Next Steps

1. Re-run the GitHub Actions **Deploy** workflow from the latest `main`. Only `CF_API_TOKEN` and `CF_ACCOUNT_ID` are required; `APP_ORIGIN` is no longer used.
2. Confirm the Deploy workflow discovers the actual `https://awesome-fame-slider.<account-subdomain>.workers.dev` URL from Wrangler output and passes `/api/health` plus `/api/ready`.
3. Open the deployed URL and verify the live vote flow: choose person/rank -> `POST /api/people/:personId/vote` -> anonymous browser cookie -> D1 upsert -> aggregate status refresh.
4. Verify that changing a vote from the same browser/person moves the existing vote rather than increasing the total voter count.
5. Verify the live share flow: `Share to X` -> `https://x.com/intent/tweet` composer with verdict text + `/share/:person/:rank` URL, with no OAuth prompt from this app and no X API credentials.
6. Verify X/Open Graph crawling for `/share/:person/:rank` renders the corresponding generated 1200x675 result-card image and that human clicks return to the selected person/rank in the app.
7. Verify mobile layout and X in-app browser behavior before announcing the MVP publicly; confirm voting cookie persistence, Web Intent opening, live/offline state, and 429 messaging on narrow screens.
8. Add production-grade portrait/character artwork and make result cards visually match the on-page rheostat more closely after the functional launch path is verified.
9. Once production is verified, update RPM with the live URL and launch checkpoint.
