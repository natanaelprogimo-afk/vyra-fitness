const fs = require('fs').promises;
const path = require('path');

const root = process.cwd();
const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const ignoreDirs = new Set(['node_modules', '.git', 'android', 'ios', '.expo', 'build', 'dist', 'scripts/deleted-backup']);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (ignoreDirs.has(e.name)) continue;
      files = files.concat(await walk(full));
    } else if (exts.has(path.extname(e.name))) {
      files.push(full);
    }
  }
  return files;
}

function isSimpleRightSide(s) {
  // allow identifiers, optional chaining, or function calls
  return /^[A-Za-z0-9_\.\?\[\]\)]+$/.test(s);
}

async function processFile(file) {
  let content = await fs.readFile(file, 'utf8');
  let original = content;

  // 1) collapse '? ?' where whitespace exists between question marks (avoid collapsing '??')
  content = content.replace(/\?\s+\?/g, '?');

  // 2) Rejoin ternary split across 3 lines pattern: property: var\n  EXPR\n  : fallback
  const lines = content.split(/\r?\n/);
  let changed = false;
  for (let i = 0; i < lines.length - 2; i++) {
    const lineA = lines[i];
    const lineB = lines[i+1];
    const lineC = lines[i+2];
    const idx = lineA.lastIndexOf(':');
    if (idx === -1) continue;
    const right = lineA.slice(idx+1).trim();
    if (!right) continue;
    if (!isSimpleRightSide(right)) continue;
    const bTrim = lineB.trim();
    const cTrim = lineC.trim();
    if (!bTrim) continue;
    if (!/^[:]/.test(cTrim)) continue; // lineC must start with ':'
    // Heuristic: bTrim should start with identifier or function call
    if (!/^[A-Za-z_\(\[`]/.test(bTrim)) continue;

    // Build new single line preserving indentation from lineA
    const indent = lineA.match(/^\s*/)[0] || '';
    const beforeColon = lineA.slice(0, idx+1); // includes colon
    const newRight = `${right} ? ${bTrim} ${cTrim}`;
    lines[i] = indent + beforeColon + ' ' + newRight;
    // remove the next two lines
    lines.splice(i+1, 2);
    changed = true;
  }

  if (changed) content = lines.join('\n');

  if (content !== original) {
    await fs.writeFile(file, content, 'utf8');
    return true;
  }
  return false;
}

(async () => {
  console.log('Running collapse & rejoin pass in', root);
  const files = await walk(root);
  let count = 0;
  for (const f of files) {
    try {
      if (f.includes('scripts\\fix') || f.includes('scripts/fix')) continue;
      const ok = await processFile(f);
      if (ok) {
        console.log('Patched:', path.relative(root, f));
        count++;
      }
    } catch (err) {
      console.error('Err', f, err.message);
    }
  }
  console.log('Done. Files patched:', count);
  process.exit(0);
})();
