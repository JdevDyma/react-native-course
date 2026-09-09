const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
const installedModules = path.resolve(__dirname, "node_modules");
const realInstalledModules = require("fs").realpathSync(installedModules);
config.watchFolders = [...new Set([...(config.watchFolders || []), realInstalledModules])];
config.resolver = { ...config.resolver, nodeModulesPaths: [installedModules, ...(config.resolver.nodeModulesPaths || [])] };
module.exports = config;
