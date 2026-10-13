# Connect triadhomesliving.com

Domain: **triadhomesliving.com**, without “and”. Toby confirmed it is purchased. No further domain purchase is required by this migration.

Provider arrangement: GoDaddy registration and renewals, Cloudflare authoritative DNS, GitHub Pages hosting in `tobymrussell-code/triad-homes-and-living`.

## GitHub Pages

Set the repository’s Pages publishing source to **GitHub Actions**. Set its custom domain to `triadhomesliving.com`. Deploy with the included workflow. The build uses Pages’ actual origin and base path, so after switching the domain, re-run the workflow to generate root-based links and matching canonical URLs.

## Cloudflare DNS records

Add the domain to the existing Cloudflare account on the appropriate plan. These website records should start as **DNS only** (grey cloud), with automatic TTL, so GitHub can validate the domain and issue HTTPS:

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | tobymrussell-code.github.io |

The www target is the GitHub account host, with no repository path. Replace the GoDaddy parking A records and the old www-to-apex CNAME in the Cloudflare zone. Preserve unrelated TXT, MX, and other records. Optional IPv6 AAAA records are listed in the official GitHub documentation if wanted.

Official source: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## GoDaddy nameservers

Use the **two nameservers assigned specifically to this Cloudflare zone**. Their exact values cannot be known until the zone exists in the authenticated Cloudflare account. In GoDaddy’s DNS/nameserver settings for this domain, replace `ns25.domaincontrol.com` and `ns26.domaincontrol.com` with those two assigned values. Keep the domain registered and renewing at GoDaddy.

The initial DNS check found no MX, TXT, or DS records. Re-check immediately before changing the records or nameservers in case Toby has added email or other services since that check.

## Verify after cutover

Confirm public NS answers match the assigned Cloudflare nameservers, the apex A answers match all four GitHub addresses, and www points to the account host. Wait for GitHub’s DNS check and certificate provisioning, then enforce HTTPS. Check the home page, an area page, contact form, guide, stylesheet, images, canonical links, sitemap, robots, and llms file on `https://triadhomesliving.com/`. Confirm www redirects to the selected apex domain.

A successful GitHub workflow proves the build is deployed; it does not prove the domain’s DNS or certificate has finished propagating.
