const fs = require('fs').promises;
const path = require('path');

async function readAuditFile() {
  const candidates = [
    path.resolve(process.cwd(), 'docs', 'vyra_audit_actions.txt'),
    path.resolve(process.cwd(), '..', 'docs', 'vyra_audit_actions.txt'),
    path.resolve(process.cwd(), 'vyra_audit_actions.txt'),
  ];
  for (const p of candidates) {
    try {
      const content = await fs.readFile(p, 'utf8');
      return { p, content };
    } catch (err) {
      if (err && err.code && err.code === 'ENOENT') continue;
      throw err;
    }
  }
  throw new Error('docs/vyra_audit_actions.txt not found in expected locations: ' + candidates.join(', '));
}

test('docs/vyra_audit_actions.txt exists and includes implementation status', async () => {
  const { content } = await readAuditFile();
  expect(content).toBeTruthy();
  expect(content.length).toBeGreaterThan(10);
  expect(/Estado de implementación|Acciones recomendadas/i.test(content)).toBe(true);
});
