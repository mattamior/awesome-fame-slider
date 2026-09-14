# Asset Sources

This project uses meme/community imagery only where it is intentionally selected and attributed.

## Liang Wenfeng

- Visual: the circular rheostat thumb from `cholf5/liang-slider`.
- Source repository: https://github.com/cholf5/liang-slider
- Source file: https://github.com/cholf5/liang-slider/blob/main/img/thumb.png
- Upstream repository license: MIT.
- Usage here: parody / transformative internet-culture commentary inside the Liang Wenfeng reputation rheostat and its generated social cards.

The website falls back to the local illustrated avatar if the upstream image cannot be loaded, and the share-card builder falls back to the local illustrated avatar if the upstream fetch fails during CI.

## Dario Amodei — stable replacement asset

- Runtime/build asset: https://upload.wikimedia.org/wikipedia/commons/d/d8/Dario_Amodei_at_TechCrunch_Disrupt_2023_02.jpg
- Source page: https://commons.wikimedia.org/wiki/File:Dario_Amodei_at_TechCrunch_Disrupt_2023_02.jpg
- Author/source: TechCrunch, originally published on Flickr.
- License: Creative Commons Attribution 2.0 Generic (CC BY 2.0).
- Usage here: one Dario rank visual and its generated social-card derivative.
- Reason for replacement: the previously configured Imgflip asset `https://i.imgflip.com/2/avgcsc.jpg` began returning HTTP 404 during CI on 2026-09-14.

The build remains fail-closed for configured remote rank assets: dead sources must be repaired or deliberately replaced rather than silently hidden with a generic avatar.
