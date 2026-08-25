# Next Steps

1. Let GitHub Actions finish validation after the rate-limit/readiness hardening and fix any remaining TypeScript or Wrangler errors it exposes.
2. Create the Cloudflare D1 database `slide-rheostat-db`, replace the placeholder database ID in `wrangler.jsonc`, and apply all three migrations.
3. Configure the final `APP_ORIGIN` and deploy the Worker + React static assets to Cloudflare Workers.
4. Verify `GET /api/health` and `GET /api/ready`; readiness must be HTTP 200 before launch testing.
5. Create/configure the X Developer App as a confidential Web App, set the exact callback `${APP_ORIGIN}/api/auth/x/callback`, and add `X_CLIENT_ID` / `X_CLIENT_SECRET` as Worker secrets.
6. Ensure X API credits are available for pay-per-use media upload and Post creation.
7. Verify the complete live flow: choose person/rank -> generate PNG -> OAuth PKCE -> media upload -> Post creation -> D1 share event -> vote upsert -> aggregate status refresh.
8. Add production-grade portrait/character artwork and make the share card visually match the on-page rheostat while keeping the current browser-generated PNG mechanism.
9. Verify mobile layout and X in-app browser behavior before announcing the MVP publicly; confirm the 429 rate-limit state is understandable on mobile.
10. Once production is verified, update RPM with the live URL and launch checkpoint, then stop the recurring implementation task.
