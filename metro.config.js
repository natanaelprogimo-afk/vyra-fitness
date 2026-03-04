const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname),
  ...(config.resolver.extraNodeModules || {}),
};

config.watchFolders = [path.resolve(__dirname)];
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'cjs', 'mjs', 'ts', 'tsx', 'json'];

module.exports = config;
