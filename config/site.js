module.exports = {
  name: 'Toby Russell', title: 'REALTOR®', license: '305135', licensedSince: '2016',
  phone: '336-203-8961', email: 'tobymrussell@gmail.com',
  origin: (process.env.SITE_ORIGIN || 'https://triadhomesandliving.com').replace(/^http:/, 'https:').replace(/\/$/, ''),
  // The deployment workflow supplies the active hosting origin.
  // Primary public domain: triadhomesandliving.com.
  image: '/assets/toby-headshot.webp', imageWidth: 1280, imageHeight: 1280,
  shareImage: '/assets/triad-homes-social.webp', shareImageWidth: 1200, shareImageHeight: 630,
  formEndpoint: null, // Set an HTTPS POST handler before enabling direct submissions.
  dateModified: '2026-10-30', archiveMigrated: false,
  markets: ['Davidson County', 'Forsyth County', 'Guilford County', 'Randolph County'],
  sameAs: ['https://www.zillow.com/profile/tobyrussell','https://www.homes.com/real-estate-agents/toby-russell/gy3syxw','https://tobyrussell.northgroupre.com/','https://www.linkedin.com/in/toby-russell-6baa0678/','https://www.youtube.com/@TobyRussell','https://www.instagram.com/tobyrussell336_realtor/','https://www.tiktok.com/@toby.russell.real']
};
