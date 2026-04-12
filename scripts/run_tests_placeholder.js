const fs = require('fs');
const path = require('path');

function ok(msg) {
	console.log('✔', msg);
}

function fail(msg) {
	console.error('✖', msg);
}

const root = path.resolve(__dirname, '..');
let exitCode = 0;

const checks = [
	{ file: 'app/modules/workout/insights.tsx', desc: 'workout insights screen exists' },
	{ file: '.github/workflows/ci.yml', desc: 'CI workflow exists' },
	{ file: '.eslintrc.cjs', desc: 'ESLint config exists' },
	{ file: '.prettierrc', desc: 'Prettier config exists' },
	{ file: 'PR_BODY.md', desc: 'PR body exists' },
];

for (const c of checks) {
	const fp = path.join(root, c.file);
	if (fs.existsSync(fp)) ok(c.desc);
	else {
		fail(`${c.desc} — missing: ${c.file}`);
		exitCode = 2;
	}
}

// Check audit file contains a progress header
const auditPath = path.resolve(root, '..', 'docs', 'vyra_audit_actions.txt');
if (fs.existsSync(auditPath)) {
	const content = fs.readFileSync(auditPath, 'utf8');
	if (content.includes('Estado de implementación') || content.includes('Completadas')) ok('audit actions file contains progress');
	else {
		fail('audit actions file does not contain progress section');
		exitCode = 3;
	}
} else {
	fail('audit actions file missing');
	exitCode = 4;
}

if (exitCode === 0) {
	console.log('\nAll placeholder checks passed.');
}
process.exit(exitCode);
