const fs = require('fs');
const path = require('path');

// Script retained for compatibility, but Unity Ads is currently removed.
// If the react-native-unity-ads package exists in node_modules this script
// will attempt to patch its build.gradle; otherwise it exits silently.
const buildGradlePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-unity-ads',
  'android',
  'build.gradle'
);

try {
  if (fs.existsSync(buildGradlePath)) {
    // Do not modify files automatically for now; just notify.
    console.log('⚠️ react-native-unity-ads detected in node_modules; please remove the package to avoid native build issues.');
  }
} catch (err) {
  // ignore
}
