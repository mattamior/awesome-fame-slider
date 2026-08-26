# Next Steps

1. Configure GitHub Actions repository secrets: `CF_API_TOKEN`, `CF_ACCOUNT_ID`, `APP_ORIGIN`, `X_CLIENT_ID`, and `X_CLIENT_SECRET`. The Deploy workflow now discovers or creates `slide-rheostat-db` automatically, so no D1 database ID secret is required.
2. In the X Developer Console, configure the exact callback `${APP_ORIGIN}/api/auth/x/callback` and ensure sufficient API credits are available.
3. Run the GitHub Actions **Deploy** workflow. It runs worker unit tests before build, resolves/creates the production D1 database, applies all migrations, deploys the Worker/static assets, configures X secrets, and requires `/api/health` plus `/api/ready` to succeed.
4. Verify the complete live flow: choose person/rank -> generate PNG -> OAuth PKCE -> media upload -> Post creation -> D1 share event -> vote upsert -> aggregate status refresh.
5. Verify that a second successful share from the same X account/person moves the existing vote rather than increasing unique voter count.
6. Add production-grade portrait/character artwork and make the share card visually match the on-page rheostat while keeping the current browser-generated PNG mechanism.
7. Verify mobile layout and X in-app browser behavior before announcing the MVP publicly; confirm OAuth return, offline/live state, and 429 messaging on narrow screens.
8. Once production is verified, update RPM with the live URL and launch checkpoint, then stop the recurring implementation task.
