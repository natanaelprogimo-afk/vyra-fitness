/*
  Backup of deleted file created by automated cleanup
  Original path: vyra-fitness/plugins/withAndroidKotlinJvmTarget.js
  Backup timestamp: 2026-04-10T22:41:24Z
*/

const fs = require('fs');
const path = require('path');
const { createRunOncePlugin, withDangerousMod } = require('@expo/config-plugins');

const FOOJAY_PLUGIN_ID = 'org.gradle.toolchains.foojay-resolver-convention';
const FOOJAY_PLUGIN_LINE = `  id("${FOOJAY_PLUGIN_ID}") version("1.0.0")`;
const FOOJAY_PLUGIN_REGEX =
  /id\("org\.gradle\.toolchains\.foojay-resolver-convention"\)\s*(?:\.version\(|version\()\s*"[^"]*"\s*\)/g;

const KOTLIN_JVM_TARGET_BLOCK = `
subprojects {
  tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
    kotlinOptions {
      jvmTarget = "17"
    }
  }
}
`;

function findBlockEnd(source, blockStart) {
  const openBraceIndex = source.indexOf('{', blockStart);
  if (openBraceIndex === -1) return -1;

  let depth = 0;
  for (let index = openBraceIndex; index < source.length; index += 1) {
    const character = source[index];
    if (character === '{') depth += 1;
    if (character === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  return -1;
}

function upsertFoojayPlugin(source) {
  let normalized = source
    .replace(FOOJAY_PLUGIN_REGEX, '')
    .replace(/plugins\s*\{\s*\}/g, '')
    .replace(/\n{3,}/g, '\n\n');
  let pluginManagementIndex = normalized.indexOf('pluginManagement {');
  let pluginsBlockIndex = normalized.indexOf('plugins {');

  if (pluginManagementIndex !== -1 && pluginsBlockIndex !== -1 && pluginsBlockIndex < pluginManagementIndex) {
    const misplacedPluginsBlockEnd = findBlockEnd(normalized, pluginsBlockIndex);
    if (misplacedPluginsBlockEnd !== -1) {
      normalized = `${normalized.slice(0, pluginsBlockIndex)}${normalized.slice(misplacedPluginsBlockEnd + 1)}`.replace(
        /\n{3,}/g,
        '\n\n',
      );
      pluginManagementIndex = normalized.indexOf('pluginManagement {');
      pluginsBlockIndex = normalized.indexOf('plugins {');
    }
  }

  if (pluginsBlockIndex !== -1) {
    const insertIndex = normalized.indexOf('{', pluginsBlockIndex) + 1;
    return `${normalized.slice(0, insertIndex)}\n${FOOJAY_PLUGIN_LINE}${normalized.slice(insertIndex)}`;
  }

  if (pluginManagementIndex === -1) {
    return `plugins {\n${FOOJAY_PLUGIN_LINE}\n}\n\n${normalized}`;
  }

  const pluginManagementEnd = findBlockEnd(normalized, pluginManagementIndex);
  if (pluginManagementEnd === -1) {
    return normalized;
  }

  return `${normalized.slice(0, pluginManagementEnd + 1)}\n\nplugins {\n${FOOJAY_PLUGIN_LINE}\n}${normalized.slice(pluginManagementEnd + 1)}`;
}

function withAndroidKotlinJvmTarget(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const platformRoot = config.modRequest.platformProjectRoot;
      const buildGradlePath = path.join(config.modRequest.platformProjectRoot, 'build.gradle');
      const settingsGradlePath = path.join(platformRoot, 'settings.gradle');
      const gradlePropertiesPath = path.join(platformRoot, 'gradle.properties');
      const current = fs.readFileSync(buildGradlePath, 'utf8');

      if (!current.includes('tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile)')) {
        fs.writeFileSync(buildGradlePath, `${current.trim()}\n${KOTLIN_JVM_TARGET_BLOCK}`, 'utf8');
      }

      if (fs.existsSync(settingsGradlePath)) {
        const settings = fs.readFileSync(settingsGradlePath, 'utf8');
        const nextSettings = upsertFoojayPlugin(settings);
        if (nextSettings !== settings) {
          fs.writeFileSync(settingsGradlePath, nextSettings, 'utf8');
        }
      }

      if (fs.existsSync(gradlePropertiesPath)) {
        const gradleProperties = fs.readFileSync(gradlePropertiesPath, 'utf8');
        if (!gradleProperties.includes('org.gradle.java.installations.auto-download=true')) {
          fs.writeFileSync(
            gradlePropertiesPath,
            `${gradleProperties.trim()}\norg.gradle.java.installations.auto-download=true\n`,
            'utf8',
          );
        }
      }

      return config;
    },
  ]);
}

module.exports = createRunOncePlugin(
  withAndroidKotlinJvmTarget,
  'with-android-kotlin-jvm-target',
  '1.0.0',
);
