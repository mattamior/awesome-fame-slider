# Next Steps

1. Configure GitHub Actions repository secrets: `CF_API_TOKEN`, `CF_ACCOUNT_ID`, and `APP_ORIGIN`. No X credentials or D1 database ID secret are required.
2. Use the intended first production origin for `APP_ORIGIN`, initially `https://awesome-fame-slider.<account-subdomain>.workers.dev` unless a custom domain is configured first.
3. Run the GitHub Actions **Deploy** workflow. It runs tests/build, generates all 48 social cards, discovers or creates `awesome-fame-slider-db`, applies migrations, deploys the `awesome-fame-slider` Worker/static assets, and requires `/api/health` plus `/api/ready` to succeed.
4. Verify the live vote flow: choose person/rank -> `POST /api/people/:personId/vote` -> anonymous browser cookie -> D1 upsert -> aggregate status refresh.
5. Verify that changing a vote from the same browser/person moves the existing vote rather than increasing the total voter count.
6. Verify the live share flow: `Share to X` -> `https://x.com/intent/tweet` composer with verdict text + `/share/:person/:rank` URL, with no OAuth prompt from this app and no X API credentials.
7. Verify X/Open Graph crawling for `/share/:person/:rank` renders the corresponding generated 1200x675 result-card image and that human clicks return to the selected person/rank in the app.
8. Verify mobile layout and X in-app browser behavior before announcing the MVP publicly; confirm voting cookie persistence, Web Intent opening, live/offline state, and 429 messaging on narrow screens.
9. Add production-grade portrait/character artwork and make result cards visually match the on-page rheostat more closely after the functional launch path is verified.
10. Once production is verified, update RPM with the live URL and launch checkpoint.
