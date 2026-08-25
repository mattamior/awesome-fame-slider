# Next Steps

1. Confirm the latest GitHub Actions CI run after adding the production Deploy workflow and documentation; fix any errors it exposes.
2. In Cloudflare, create the D1 database `slide-rheostat-db` and capture its database ID.
3. Configure GitHub Actions repository secrets: `CF_API_TOKEN`, `CF_ACCOUNT_ID`, `CF_D1_DATABASE_ID`, `APP_ORIGIN`, `X_CLIENT_ID`, and `X_CLIENT_SECRET`.
4. In the X Developer Console, configure the exact callback `${APP_ORIGIN}/api/auth/x/callback` and ensure sufficient API credits are available.
5. Run the GitHub Actions **Deploy** workflow. It should apply all migrations, deploy the Worker/static assets, configure X secrets, and require `/api/health` plus `/api/ready` to succeed.
6. Verify the complete live flow: choose person/rank -> generate PNG -> OAuth PKCE -> media upload -> Post creation -> D1 share event -> vote upsert -> aggregate status refresh.
7. Verify that a second successful share from the same X account/person moves the existing vote rather than increasing unique voter count.
8. Add production-grade portrait/character artwork and make the share card visually match the on-page rheostat while keeping the current browser-generated PNG mechanism.
9. Verify mobile layout and X in-app browser behavior before announcing the MVP publicly; confirm OAuth return, offline/live state, and 429 messaging on narrow screens.
10. Once production is verified, update RPM with the live URL and launch checkpoint, then stop the recurring implementation task.
