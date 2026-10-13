module.exports = {
  name: 'Toby Russell', title: 'REALTOR®', license: '305135', licensedSince: '2016',
  phone: '336-203-8961', email: null,
  // Replace with your confirmed own-domain address. Null renders an honest placeholder.
  origin: (process.env.SITE_ORIGIN || 'https://tobymrussell-code.github.io/triad-homes-and-living').replace(/^http:/, 'https:').replace(/\/$/, ''),
  // The deployment workflow supplies the active hosting origin.
  // Purchased custom domain: triadhomesliving.com. Keep the Pages URL until DNS is connected.
  image: '/assets/toby-headshot.webp', imageWidth: 1280, imageHeight: 1280,
  formEndpoint: null, // Set an HTTPS POST handler before enabling direct submissions.
  dateModified: '2026-10-12', archiveMigrated: false,
  markets: ['Thomasville', 'Lexington', 'Davidson County', 'High Point', 'Winston-Salem', 'Greensboro', 'Archdale', 'Trinity', 'Wallburg', 'Welcome', 'Midway', 'Denton', 'rural Davidson County', 'Randolph County', 'the Triad'],
  sameAs: ['https://www.zillow.com/profile/tobyrussell','https://www.linkedin.com/in/toby-russell-6baa0678/','https://www.youtube.com/@TobyRussell','https://www.instagram.com/tobyrussell336_realtor/','https://www.tiktok.com/@toby.russell.real']
};
