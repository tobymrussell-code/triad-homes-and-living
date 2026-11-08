# Personalized Move Plans

Production intake: https://move.triadhomesliving.com/
Review desk: https://move.triadhomesliving.com/admin

The public local guide stays open. Its calls to action lead to the questionnaire. Answers are saved in D1 and sent to the existing HubSpot questionnaire form. Email confirmation unlocks generation; Cloudflare Workers AI writes the welcome and fit notes using deterministic matches from the maintained Areas records. Drafts require Toby's review and explicit approval. Delivery defaults to the day after intake; the editor can choose another time. A five-minute cron drains the durable queue.

## Review a plan

1. Open the review desk and email the sign-in link to Toby's fixed Gmail account.
2. Open a request, check the workplace, regular stops, reference listing links, and all four road routes. City-only workplace matches require manual review. Time estimates do not include live traffic.
3. Resolve warnings by updating Areas or correcting the plan, then regenerate or save. Edit the welcome, location notes and personal email note.
4. Set the delivery time and Approve. Unresolved warnings, missing routes, outdated evidence, unsupported home criteria or insufficient separated locations block approval.
5. Check Delivery status. Failed email sends require checking the provider before manual retry; uncertain sends are never retried automatically.

Areas provides editable reference homes with source links and checked dates, not invented city-wide price ranges. Seed records are Zillow reference listings retrieved November 8, 2026; availability must be checked and evidence expires after 30 days. Generic single-family records require construction-status review when buyers specifically want new or existing homes. Add more towns and verified reference homes as demand grows. Town resources manages guide links, official resources and optional call-booking URLs. Without a booking URL, the call action opens an email request to Toby rather than claiming a reserved appointment.

## Runtime and deployment

Worker name: `triad-move-plans`. Custom domain and D1 IDs are in wrangler.jsonc. Bindings: D1 `DB`, Workers AI `AI`, Email Sending `EMAIL`. Sending subdomain DNS is configured in Cloudflare. Sender: Toby Russell, REALTOR®, `toby@plans.triadhomesliving.com`; replies go to `tobymrussell@gmail.com`. No authentication secrets live in this repository. Deploy the four ESM modules, preserving all three bindings and the cron. With authorized Wrangler access, run `npx wrangler deploy` from this folder. Apply schema.sql to D1 for initial setup only; do not overwrite production leads. seed-areas.json is the initial source snapshot, not a scheduled listing refresh.

Geocoding: Nominatim, serialized, cached and identified. Routing: OSRM road routes, cached seven days. Map display: MapLibre + OpenFreeMap, with a Leaflet/Canvas vector-tile fallback for devices without WebGL. Known-brand nearby alternatives are shown only when a distinct geocoded branch is found. Public service outages leave an incomplete draft for review; no fabricated fallback numbers. Matching uses budget, home/yard/bedrooms, commute and routine places only. Free public service capacity is limited; monitor usage and move to a supported provider if traffic grows. Workers AI and Email Sending usage is subject to the account's existing rates and limits; no paid plan upgrade was purchased.

## Tests and privacy

`node --test move-plan-app/workflow.test.mjs` uses SQLite and mocks only external providers. It covers submission, HubSpot, single-use email tokens, private access isolation, review/approval concurrency, delivery failures/retry, and matching constraints. Main static website: `SITE_ORIGIN=https://triadhomesliving.com npm run build` then `SITE_ORIGIN=https://triadhomesliving.com npm run verify`.

Tokens expire in 30 minutes, stored hashed; secure HttpOnly cookies last seven days. Buyer sessions are scoped to one request. Private pages are no-store, noindex and use no-referrer; YouTube iframes explicitly send only the origin needed for playback. Only source locations, never contact information, go to geocoding/routing. The AI receives only first name and home/travel criteria. The review desk shows delivery status. For deletion requests, remove the lead and associated sessions/tokens/outbox/audit using the authorized database operator; no public deletion endpoint exists. No reusable promotional video has been added.
