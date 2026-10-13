const render = require('./lib/render');
module.exports = config => {
  config.addPassthroughCopy({'src/assets':'assets'});
  config.addFilter('guidePage', (content, slug) => render.guidePage(content, slug));
  config.addWatchTarget('./config'); config.addWatchTarget('./lib');
  return { dir: {input:'src',output:'dist',includes:'_includes'}, markdownTemplateEngine:'njk' };
};
