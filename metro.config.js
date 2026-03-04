const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname),
  // Shim @tanstack/react-query to its CJS/legacy build to avoid ESM/modern
  // entry resolution issues in Metro/EAS builds.
  '@tanstack/react-query': path.resolve(__dirname, 'shims'),
  ...(config.resolver.extraNodeModules || {}),
};

config.watchFolders = [path.resolve(__dirname)];
// Prefer CJS/main fields to avoid Metro picking ESM/modern builds that use
// `import './something.js'` paths which Metro may not resolve in some setups.
config.resolver.resolverMainFields = [
  'main',
  'module'
];

config.watchFolders = [path.resolve(__dirname)];
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'cjs', 'mjs', 'ts', 'tsx', 'json'];

module.exports = config;
