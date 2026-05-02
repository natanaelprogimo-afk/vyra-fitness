let passwordRecoveryFlowActive = false;
let passwordRecoveryUrl: string | null = null;

export function armPasswordRecoveryFlow() {
  passwordRecoveryFlowActive = true;
}

export function clearPasswordRecoveryFlow() {
  passwordRecoveryFlowActive = false;
  passwordRecoveryUrl = null;
}

export function isPasswordRecoveryFlowActive() {
  return passwordRecoveryFlowActive;
}

export function setPasswordRecoveryUrl(url: string | null) {
  passwordRecoveryUrl = url;
}

export function consumePasswordRecoveryUrl() {
  const currentUrl = passwordRecoveryUrl;
  passwordRecoveryUrl = null;
  return currentUrl;
}
