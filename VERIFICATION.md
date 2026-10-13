# Historical pre-migration verification

This report records the original October 12 build. Its performance and Rich Results checks do not certify the newer version 9 source or the new host. Use the migration report for current hosting checks.

# Build verification — October 12, 2026

## Completed

- 42 distinct routes, including all requested core pages, eight area pages, and 18 Markdown guide seeds.
- Full Lexington article text confirmed in a direct HTTP response without executing JavaScript.
- Every page has one h1, logical heading nesting, a unique title under 60 characters, a unique description of 150–160 characters, and an absolute canonical pointing to its own Sites URL.
- 1,218 internal links checked against generated output. Guide-to-area and area-to-guide relationships are explicit and verified. Every guide has 2–4 explicit related guides.
- 18 distinct normalized guide primary keywords. The guide index exposes the keyword register to make competing topics easier to spot; semantic overlap still calls for editorial review.
- All 42 pages checked at 360 pixels wide in both light and dark mode, with no horizontal overflow.
- Guide search tested: “due diligence” returns the matching guide. Contact message preparation tested and clearly reports that nothing has been sent.
- All JSON-LD parses. Each rendered FAQ question matches its schema; 35 pages contain FAQs. Brokerage Organization and WebSite markup appears throughout; breadcrumbs appear below the root; guides include Article markup; area pages include Place and an agent serving that area.
- Google Rich Results Test code mode run on the generated structured data for every one of the 42 routes: valid items detected, no invalid items. Home and the flagship guide were also tested using their rendered full HTML. Google reports non-critical recommendations; the agent's local-business item has an optional missing priceRange. No unverified value was invented to fill it. Google does not display every Schema.org type as a supported rich-result item; the rendered FAQ and Place data was also checked locally. These results do not guarantee an actual search enhancement or citation.
- Mobile Lighthouse audits of home, flagship guide, and contact page: Performance 100, Accessibility 100, Best Practices 100, SEO 100 on each. Measured LCP: 1.5 seconds, 1.3 seconds, and 1.1 seconds respectively. CLS 0; total blocking time 0 ms. These are local lab measurements, not field Core Web Vitals or measured INP. Remaining pages share the templates and assets but were not individually Lighthouse-audited.
- The phone is sourced as 336-203-8961. No other phone number found in source or generated HTML; telephone links normalize to that number.
- Brokerage name exists in exactly one text source file: `config/brokerage.js`. A separate-copy switch test changed that file only, rebuilt the site, and confirmed no old firm name or brokerage tool domain remained in generated text across 47 files.
- Exact original brokerage PNG retained; decoded pixels match the lossless WebP copy. Exact headshot original preserved without crop or retouch. Responsive copies preserve the full image.
- Generated sitemap includes all 42 routes and lastmod values. robots.txt includes every requested crawler. llms.txt derives brokerage details from the same config.
- Production dependency audit reports zero vulnerabilities. The static deployment contains no dependency runtime. The development dependency tree still reports nine build-tool advisories; do not use it as a public server or process untrusted templates. The known image-processing dependency was updated to its patched version.

## Remaining before a public business launch

1. Confirm the intended custom domain and an own-domain professional email. The verified Sites origin currently supplies every canonical; the email is visibly marked as pending and omitted from schema rather than invented.
2. Configure and test a real receiving service for contact-form POST requests. Currently the form prepares a message on the visitor’s device; direct phone contact works and remains visible without JavaScript. It does not automatically send or store information.
3. Supply and migrate the original approved guide archive. All 18 seeds are explicitly marked starter drafts and have honest new publication dates. No archive migration is claimed.
4. Review the starter guides, policy wording, and exact brokerage disclosure for public use. Add testimonials only with verified wording, source, and permission.
5. Connect the custom domain before changing the canonical origin, rebuild, republish, and verify on that origin. Public crawler access requires a public audience; the initial Sites deployment is private.
6. Measure hosted performance and real visitor Core Web Vitals after launch. Field INP cannot be certified before there are real interactions and monitoring.

The office address was supplied directly by Toby: 500 W 5th Street, Winston Salem, NC 27101. This supersedes any other office location found on the brokerage directory.

## October 13 update

Removed visible email placeholders, guide draft notices and copy-only forms. Added call/SMS links and replaced investor offer content with an America Home Buyers link and licensee-buyer disclosure. Earlier contact-form launch notes are superseded; a real submission endpoint and receipt test remain outstanding. No browser QA was available for this update.

## HubSpot embed update

Installed owner-provided HubSpot form on contact and 18 guide pages, retained call/SMS fallback and updated privacy notice. Structural and syntax checks pass. Browser rendering, HubSpot receipt, notification delivery and kvCORE transfer are not verified.

## Homepage and reviews cleanup

Removed public testimonial instruction, prioritized Google, shortened Jared and Mark quotes to complete verbatim sentences in the Google notifications; Jennifer’s sentence preserved verbatim. All eight areas are linked on home. Homepage names Thomasville/Lexington NC and uses conversational text. Added public channel video 8UPd8fObzF8 beside Meet Toby with privacy-enhanced iframe and YouTube fallback link. Full live Google review text and browser playback not verified.
