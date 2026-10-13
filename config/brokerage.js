// SWITCHING BROKERAGES? Edit only this file.
// Replace the name, logo file, office address, disclosure text, and the three
// brokerage-hosted URLs. Nothing else in the codebase needs to change.
const brokerageName = 'NorthGroup Real Estate';
module.exports = {
  brokerageName,
  brokerageLogoPath: '/assets/brokerage-logo.webp',
  brokerageLogoWidth: 315, brokerageLogoHeight: 125,
  brokerageLogoProvided: true, // Set true after dropping in the exact approved logo.
  brokerageOfficeAddress: '500 W 5th Street, Winston Salem, NC 27101',
  brokeragePostalAddress: {streetAddress: '500 W 5th Street', addressLocality: 'Winston-Salem', addressRegion: 'NC', postalCode: '27101', addressCountry: 'US'},
  brokerageDisclosure: `Toby Russell is a licensed real estate broker in North Carolina affiliated with ${brokerageName}.`,
  homeSearchUrl: 'https://tobyrussell.northgroupre.com/',
  homeValuationUrl: 'https://tobyrussell.northgroupre.com/sell.php',
  marketReportUrl: 'https://tobyrussell.northgroupre.com/market-report.php'
};
