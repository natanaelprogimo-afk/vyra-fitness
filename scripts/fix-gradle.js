const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(
  __dirname, '..', 'node_modules', 
  'react-native-unity-ads', 'android', 'build.gradle'
);

const fixedContent = `apply plugin: 'com.android.library'

android {
  compileSdk 36
  namespace "com.reactlibrary.unityads"
  defaultConfig {
    minSdkVersion 24
    targetSdkVersion 36
  }
}

repositories {
  google()
  mavenCentral()
}

dependencies {
  implementation 'com.facebook.react:react-native:+'
  implementation 'com.unity3d.ads:unity-ads:4.9.2'
}
`;

try {
  if (fs.existsSync(buildGradlePath)) {
    fs.writeFileSync(buildGradlePath, fixedContent);
    console.log('✅ react-native-unity-ads build.gradle patched');
  } else {
    console.warn('⚠️  react-native-unity-ads build.gradle not found');
  }
} catch (err) {
  console.error('❌ Patch failed:', err.message);
}
