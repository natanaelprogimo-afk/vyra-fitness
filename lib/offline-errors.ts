export function isRecoverableOfflineError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('offline') ||
    message.includes('internet') ||
    message.includes('timeout') ||
    message.includes('unreachable')
  );
}
