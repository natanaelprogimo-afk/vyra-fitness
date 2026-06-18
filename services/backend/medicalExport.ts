import { asRecord, getAuthHeaders, getBackendUrl, requestJson } from './client';

export type MedicalExportContentType = 'pdf' | 'csv' | 'json';
export type MedicalExportType = 'clinical' | 'medical' | 'detailed';

export interface MedicalExportLink {
  id: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  accessCount: number;
  maxAccesses: number;
  contentType: MedicalExportContentType;
  exportType: MedicalExportType;
  lastAccessed: string | null;
  shareableUrl: string;
  downloadUrl: string;
  verifyUrl: string;
}

function ensureBackendUrl() {
  const backendUrl = getBackendUrl();
  if (!backendUrl) {
    throw new Error('El backend no esta configurado en este build.');
  }
  return backendUrl.replace(/\/+$/, '');
}

function parseMedicalExport(raw: Record<string, unknown>): MedicalExportLink | null {
  const id = typeof raw.id === 'string' ? raw.id : null;
  const token = typeof raw.token === 'string' ? raw.token : null;
  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString();
  const expiresAt = typeof raw.expiresAt === 'string' ? raw.expiresAt : null;
  const contentType = typeof raw.contentType === 'string' ? raw.contentType as MedicalExportContentType : null;
  const exportType = typeof raw.exportType === 'string' ? raw.exportType as MedicalExportType : 'clinical';
  const backendBase = ensureBackendUrl();

  if (!id || !token || !expiresAt || !contentType) return null;

  const shareableUrl =
    typeof raw.shareableUrl === 'string' && raw.shareableUrl.trim().length > 0
      ? raw.shareableUrl
      : `${backendBase}/api/export/${token}/download`;
  const downloadUrl =
    typeof raw.downloadUrl === 'string' && raw.downloadUrl.trim().length > 0
      ? raw.downloadUrl
      : `${backendBase}/api/export/${token}/download`;
  const verifyUrl =
    typeof raw.verifyUrl === 'string' && raw.verifyUrl.trim().length > 0
      ? raw.verifyUrl
      : `${backendBase}/api/export/${token}/verify`;

  return {
    id,
    token,
    createdAt,
    expiresAt,
    accessCount: Number(raw.accessCount ?? 0) || 0,
    maxAccesses: Number(raw.maxAccesses ?? 5) || 5,
    contentType,
    exportType,
    lastAccessed: typeof raw.lastAccessed === 'string' ? raw.lastAccessed : null,
    shareableUrl,
    downloadUrl,
    verifyUrl,
  };
}

export async function listMedicalExports(): Promise<MedicalExportLink[]> {
  ensureBackendUrl();
  const headers = await getAuthHeaders();
  const response = await requestJson('/api/export', {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(response.text || 'No pudimos cargar los links temporales.');
  }

  const payload = asRecord(response.data);
  const exportsRaw = Array.isArray(payload?.exports) ? payload.exports : [];
  return exportsRaw
    .map((item) => asRecord(item))
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map(parseMedicalExport)
    .filter((item): item is MedicalExportLink => Boolean(item));
}

export async function createMedicalExportLink(input?: {
  expiryHours?: number;
  exportType?: MedicalExportType;
  contentType?: MedicalExportContentType;
}): Promise<MedicalExportLink> {
  ensureBackendUrl();
  const headers = await getAuthHeaders();
  const response = await requestJson('/api/export/medical', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      expiryHours: input?.expiryHours ?? 24,
      exportType: input?.exportType ?? 'clinical',
      contentType: input?.contentType ?? 'pdf',
    }),
  });

  if (!response.ok) {
    throw new Error(response.text || 'No pudimos crear el link temporal.');
  }

  const payload = asRecord(response.data);
  const exportRecord = asRecord(payload?.export);
  const parsed = exportRecord ? parseMedicalExport(exportRecord) : null;
  if (!parsed) {
    throw new Error('El backend devolvio un export temporal incompleto.');
  }
  return parsed;
}

export async function deleteMedicalExportLink(exportId: string): Promise<void> {
  ensureBackendUrl();
  const headers = await getAuthHeaders();
  const response = await requestJson(`/api/export/${exportId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    throw new Error(response.text || 'No pudimos eliminar este link temporal.');
  }
}

export async function verifyMedicalExportToken(token: string): Promise<{
  valid: boolean;
  reason?: string;
  accessesRemaining?: number;
  expiresAt?: string;
}> {
  ensureBackendUrl();
  const response = await requestJson(`/api/export/${token}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const payload = asRecord(response.data);
  return {
    valid: Boolean(payload?.valid),
    reason: typeof payload?.reason === 'string' ? payload.reason : undefined,
    accessesRemaining:
      typeof payload?.accessesRemaining === 'number' ? payload.accessesRemaining : undefined,
    expiresAt: typeof payload?.expiresAt === 'string' ? payload.expiresAt : undefined,
  };
}
