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

function looksLikeConditionLine(s) {
  // Heuristic: contains = (assignment) or starts with return or is a bare identifier
  if (s.includes('=')) return true;
  if (/^return\b/.test(s.trim())) return true;
  if (/^const\b|^let\b|^var\b/.test(s.trim())) return true;
  return false;
}

async function processFile(file) {
  let content = await fs.readFile(file, 'utf8');
  const original = content;
  const lines = content.split(/\r?\n/);
  let changed = false;
  for (let i = 0; i < lines.length - 2; i++) {
    const a = lines[i];
    const b = lines[i+1];
    const c = lines[i+2];
    const aTrim = a.trimEnd();
    const bTrim = b.trim();
    const cTrim = c.trim();
    if (!cTrim.startsWith(':')) continue;
    if (!bTrim) continue;
    if (/^[}:]/.test(bTrim)) continue;
    // Avoid matching lines where a already ends with ? or : or , or ;
    if (/[?:;,)\]}\s]$/.test(aTrim)) continue;
    // Heuristic: a looks like a condition or assignment
    if (!looksLikeConditionLine(aTrim)) continue;
    // Heuristic: bTrim starts with an identifier or function call
    if (!/^[A-Za-z_\(\[`]/.test(bTrim)) continue;
    // Compose new line preserving indentation of a
    const indent = a.match(/^\s*/)[0] || '';
    const newLine = indent + aTrim + ' ? ' + bTrim + ' ' + cTrim;
    lines[i] = newLine;
    // remove next two lines
    lines.splice(i+1, 2);
    changed = true;
  }
  if (changed) {
    content = lines.join('\n');
    await fs.writeFile(file, content, 'utf8');
    return true;
  }
  return false;
}

(async () => {
  console.log('Running general ternary rejoin pass in', root);
  const files = await walk(root);
  let patched = 0;
  for (const f of files) {
    try {
      if (f.includes('scripts\\fix') || f.includes('scripts/fix')) continue;
      const ok = await processFile(f);
      if (ok) {
        console.log('Rejoined ternary in', path.relative(root, f));
        patched++;
      }
    } catch (err) {
      console.error('Error', f, err.message);
    }
  }
  console.log('Done. Files patched:', patched);
  process.exit(0);
})();
