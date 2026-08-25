# Next Steps

1. Create the Cloudflare D1 database `slide-rheostat-db`, replace the placeholder database ID in `wrangler.jsonc`, and apply both migrations.
2. Configure the final `APP_ORIGIN` and deploy the Worker + React static assets to Cloudflare Workers.
3. Create/configure the X Developer App as a confidential Web App, set the exact callback `${APP_ORIGIN}/api/auth/x/callback`, and add `X_CLIENT_ID` / `X_CLIENT_SECRET` as Worker secrets.
4. Ensure X API credits are available for pay-per-use media upload and Post creation.
5. Verify the complete live flow: choose person/rank -> generate PNG -> OAuth PKCE -> media upload -> Post creation -> D1 share event -> vote upsert -> aggregate status refresh.
6. Add production-grade portrait/character artwork and make the share card visually match the on-page rheostat while keeping the current browser-generated PNG mechanism.
7. Replace generic English `rank N/6` Post copy with each person's actual localized verdict label while preserving a short deep link.
8. Add build/Worker validation in CI when workflow-write capability is available; until then verify with `npm run build`, `wrangler types`, and a deploy dry run in a networked environment.
9. Add abuse controls after the first live test (pending OAuth cleanup, basic request throttling, and telemetry around failed X transactions).
10. Verify mobile layout and X in-app browser behavior before announcing the MVP publicly.
