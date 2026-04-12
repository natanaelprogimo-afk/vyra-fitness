const fs = require('fs');
const path = require('path');

const baseConfig = require('./app.base.json');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function mergeConfig(base, override) {
  const result = clone(base ?? {});

  if (!isPlainObject(override)) {
    return result;
  }

  for (const [key, value] of Object.entries(override)) {
    if (Array.isArray(value)) {
      result[key] = clone(value);
      continue;
    }

    if (isPlainObject(value)) {
      result[key] = mergeConfig(result[key], value);
      continue;
    }

    result[key] = value;
  }

  return result;
}

function findExistingPath(candidates) {
  for (const candidate of candidates) {
    const resolved = path.join(__dirname, candidate);
    if (fs.existsSync(resolved)) {
      return candidate.replace(/\\/g, '/');
    }
  }
  return undefined;
}

module.exports = ({ config } = {}) => {
  const finalConfig = mergeConfig(baseConfig.expo ?? {}, config ?? {});

  const androidGoogleServicesFile = findExistingPath([
    'google-services.json',
    path.join('android', 'app', 'google-services.json'),
  ]);

  if (androidGoogleServicesFile) {
    finalConfig.android = {
      ...(finalConfig.android ?? {}),
      googleServicesFile: `./${androidGoogleServicesFile}`,
    };
  }

  const iosGoogleServicesFile = findExistingPath(['GoogleService-Info.plist']);
  if (iosGoogleServicesFile) {
    finalConfig.ios = {
      ...(finalConfig.ios ?? {}),
      googleServicesFile: `./${iosGoogleServicesFile}`,
    };
  }

  return { expo: finalConfig };
};
