import type { InvestorLevel } from './policy'

// Server-owned allow-list. Files belong under the backend-only investor-data-room prefix;
// clients never receive or construct storage keys themselves.
export const INVESTOR_DOCUMENTS: Record<string, { access: InvestorLevel; storageKey: string }> = {
  'pitch-deck': { access: 'PRE_NDA', storageKey: 'investor-data-room/pre-nda/pitch-deck.pptx' },
  'financial-model': { access: 'PRE_NDA', storageKey: 'investor-data-room/pre-nda/financial-model.xlsx' },
  'nda-template': { access: 'PRE_NDA', storageKey: 'investor-data-room/pre-nda/investor-nda.pdf' },
  'architecture': { access: 'NDA', storageKey: 'investor-data-room/nda/platform-architecture.pdf' },
  'security-model': { access: 'NDA', storageKey: 'investor-data-room/nda/security-permission-model.pdf' },
  'cap-table': { access: 'DILIGENCE', storageKey: 'investor-data-room/diligence/cap-table.xlsx' },
  'corporate-records': { access: 'DILIGENCE', storageKey: 'investor-data-room/diligence/corporate-records.pdf' },
  'ip-assignments': { access: 'DILIGENCE', storageKey: 'investor-data-room/diligence/ip-assignments.pdf' },
  'material-contracts': { access: 'DILIGENCE', storageKey: 'investor-data-room/diligence/material-contracts.pdf' },
}
