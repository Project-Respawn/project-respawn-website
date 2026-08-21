export const accessTiers = [
  { key: 'PRE_NDA', number: '01', label: 'Pre-NDA', title: 'Investor review', description: 'Core financial, commercial and execution material suitable for an initial investor review.' },
  { key: 'NDA', number: '02', label: 'NDA', title: 'Confidential review', description: 'Detailed methodology, architecture, assumptions and commercial material released after confidentiality arrangements.' },
  { key: 'DILIGENCE', number: '03', label: 'Diligence', title: 'Restricted diligence', description: 'Highly sensitive legal, ownership, contract and IP material released only during serious diligence.' }
];

export const reviewPath = ['Pitch deck', 'Financial model', 'Creator & commercial model', 'Product & technology', 'Creator Score & data', 'Roadmap & execution'];

export const roomSections = [
  {
    key: 'financials', label: 'Financials', kicker: 'Economics & runway',
    description: 'The assumptions behind the £300k pre-seed round, 18-month execution plan and 10-year scenarios.',
    documents: [
      { key: 'pitch-deck', title: 'Pre-Seed Investor Pitch Deck', type: 'PPTX', access: 'PRE_NDA', version: '2.0', updated: '20 Aug 2026', description: 'The concise investment case covering founder story, product, growth engine, economics and raise.' },
      { key: 'financial-model', title: '18-Month & 10-Year Financial Model', type: 'XLSX', access: 'PRE_NDA', version: '1.1', updated: '20 Aug 2026', description: 'Driver-based Harsh / Niche, Execution Base Case and Global Breakout scenarios.' },
      { key: 'assumption-book', title: 'Detailed Financial Assumption Book', type: 'XLSX', access: 'NDA', version: 'Draft', updated: 'Planned', description: 'Detailed cohort, revenue, unit economics and sensitivity assumptions.' },
      { key: 'fundraise-terms', title: 'Fundraise Structure & Working Terms', type: 'PDF', access: 'DILIGENCE', version: 'Draft', updated: 'Planned', description: 'Working financing structure, valuation assumptions and ownership impact.' }
    ]
  },
  {
    key: 'product-technology', label: 'Product & Technology', kicker: 'What we are building',
    description: 'Product scope, technical architecture, security approach and platform delivery roadmap.',
    documents: [
      { key: 'product-overview', title: 'Product & Ecosystem Overview', type: 'PDF', access: 'PRE_NDA', version: '1.0', updated: 'Planned', description: 'Creator Tools, community, memberships, pets, quests, analytics and the wider ecosystem.' },
      { key: 'technical-roadmap', title: 'Creator Tools Technical Alpha Roadmap', type: 'PDF', access: 'PRE_NDA', version: '1.0', updated: 'Aug 2026', description: 'Delivery path from technical alpha through the November 2026 launch.' },
      { key: 'architecture', title: 'Detailed Platform Architecture', type: 'PDF', access: 'NDA', version: 'Draft', updated: 'Planned', description: 'AWS architecture, connected-platform integrations and security boundaries.' },
      { key: 'security-model', title: 'Security & Permission Model', type: 'PDF', access: 'NDA', version: 'Draft', updated: 'Planned', description: 'Authentication, authorisation, private storage and workspace controls.' },
      { key: 'ip-inventory', title: 'Technical IP Inventory', type: 'PDF', access: 'DILIGENCE', version: 'Restricted', updated: 'Planned', description: 'Sensitive codebase/IP ownership and dependency inventory.' }
    ]
  },
  {
    key: 'creator-commercial', label: 'Creator & Commercial', kicker: 'Distribution & monetisation',
    description: 'How creators enter the network, how communities follow, and how Respawn creates commercial value around them.',
    documents: [
      { key: 'creator-commercial-overview', title: 'Creator & Commercial Model', type: 'PDF', access: 'PRE_NDA', version: '1.0', updated: 'Planned', description: 'Creator acquisition, initial economics, Plus, brands, commerce, events and partnership pathway.' },
      { key: 'membership-model', title: 'Membership & Respawn Plus Model', type: 'PDF', access: 'PRE_NDA', version: '1.0', updated: 'Planned', description: 'Bronze, Silver and Gold support alongside separate Plus network access.' },
      { key: 'brand-partner-model', title: 'Brand Partner Commercial Model', type: 'PDF', access: 'NDA', version: 'Draft', updated: 'Planned', description: 'Creator matching, campaign economics, reporting and commercial workflows.' },
      { key: 'creator-contract-framework', title: 'Creator Contract Framework', type: 'PDF', access: 'NDA', version: 'Draft', updated: 'Planned', description: 'Six-month stability/performance concepts and renewal principles.' },
      { key: 'partner-pipeline', title: 'Creator & Brand Pipeline', type: 'XLSX', access: 'DILIGENCE', version: 'Live', updated: 'Restricted', description: 'Sensitive creator and commercial pipeline information.' }
    ]
  },
  {
    key: 'creator-score', label: 'Creator Score & Data', kicker: 'Data advantage',
    description: 'The thesis behind measuring community strength and using longitudinal evidence to improve creator and commercial outcomes.',
    documents: [
      { key: 'creator-score-overview', title: 'Creator Score Investor Overview', type: 'PDF', access: 'PRE_NDA', version: '1.0', updated: 'Planned', description: 'High-level purpose, validation philosophy, privacy principles and commercial applications.' },
      { key: 'creator-score-validation', title: 'Creator Score Validation Plan', type: 'PDF', access: 'NDA', version: 'Draft', updated: 'Planned', description: 'Evidence requirements, validation stages, anti-gaming design and outcome testing.' },
      { key: 'creator-score-methodology', title: 'Creator Score Methodology', type: 'PDF', access: 'NDA', version: 'Restricted', updated: 'Planned', description: 'Confidential methodology and weighting principles.' },
      { key: 'data-inventory', title: 'Data & Signal Inventory', type: 'PDF', access: 'DILIGENCE', version: 'Restricted', updated: 'Planned', description: 'Detailed first-party and permissioned connected-platform signal inventory.' }
    ]
  },
  {
    key: 'roadmap-execution', label: 'Roadmap & Execution', kicker: 'What the round unlocks',
    description: 'The milestones the round is intended to fund from September 2026 through launch, validation and commercial proof.',
    documents: [
      { key: 'investor-roadmap', title: 'Investor Milestone Roadmap', type: 'PDF', access: 'PRE_NDA', version: 'Current', updated: '20 Aug 2026', description: 'Commercial proof points from technical alpha through repeatable growth and revenue.' },
      { key: 'use-of-funds', title: '£300k Use of Funds', type: 'PDF', access: 'PRE_NDA', version: '1.0', updated: '20 Aug 2026', description: 'Allocation across team, growth, legal, technology, events, creator acquisition, admin and reserve.' },
      { key: 'operating-plan', title: '18-Month Operating Plan', type: 'PDF', access: 'NDA', version: 'Draft', updated: 'Planned', description: 'Monthly delivery, commercial, hiring and validation plan.' },
      { key: 'risk-register', title: 'Execution Risk Register', type: 'PDF', access: 'NDA', version: 'Draft', updated: 'Planned', description: 'Platform dependency, adoption, legal, financial and operational risks and mitigations.' }
    ]
  },
  {
    key: 'company-legal', label: 'Company & Legal', kicker: 'Ownership & diligence',
    description: 'Corporate, ownership, IP and legal information required as an investor progresses into formal diligence.',
    documents: [
      { key: 'company-overview', title: 'Company & Legal Overview', type: 'PDF', access: 'PRE_NDA', version: 'Draft', updated: 'Planned', description: 'High-level company structure, legal priorities and diligence readiness.' },
      { key: 'nda-template', title: 'Investor NDA', type: 'PDF', access: 'PRE_NDA', version: 'Legal review required', updated: 'Planned', description: 'Confidentiality agreement used before protected material is released.' },
      { key: 'cap-table', title: 'Capitalisation Table', type: 'XLSX', access: 'DILIGENCE', version: 'Restricted', updated: 'Restricted', description: 'Current ownership and indicative financing impact.' },
      { key: 'corporate-records', title: 'Corporate Records', type: 'PDF', access: 'DILIGENCE', version: 'Restricted', updated: 'Restricted', description: 'Relevant incorporation, shareholder and statutory records.' },
      { key: 'ip-assignments', title: 'IP Ownership & Assignment Records', type: 'PDF', access: 'DILIGENCE', version: 'Restricted', updated: 'Restricted', description: 'Ownership and assignment documentation for relevant Project Respawn IP.' },
      { key: 'material-contracts', title: 'Material Contracts', type: 'PDF', access: 'DILIGENCE', version: 'Restricted', updated: 'Restricted', description: 'Material commercial, contractor, creator and partnership agreements.' }
    ]
  }
];

export const sandboxTestDocument = {
  key: 'sandbox-test-document',
  title: 'Project Respawn Data Room Sandbox Test Document',
  type: 'TXT',
  access: 'NDA',
  version: 'Sandbox',
  updated: 'Test only',
  description: 'Non-sensitive synthetic document used to verify the protected sandbox download boundary.'
};
