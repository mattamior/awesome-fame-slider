# Next Steps

1. Scaffold the React application and data-driven character schema for the initial eight-person roster.
2. Define each person's rank labels and initial visual assets, starting with Liang Wenfeng, Elon Musk, Sam Altman, and Tibo.
3. Choose the minimal backend stack for X OAuth, media upload, post creation, and vote persistence.
4. Implement X OAuth 2.0 Authorization Code with PKCE using the minimum required scopes (`tweet.read`, `tweet.write`, `users.read`, `media.write`; add `offline.access` only if persistent sessions are needed).
5. Implement the `Share & Vote` transaction: validate person/rank, upload the result image, create the X post, then record/update the user's vote only after the X API returns success.
6. Implement one-active-vote-per-X-account-per-person semantics and store the created X post ID for audit/deduplication.
7. Show the community vote distribution on each person page and derive a current community rank from the votes.
8. Generate or pre-render share cards for every person/rank pair and include a deep link back to that exact person/rank state.
9. Add parody/disclaimer copy and bilingual share text.
10. Deploy a first playable build and validate the complete X auth -> image post -> vote -> aggregate-status loop.
