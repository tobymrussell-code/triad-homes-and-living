# YouTube ↔ blog publishing workflow

## Existing site architecture
The /blog/ landing page organizes canonical Markdown guides located in `src/guides/`. The original guide permalink remains `/guides/<slug>/` to avoid duplicate URLs and SEO cannibalization.

## Attach a published YouTube video
On the matching Markdown guide, add these top-level YAML/JSON front-matter fields:

```json
"youtubeVideoId": "XXXXXXXXXXX",
"youtubeVideoTitle": "Descriptive, accurate video title"
```

Use the exact 11-character YouTube video ID of an **already public** video. The existing article automatically displays a privacy-enhanced, responsive, lazy-loaded YouTube embed and watch link above its main content. If no video is matched, it remains a normal standalone article. Do not attach a placeholder, unpublished, unrelated, or speculative video.

## New video routine
1. Check the public videos on Toby Russell's authorized YouTube channel: https://www.youtube.com/@TobyRussell.
2. Confirm the video is public and its exact title, URL and publication date.
3. Match it to an existing article *by actual topic* (not merely a similar town name). If there is no sufficiently matching article, draft a new unique article using `src/guides/` front matter conventions. Do not automatically publish an unreviewed article.
4. Add the exact `youtubeVideoId` and `youtubeVideoTitle` to its matched article, preserving helpful original text, FAQs, internal links, and local facts.
5. Ensure there is one canonical article for the topic. Update `dateModified` when substantially edited. Do not change the article URL just because a video is added.
6. Run `npm ci && npm run build && npm run verify`. Commit after checks; confirm GitHub Pages deployment succeeds.
7. Check the published blog/article and video embed work, then report the result and any unresolved issues.

Do not automatically claim an embed is live until production is verified. Avoid unsupported claims about property values or changing market statistics.
