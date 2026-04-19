const fs = require('fs');
const path = require('path');

const gradlePluginRoot = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-native',
  'gradle-plugin',
);

const patches = [
  {
    file: path.join(gradlePluginRoot, 'settings.gradle.kts'),
    transform: (source) =>
      source.replace(
        /\nplugins \{ id\("org\.gradle\.toolchains\.foojay-resolver-convention"\)\.version\("0\.5\.0"\) \}\n/g,
        '\n',
      ),
  },
  {
    file: path.join(gradlePluginRoot, 'settings-plugin', 'build.gradle.kts'),
    transform: (source) => source.replace(/jvmToolchain\(17\)/g, 'jvmToolchain(21)'),
  },
  {
    file: path.join(gradlePluginRoot, 'shared', 'build.gradle.kts'),
    transform: (source) => source.replace(/jvmToolchain\(17\)/g, 'jvmToolchain(21)'),
  },
  {
    file: path.join(gradlePluginRoot, 'shared-testutil', 'build.gradle.kts'),
    transform: (source) => source.replace(/jvmToolchain\(17\)/g, 'jvmToolchain(21)'),
  },
  {
    file: path.join(gradlePluginRoot, 'react-native-gradle-plugin', 'build.gradle.kts'),
    transform: (source) => source.replace(/jvmToolchain\(17\)/g, 'jvmToolchain(21)'),
  },
  {
    file: path.join(
      gradlePluginRoot,
      'react-native-gradle-plugin',
      'src',
      'main',
      'kotlin',
      'com',
      'facebook',
      'react',
      'utils',
      'JdkConfiguratorUtils.kt',
    ),
    transform: (source) => source.replace(/jvmToolchain\(17\)/g, 'jvmToolchain(21)'),
  },
  {
    file: path.join(
      __dirname,
      '..',
      'node_modules',
      'react-native-sqlite-storage',
      'platforms',
      'android',
      'build.gradle',
    ),
    transform: (source) => source.replace(/jcenter\(\)/g, 'mavenCentral()'),
  },
  {
    file: path.join(
      __dirname,
      '..',
      'node_modules',
      'react-native-sqlite-storage',
      'platforms',
      'android-native',
      'build.gradle',
    ),
    transform: (source) => source.replace(/jcenter\(\)/g, 'mavenCentral()'),
  },
];

try {
  let changed = 0;

  for (const patch of patches) {
    if (!fs.existsSync(patch.file)) {
      continue;
    }

    const current = fs.readFileSync(patch.file, 'utf8');
    const next = patch.transform(current);
    if (next === current) continue;

    fs.writeFileSync(patch.file, next, 'utf8');
    changed += 1;
  }

  if (changed > 0) {
    console.log(`[Vyra] postinstall: patched React Native Gradle toolchains (${changed} files)`);
    process.exit(0);
  }

  console.log('[Vyra] postinstall: native patch checks ready');
} catch (error) {
  console.warn('[Vyra] postinstall warning:', error instanceof Error ? error.message : String(error));
}
