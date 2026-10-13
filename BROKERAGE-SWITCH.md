# Changing brokerages

All brokerage details come from `config/brokerage.js`. Page content, the header, footer, disclosures, structured data, and AI summary read that file.

1. Open `config/brokerage.js` in a text editor.
2. Replace `brokerageName` with the new firm’s exact approved name.
3. Drop the exact approved logo into `src/assets/`. Keep its proportions and colors. Set `brokerageLogoPath` to `/assets/your-file-name` and set `brokerageLogoProvided` to `true`. Set `brokerageLogoWidth` and `brokerageLogoHeight` to the new file’s original dimensions. A new logo asset is needed; no page or template edits are needed.
4. Replace `brokerageOfficeAddress` with your office address of record.
5. Review `brokerageDisclosure`. Its default sentence automatically uses the new name; replace the sentence here if the new firm requires different wording.
6. Replace the three search, valuation, and market-report URLs with the new firm’s actual tools. Each opens outside this website.
7. Rebuild and republish. Saving a config edit alone does not update a static site that is already online.
8. Verify the header and footer on a phone and desktop, the office address and disclosure, all three tool destinations, `/llms.txt`, and the structured data. Check the new logo in both color themes. Search the generated site for the old firm’s name and domain.

Your own name, phone, license, email, and site domain stay in `config/site.js`. They do not depend on your brokerage. Remove obsolete logo files from the distributed assets after the new one is verified, while keeping an archival original outside the deployed assets.

A developer can run `npm run build` and `npm run verify` before deployment. Google’s Rich Results Test should also be repeated after the new site is live or by pasting generated HTML.
