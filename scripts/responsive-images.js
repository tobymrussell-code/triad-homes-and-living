// Create web-sized copies while preserving every supplied source asset.
const sharp = require('sharp');
const photos = require('../config/area-photos.json');
(async () => {
  await Promise.all(Object.values(photos).flatMap(photo => [480, 800].map(width =>
    sharp('src' + photo.src).resize({width, withoutEnlargement: true}).webp({quality: 82})
      .toFile('dist' + photo.src.replace('.webp', `-${width}.webp`))
  )));
  console.log('Generated responsive area-photo copies.');
})().catch(error => { console.error(error); process.exitCode = 1; });
