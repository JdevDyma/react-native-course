const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.cacheVersion = __dirname;
module.exports = config;
