export function completeCreatorSubmission(overrides: Record<string, unknown> = {}) {
  return {
    pathwayId: 'creator', formVersion: 'creator-v1', applicantFullName: ' Zoë Example ', creatorDisplayName: '星 Quest',
    contactEmail: ' ZOE@Example.COM ', emailVerificationProvenance: 'trusted-test', source: 'sandbox-integration-test',
    consentVersion: 'creator-consent-v1', consentedAt: '2026-08-16T10:00:00.000Z', testRunId: 'test-run-unit',
    auditMetadata: { schema: 'phase-1' },
    answers: [
      answer('creator_name', 'Creator / display name', 'basic', 'Basic details', 'short-text', '星 Quest', 1),
      answer('creator_role', 'What role do you want to fill?', 'profile', 'Creator profile', 'single-selection', 'Community streamer', 2),
      answer('why_apply', 'Why do you want to apply?', 'motivation', 'Motivation and goals', 'long-text', '<script>alert("stored as text")</script> I care about kind communities.', 3),
      answer('confidence_fit', 'How does Project Respawn fit?', 'motivation', 'Motivation and goals', 'long-text', 'It fits reflective community challenges.', 4),
      answer('fit_reason', 'Why are you a good fit?', 'alignment', 'Alignment', 'long-text', 'Patient, inclusive community work.', 5),
      answer('genres', 'Choose up to five genres', 'content', 'Content and games', 'genres', ['Cosy', 'RPG', 'Strategy', 'Puzzle', 'Adventure'], 6),
      answer('favourite_games', 'Favourite games', 'content', 'Content and games', 'games', ['Stardew Valley', 'Final Fantasy XIV'], 7),
      answer('availability', 'Availability', 'profile', 'Creator profile', 'availability', ['Tuesday evening', 'Sunday afternoon'], 8),
      answer('profile_links', 'Other profiles', 'profile', 'Creator profile', 'urls', ['https://example.com/zoe/videos'], 9),
      answer('regular_schedule', 'Do you have a regular schedule?', 'schedule', 'Schedule', 'boolean', true, 10, 'Yes'),
      answer('additional_information', 'Anything else? (optional)', 'alignment', 'Alignment', 'short-text', null, 11),
      answer('terms_accepted', 'I agree to the declaration.', 'consent', 'Consent and declarations', 'consent', true, 12, 'Yes'),
    ],
    creatorProfiles: [
      { platform: 'Twitch', displayNameOrHandle: 'zoë_星', profileUrl: 'https://twitch.tv/example', isPrimary: true, contentTypes: ['Live streams'], isActive: true, displayOrder: 1 },
      { platform: 'YouTube', displayNameOrHandle: 'Zoe Example', profileUrl: 'https://youtube.com/@example', isPrimary: false, contentTypes: ['Edited video'], isActive: true, displayOrder: 2 },
      { platform: 'Discord', displayNameOrHandle: 'zoe.example', profileUrl: 'https://discord.gg/example', isPrimary: false, contentTypes: ['Public community'], relationshipToServer: 'Community owner', isActive: true, displayOrder: 3 },
    ],
    schedules: [
      { applicantTimeZone: 'Europe/London', hasRegularSchedule: true, scheduleVaries: false, dayOfWeek: 'Tuesday', startLocalTime: '19:00', endLocalTime: '22:00', profileReference: 'zoë_星', contentType: 'Live stream', nextPlannedPublicStream: '2026-08-18T18:00:00.000Z', publicViewingUrl: 'https://twitch.tv/example', displayOrder: 1 },
      { applicantTimeZone: 'Europe/London', hasRegularSchedule: true, scheduleVaries: false, dayOfWeek: 'Sunday', startLocalTime: '14:00', endLocalTime: '17:00', profileReference: 'zoë_星', contentType: 'Community stream', additionalNotes: 'Times remain local across DST.', displayOrder: 2 },
    ],
    ...overrides,
  }
}

function answer(questionKey: string, questionLabel: string, sectionKey: string, sectionLabel: string, answerType: string, value: unknown, displayOrder: number, safeDisplayValue?: string) {
  return { answerId: `answer-${displayOrder}`, questionKey, questionLabel, sectionKey, sectionLabel, answerType, value, displayOrder, ...(safeDisplayValue ? { safeDisplayValue } : {}) }
}

export function createMemoryClient(permissionKeys = ['applications.read', 'applications.storage.trusted'], groups = ['SuperAdmin']) {
  const names = ['ApplicationSubmission', 'ApplicationAnswer', 'ApplicationCreatorProfile', 'ApplicationSchedule', 'ApplicationAuditEvent', 'ApplicationIdempotency', 'ApplicationPublicRateLimit']
  const stores = Object.fromEntries(names.map((name) => [name, new Map<string, any>()])) as Record<string, Map<string, any>>
  const models: Record<string, any> = {}
  for (const name of names) models[name] = {
    get: async ({ id }: any) => ({ data: stores[name].get(id) || null }),
    create: async (input: any) => {
      if (stores[name].has(input.id)) return { data: null, errors: [{ message: 'Conditional request failed' }] }
      const timestamp = new Date().toISOString(); const row = { ...structuredClone(input), createdAt: timestamp, updatedAt: timestamp }
      stores[name].set(input.id, row); return { data: structuredClone(row) }
    },
    update: async (input: any) => {
      const current = stores[name].get(input.id); if (!current) return { data: null, errors: [{ message: 'Not found' }] }
      const row = { ...current, ...structuredClone(input), updatedAt: new Date().toISOString() }; stores[name].set(input.id, row); return { data: structuredClone(row) }
    },
    delete: async ({ id }: any) => { const row = stores[name].get(id) || null; stores[name].delete(id); return { data: row } },
    list: async ({ filter, limit = 1000 }: any = {}) => {
      let data = [...stores[name].values()]
      if (filter?.applicationId?.eq) data = data.filter((row) => row.applicationId === filter.applicationId.eq)
      return { data: structuredClone(data.slice(0, limit)), nextToken: null }
    },
  }
  models.PermissionDefinition = { list: async () => ({ data: permissionKeys.map((key) => ({ key, isActive: true })) }) }
  models.GroupPermission = { list: async () => ({ data: groups.flatMap((groupName) => permissionKeys.map((permissionKey) => ({ groupName, permissionKey, enabled: true }))) }) }
  return { models, stores }
}
