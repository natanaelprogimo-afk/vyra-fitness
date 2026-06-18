import { decryptSensitiveText } from '@/lib/sensitive-crypto';

export type FemalePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export function normalizeFemalePhase(value: unknown): FemalePhase | null {
  const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (raw === 'folicular') return 'follicular';
  if (raw === 'menstrual' || raw === 'follicular' || raw === 'ovulation' || raw === 'luteal') {
    return raw;
  }
  return null;
}

export async function resolveFemalePhaseFromRecord(
  record: Record<string, unknown> | null | undefined,
): Promise<FemalePhase | null> {
  const plain = normalizeFemalePhase(record?.phase ?? record?.phase_override);
  if (plain) return plain;

  const encrypted =
    typeof record?.phase_encrypted === 'string'
      ?  record.phase_encrypted
      : typeof record?.phase_override_encrypted === 'string'
        ?  record.phase_override_encrypted
        : null;

  const decrypted = await decryptSensitiveText(encrypted);
  return normalizeFemalePhase(decrypted);
}
