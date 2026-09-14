# CI asset repair evidence — 2026-09-14

During Agnir installation PR verification, CI run `34830827644` reached `npm run build` after `npm install` and all 9 tests passed, then failed while generating share cards because configured Dario asset `https://i.imgflip.com/2/avgcsc.jpg` returned HTTP 404.

The failure was unrelated to Agnir activation files but blocked safe merge under the Project's existing CI gate.

Repair:

- Preserve the existing fail-closed remote-asset build policy.
- Replace only the dead Dario rank asset with Wikimedia Commons file `Dario Amodei at TechCrunch Disrupt 2023 02.jpg`.
- Direct replacement URL: `https://upload.wikimedia.org/wikipedia/commons/d/d8/Dario_Amodei_at_TechCrunch_Disrupt_2023_02.jpg`.
- Source page identifies TechCrunch as author/source and CC BY 2.0 as the license; attribution is recorded in `docs/ASSET_SOURCES.md`.
- The replacement URL was directly opened successfully before publication.

A fresh PR CI run is required after this repair; green CI remains the merge gate.
