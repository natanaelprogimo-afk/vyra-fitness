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
  // 1) Remove leading stray question marks at start of lines (preserve indentation)
  out = out.replace(/^([ \t]*)\?[ \t]*/mg, '$1');
  // 2) Remove stray '?' before JSX tags like '? <View' -> '<View'
  out = out.replace(/\?\s+</g, '<');
  // 3) Remove stray '?' before common JSX/prop identifiers when it appears alone before them (e.g. '? onPress=')
  out = out.replace(/\?\s+(on[A-Z][A-Za-z0-9_]*)\s*=/g, '$1=');
  // 4) Remove stray '?' before lowercase prop names followed by '{' or '=' (e.g. '? style={' or '? disabled=')
  out = out.replace(/\?\s+([a-z][A-Za-z0-9_]*)\s*(=|\{)/g, '$1$2');
  // 5) Remove isolated question marks that appear alone between tokens and a '<' (e.g. ' } ? <' )
  out = out.replace(/\}\s*\?\s*</g, '} <');

  return out;
}

(async () => {
  console.log('Starting stray ? cleanup in', root);
  const files = await walk(root);
  let changed = 0;
  for (const f of files) {
    try {
      const rel = path.relative(root, f);
      // skip this fixer script itself
      if (rel === 'scripts\\fix\\strip_question_marks.js' || rel === 'scripts/fix/strip_question_marks.js') continue;
      let content = await fs.readFile(f, 'utf8');
      const transformed = transform(content);
      if (transformed !== content) {
        await fs.writeFile(f, transformed, 'utf8');
        console.log('Fixed:', rel);
        changed++;
      }
    } catch (err) {
      console.error('Error processing', f, err.message);
    }
  }
  console.log('Done. Files changed:', changed);
  process.exit(0);
})();
