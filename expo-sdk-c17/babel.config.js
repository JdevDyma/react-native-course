const { createRequire } = require('node:module');
const requireFromExpo = createRequire(require.resolve('expo/package.json'));

module.exports = function(api) {
  api.cache(true);
  return {
    presets: [requireFromExpo.resolve('babel-preset-expo')],
  };
};
