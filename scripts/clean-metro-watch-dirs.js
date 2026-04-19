const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const roots = ['node_modules', 'packages'].map((segment) => path.join(projectRoot, segment));
const androidArtifacts = ['.cxx', 'build'];
const localAndroidArtifacts = [path.join('android', 'app', '.cxx')];

function listPackageRoots(rootDir) {
  if (!fs.existsSync(rootDir)) {
    return [];
  }

  return fs.readdirSync(rootDir, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory()) {
      return [];
    }

    const entryPath = path.join(rootDir, entry.name);
    if (entry.name.startsWith('@')) {
      return fs
        .readdirSync(entryPath, { withFileTypes: true })
        .filter((child) => child.isDirectory())
        .map((child) => path.join(entryPath, child.name));
    }

    return [entryPath];
  });
}

function removeIfExists(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return false;
  }

  fs.rmSync(targetPath, {
    recursive: true,
    force: true,
    maxRetries: 3,
  });

  return true;
}

try {
  const removed = [];

  for (const rootDir of roots) {
    for (const packageRoot of listPackageRoots(rootDir)) {
      const androidDir = path.join(packageRoot, 'android');
      for (const artifact of androidArtifacts) {
        const artifactPath = path.join(androidDir, artifact);
        if (removeIfExists(artifactPath)) {
          removed.push(path.relative(projectRoot, artifactPath));
        }
      }
    }
  }

  for (const relativeArtifactPath of localAndroidArtifacts) {
    const artifactPath = path.join(projectRoot, relativeArtifactPath);
    if (removeIfExists(artifactPath)) {
      removed.push(path.relative(projectRoot, artifactPath));
    }
  }

  if (removed.length > 0) {
    console.log(`[Vyra] metro cleanup: removed ${removed.length} Android build directories`);
  } else {
    console.log('[Vyra] metro cleanup: no Android build directories found');
  }
} catch (error) {
  console.warn('[Vyra] metro cleanup warning:', error instanceof Error ? error.message : String(error));
}
