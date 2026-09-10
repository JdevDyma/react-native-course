const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
config.cacheVersion = `expo-sdk-c17:${__dirname}`;
module.exports = config;
