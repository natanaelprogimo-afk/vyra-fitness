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

function transform(content) {
  let out = content;

  // 1) Remove leading '?' even if there's whitespace before it
  out = out.replace(/^[ \t]*\?\s+/mg, '');

  // 2) Remove stray '?' directly between an identifier and '=' or '=>'
  out = out.replace(/(\b[A-Za-z0-9_]+)\s*\?\s*(=)/g, '$1 $2');
  out = out.replace(/(\b[A-Za-z0-9_]+)\s*\?\s*(=>)/g, '$1 $2');

  // 3) Fix declarations like 'const name ? =' -> 'const name ='
  out = out.replace(/\b(const|let|var)\s+([A-Za-z0-9_]+)\s*\?\s*=/g, '$1 $2 =');

  // 4) Remove isolated '?' that appear before identifiers but avoid matching '??' or '?:'
  out = out.replace(/\?\s+(?![\?\:])([A-Za-z_][A-Za-z0-9_]*)/g, '$1');

  // 5) Cleanup accidental literal "$1" tokens introduced by earlier repair passes
  out = out.replace(/\$1/g, '');

  return out;
}

(async () => {
  console.log('Starting identifier ? cleanup in', root);
  const files = await walk(root);
  let changed = 0;
  for (const f of files) {
    try {
      const rel = path.relative(root, f);
      if (rel.startsWith('scripts\\fix') || rel.startsWith('scripts/fix')) continue;
      let content = await fs.readFile(f, 'utf8');
      const transformed = transform(content);
      if (transformed !== content) {
        await fs.writeFile(f, transformed, 'utf8');
        console.log('Fixed:', rel);
        changed++;
      }
    } catch (err) {
      console.error('Error processing', f, err && err.message);
    }
  }
  console.log('Done. Files changed:', changed);
  process.exit(0);
})();
