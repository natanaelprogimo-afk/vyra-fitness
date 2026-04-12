const fs = require('fs');
const path = 'app/(auth)/onboarding/step-base.tsx';
try {
  let s = fs.readFileSync(path, 'utf8');
  const re = /await saveOnboardingProgress\(Routes\.auth\.onboarding\.modules, nextDraft\);\s*router\.push\(Routes\.auth\.onboarding\.modules as any\);/;
  if (!re.test(s)) {
    console.log('Pattern not found');
    process.exit(0);
  }
  s = s.replace(re, "await saveOnboardingProgress(Routes.auth.onboarding.finish, nextDraft);\r\n    router.push(Routes.auth.onboarding.finish as any);");
  fs.writeFileSync(path, s, 'utf8');
  console.log('patched');
} catch (err) {
  console.error(err);
  process.exit(1);
}
