//* Page title
module.exports = {
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = "Schedule scraper";
      return args;
    });
  },
};
