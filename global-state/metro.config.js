const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");

const config = getDefaultConfig(__dirname);
const installedModules = path.resolve(__dirname, "node_modules");
const realInstalledModules = fs.realpathSync(installedModules);
config.watchFolders = [...new Set([...(config.watchFolders || []), realInstalledModules])];
config.resolver.nodeModulesPaths = [installedModules, ...(config.resolver.nodeModulesPaths || [])];
config.cacheVersion = `${config.cacheVersion || ""}:c10-asyncstorage-v1:${__dirname}`;
module.exports = config;
