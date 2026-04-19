const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

function escapePattern(pattern) {
  if (pattern instanceof RegExp) {
    return pattern.source.replace(/\/|\\\//g, `\\${path.sep}`);
  }

  return pattern
    .replace(/[\-\[\]\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
    .replaceAll('/', `\\${path.sep}`);
}

function createExclusionList(patterns) {
  return new RegExp(`(${patterns.map(escapePattern).join('|')})$`);
}

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname),
  // Shim @tanstack/react-query to its CJS/legacy build to avoid ESM/modern
  // entry resolution issues in Metro/EAS builds.
  '@tanstack/react-query': path.resolve(__dirname, 'shims', 'react-query.js'),
  '@react-native-community/netinfo': path.resolve(__dirname, 'shims', 'netinfo.js'),
  // Keep Metro deterministic on Windows after fresh installs of Expo native modules.
  'expo-notifications': path.resolve(__dirname, 'node_modules', 'expo-notifications'),
  ...(config.resolver.extraNodeModules || {}),
};

config.watchFolders = [path.resolve(__dirname)];
// Prefer CJS/main fields to avoid Metro picking ESM/modern builds that use
// `import './something.js'` paths which Metro may not resolve in some setups.
config.resolver.resolverMainFields = [
  'main',
  'module'
];
config.resolver.blockList = createExclusionList([
  /android[\/\\]app[\/\\]\.cxx[\/\\].*/,
  /android[\/\\]app[\/\\]build[\/\\].*/,
  /node_modules[\/\\].+[\/\\]android[\/\\]\.cxx[\/\\].*/,
  /node_modules[\/\\].+[\/\\]android[\/\\]build[\/\\].*/,
  /packages[\/\\].+[\/\\]android[\/\\]\.cxx[\/\\].*/,
  /packages[\/\\].+[\/\\]android[\/\\]build[\/\\].*/,
]);

config.watchFolders = [path.resolve(__dirname)];
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'cjs', 'mjs', 'ts', 'tsx', 'json'];

module.exports = config;
