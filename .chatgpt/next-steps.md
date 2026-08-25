# Next Steps

1. Let GitHub Actions finish the corrected build/Worker validation and fix any remaining TypeScript or Wrangler errors it exposes.
2. Create the Cloudflare D1 database `slide-rheostat-db`, replace the placeholder database ID in `wrangler.jsonc`, and apply both migrations.
3. Configure the final `APP_ORIGIN` and deploy the Worker + React static assets to Cloudflare Workers.
4. Create/configure the X Developer App as a confidential Web App, set the exact callback `${APP_ORIGIN}/api/auth/x/callback`, and add `X_CLIENT_ID` / `X_CLIENT_SECRET` as Worker secrets.
5. Ensure X API credits are available for pay-per-use media upload and Post creation.
6. Verify the complete live flow: choose person/rank -> generate PNG -> OAuth PKCE -> media upload -> Post creation -> D1 share event -> vote upsert -> aggregate status refresh.
7. Add production-grade portrait/character artwork and make the share card visually match the on-page rheostat while keeping the current browser-generated PNG mechanism.
8. Add basic abuse controls after the first live test, especially request throttling and telemetry around failed X transactions; expired pending OAuth cleanup is already implemented.
9. Verify mobile layout and X in-app browser behavior before announcing the MVP publicly.
10. Once production is verified, update RPM with the live URL and launch checkpoint, then stop the recurring implementation task.
