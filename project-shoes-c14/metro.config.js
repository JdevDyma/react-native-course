const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.cacheVersion = `project-shoes-c14:${__dirname}`;
const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
};
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...new Set([...resolver.sourceExts, "svg"])],
};

module.exports = config;
