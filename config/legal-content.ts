import legalContent from '@/legal/legal-content.json';

export type LegalDocumentKind = 'privacy' | 'terms';

export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface LegalDocument {
  title: string;
  headerTitle: string;
  eyebrow: string;
  summary: string;
  sections: LegalSection[];
}

export interface LegalContentPayload {
  updatedAt: string;
  privacyEmail: string;
  legalEmail: string;
  privacy: LegalDocument;
  terms: LegalDocument;
}

const CONTENT = legalContent as LegalContentPayload;

export function getLegalDocument(kind: LegalDocumentKind): LegalDocument {
  return CONTENT[kind];
}

export function getLegalMeta() {
  return {
    updatedAt: CONTENT.updatedAt,
    privacyEmail: CONTENT.privacyEmail,
    legalEmail: CONTENT.legalEmail,
  };
}
