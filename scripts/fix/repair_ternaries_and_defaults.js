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

function fixTemplateExpr(expr) {
  let e = expr;
  // Replace identifier  double-space number -> identifier ?? number
  e = e.replace(/([A-Za-z0-9_\.\)\]]+)\s{2,}([0-9]+)/g, '$1 ?? $2');
  // Replace identifier  double-space identifier -> identifier ?? identifier
  e = e.replace(/([A-Za-z0-9_\.\)\]]+)\s{2,}([A-Za-z0-9_\.\)\]]+)/g, '$1 ?? $2');
  // Specific: mood  3 -> mood ?? 3
  e = e.replace(/(\b\w+\b)\s{2,}([0-9]+)/g, '$1 ?? $2');
  return e;
}

function transform(content) {
  let out = content;
  // Reuse safe removals from previous pass
  out = out.replace(/^([ \t]*)\?[ \t]*/mg, '$1');
  out = out.replace(/\?\s+</g, '<');
  out = out.replace(/\?\s+(on[A-Z][A-Za-z0-9_]*)\s*=/g, '$1=');
  out = out.replace(/\?\s+([a-z][A-Za-z0-9_]*)\s*(=|\{)/g, '$1$2');
  out = out.replace(/\}\s*\?\s*</g, '} <');

  // Fix common double-space corruption patterns for ternaries
  out = out.replace(/>\s*0\s{2,}/g, '> 0 ? ');
  out = out.replace(/===\s*1\s{2,}/g, '=== 1 ? ');
  out = out.replace(/>=\s*1\s{2,}/g, '>= 1 ? ');
  out = out.replace(/===\s*true\s{2,}/g, '=== true ? ');
  out = out.replace(/===\s*false\s{2,}/g, '=== false ? ');

  // Fix typeof pattern: typeof x === 'string' x : y  -> typeof x === 'string' ? x : y
  out = out.replace(/(typeof\s+[^\s]+\s*===\s*(['"][^'"]+['"]))\s+([A-Za-z0-9_\.\?\[\]\)]+)/g, '$1 ? $3');

  // Fix template literal inner expressions
  out = out.replace(/\$\{([\s\S]*?)\}/g, (m, expr) => {
    const fixed = fixTemplateExpr(expr);
    return '${' + fixed + '}';
  });

  // Global: identifier  double-space 0 -> identifier ?? 0
  out = out.replace(/([A-Za-z0-9_\.\)\]]+)\s{2,}0/g, '$1 ?? 0');

  return out;
}

(async () => {
  console.log('Starting conservative ternary/default repairs in', root);
  const files = await walk(root);
  let changed = 0;
  for (const f of files) {
    try {
      const rel = path.relative(root, f);
      // skip our scripts
      if (rel.startsWith('scripts\\fix') || rel.startsWith('scripts/fix')) continue;
      let content = await fs.readFile(f, 'utf8');
      const transformed = transform(content);
      if (transformed !== content) {
        await fs.writeFile(f, transformed, 'utf8');
        console.log('Repaired:', rel);
        changed++;
      }
    } catch (err) {
      console.error('Error processing', f, err.message);
    }
  }
  console.log('Done. Files changed:', changed);
  process.exit(0);
})();
