# Primary domain change — registrar and GitHub settings activated

New primary: https://triadhomesandliving.com

Owner confirmed the GitHub Pages custom domain and successful DNS check. HTTPS returned 200 for the new homepage. Rebuilding the site refreshes canonical URLs and the sitemap; old-domain redirects and Move Plan links are verified separately during cutover.
Old primary: https://triadhomesliving.com

Cloudflare account: c4dceca298b4b3abd16e7e4bbfba605c
New zone: c83ce9b9336a86b7281898cc9ed10725
Old zone: 31ae4119ba5a2e7c9817078a448590ad
Required GoDaddy nameservers: damian.ns.cloudflare.com and desiree.ns.cloudflare.com.

New apex CNAME points to tobymrussell-code.github.io; www points to the apex. The records are staged in the pending zone. No existing MX/TXT records were found at the new domain. Old DNS, email sender, private requests, and production site are preserved pending activation.

## Cutover checklist

1. Confirm GoDaddy delegates to the two assigned nameservers and Cloudflare marks the new zone active. Preserve any newly added mail records before moving DNS.
2. The migration branch is merged. The registrar nameservers were confirmed on November 20, 2026. GitHub rejected changing the Pages domain through GITHUB_TOKEN with HTTP 403, despite Pages-write permission. Set triadhomesandliving.com in repository Settings > Pages > Custom domain, then retry deployment. The deployment uses configure-pages outputs for the active site origin; it no longer attempts a forbidden settings update or depends on the old CUSTOM_DOMAIN repository variable. No new token or secret is stored.
3. Check the workflow and Pages certificate provisioning. Use DNS-only new-domain records for GitHub's certificate validation if necessary, and wait for a valid HTTPS origin before enabling strict proxying. Do not disable TLS verification.
4. Deploy the changed Move Plan modules preserving DB/AI/EMAIL bindings and five-minute cron. Public guide, privacy and image links use the new primary domain. The existing move.triadhomesliving.com intake and private plan links stay functional; email sending remains on the verified plans.triadhomesliving.com domain. A separate new Move Plan hostname can be added once the new zone is active; never abandon older buyer links.
5. Enable the staged 301 redirect for only triadhomesliving.com and www.triadhomesliving.com after new HTTPS and key pages are verified. Keep path and query. Do not redirect the old Move Plan or sending subdomains. Check existing redirect rules before updating them.
6. Verify homepage, guide, contact, canonical URLs, sitemap, robots, questionnaire/thank-you and private plan assets. Confirm www resolves to the new canonical host. Verify Search Console's new property and submit its sitemap; retain old-domain verification and use Change of Address after verified redirects. Update GA4 web stream domain through authorized access when available.

Validation completed before cutover: static build with SITE_ORIGIN/CUSTOM_DOMAIN set to the new domain; all 64 pages and 2,259 internal links passed site checks; Move Plan access and delivery tests passed. No production requests were resent.
