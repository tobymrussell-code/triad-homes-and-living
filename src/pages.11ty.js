const render = require('../lib/render');
module.exports = class {
  data() { return {pagination:{data:'pages',size:1,alias:'entry'},permalink: data=>data.entry.url}; }
  render(data) { return render.staticPage(data.entry); }
};
