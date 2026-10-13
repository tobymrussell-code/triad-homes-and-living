# Triad Homes and Living

Toby Russell’s static real estate website, hosted in a dedicated repository on GitHub Pages. Domain registration stays with GoDaddy; DNS is intended to move to Cloudflare. The purchased custom domain is **triadhomesliving.com**.

This migration starts from the latest Sites source commit `9804b7d6536b69011d2a380fe10890dc8855b848` (version 9). It preserves the 42 pages, 18 Markdown guides, HubSpot inquiry form, Call/Text alternatives, reviews, area photographs, YouTube embed, supplied portrait and brokerage logo, and phone 336-203-8961. All deployed assets are byte-for-byte copies of the latest source. Unmodified originals and the former source repository are retained in the private migration backup rather than published here.

## Development and publishing

Use Node.js 24. Run `npm ci`, `npm run build`, and `npm run verify`. `npm run dev` starts local development. Output is static HTML in `dist/`; page text does not depend on JavaScript.

A push to `main` triggers `.github/workflows/deploy-pages.yml`. It builds for the actual URL supplied by GitHub Pages, checks metadata and internal links, and uploads only `dist/`. Source files, configuration, and original backup images are not served as the website.

`SITE_ORIGIN` overrides the default temporary Pages origin. Its path controls internal link and image prefixes for a project site. When the custom domain is configured in GitHub Pages, the workflow uses that root origin automatically. Re-run the workflow after changing the Pages domain.

## Brokerage changes

Edit only `config/brokerage.js` and supply the approved new logo asset as described in `BROKERAGE-SWITCH.md`. Every page, disclosure, structured-data publisher, hosted search/valuation link, and AI summary reads the same configuration. Rebuild and deploy after a change.

## Guides and areas

Markdown guides are in `src/guides/` with title, description, slug, publication/modification dates, primary keyword, area slugs, FAQ entries, and explicit related guide slugs. Keep 2–4 related guides, maintain links in both directions with the relevant area definitions in `lib/content.js`, and merge competing primary topics instead of creating duplicate articles. Area definitions and their unique metadata are in `lib/content.js`.

## Current contact behavior

The current HubSpot form embed and its public portal/form identifiers are preserved. Call and Text alternatives remain visible, including when JavaScript is disabled. The migration does not submit a test lead or change the HubSpot account, recipients, or consent configuration. Verify actual form receipt with an authorized real test after the domain is connected. `config/site.js` still has no confirmed professional email; none has been invented.

## Custom domain

See `DOMAIN-SETUP.md` for the exact DNS records and cutover steps. Configure the domain in GitHub Pages before pointing DNS at GitHub. GoDaddy remains the registrar; only its nameservers change to the two values assigned by the new Cloudflare zone. Preserve any existing mail or verification records.

The domain currently has GoDaddy default nameservers; Cloudflare account access is required to obtain the exact assigned nameservers. Do not substitute the America Home Buyers domain or change its repository or DNS.
