import { generateClient } from 'aws-amplify/data';

export const CREATOR_FORM_VERSION = 'creator-v1';
export const CREATOR_CONSENT_VERSION = 'creator-consent-v1';
const trim = (value) => String(value ?? '').trim();
const answer = (questionKey, questionLabel, sectionKey, sectionLabel, answerType, value, displayOrder, safeDisplayValue) => ({ answerId: `answer-${displayOrder}`, questionKey, questionLabel, sectionKey, sectionLabel, answerType, value, displayOrder, ...(safeDisplayValue === undefined ? {} : { safeDisplayValue }) });
const list = (value, max) => trim(value).split(/\r?\n|,/).map(trim).filter(Boolean).slice(0, max);
export function createRequestToken() { return crypto.getRandomValues(new Uint8Array(24)).reduce((value, byte) => value + byte.toString(16).padStart(2, '0'), ''); }
export function normalizeEmailForConfirmation(value) { const raw = trim(value); const at = raw.lastIndexOf('@'); return at > 0 ? `${raw.slice(0, at)}@${raw.slice(at + 1).toLowerCase()}` : raw; }
export function mapCreatorApplication(state, now = new Date()) {
  if (state.applicationType !== 'creator') throw new Error('Only Creator Programme applications are open.');
  const email = normalizeEmailForConfirmation(state.profile.email); const confirmation = normalizeEmailForConfirmation(state.profile.confirmEmail);
  if (!email || !confirmation) throw new Error('Enter and confirm your contact email.');
  if (email !== confirmation) throw new Error('The contact email addresses do not match.');
  if (!trim(state.profile.name) || !trim(state.profile.creatorName) || !trim(state.profile.discord) || !trim(state.profile.timezone)) throw new Error('Complete all required applicant details.');
  if (!trim(state.streamerRole) || !trim(state.streamerProfile.channelLink) || !trim(state.streamerProfile.whyApply) || !trim(state.streamerProfile.confidenceFit) || !trim(state.alignment.fitReason)) throw new Error('Complete all required Creator Programme fields.');
  if (state.alignment.termsAccepted !== true || state.alignment.publicContentConsent !== true) throw new Error('Accept both declarations before submitting.');
  const games = list(state.streamerProfile.games, 3); const profileRows = list(state.streamerProfile.otherProfiles, 10);
  const creatorProfiles = [];
  if (trim(state.streamerProfile.channelLink)) creatorProfiles.push({ platform: state.streamerProfile.platform || 'Other', customPlatformLabel: state.streamerProfile.platform === 'Other' ? trim(state.streamerProfile.customPlatformLabel) : undefined, displayNameOrHandle: trim(state.streamerProfile.handle) || trim(state.profile.creatorName), profileUrl: trim(state.streamerProfile.channelLink), isPrimary: true, contentTypes: ['Public creator content'], isActive: true, displayOrder: 1 });
  profileRows.forEach((profileUrl, index) => creatorProfiles.push({ platform: 'Other', customPlatformLabel: 'Other public profile', displayNameOrHandle: trim(state.profile.creatorName), profileUrl, isPrimary: false, contentTypes: ['Public creator content'], isActive: true, displayOrder: index + 2 }));
  creatorProfiles.push({ platform: 'Discord', displayNameOrHandle: trim(state.profile.discord), profileUrl: trim(state.streamerProfile.discordInvite) || undefined, isPrimary: false, contentTypes: ['Public community'], relationshipToServer: trim(state.streamerProfile.discordRelationship) || undefined, isActive: true, displayOrder: creatorProfiles.length + 1 });
  const schedule = state.schedule;
  const answers = [
    answer('creator_name', 'Creator / display name', 'basic', 'Basic details', 'short-text', trim(state.profile.creatorName), 1),
    answer('applicant_pronouns', 'Pronouns (optional)', 'basic', 'Basic details', 'short-text', trim(state.profile.pronouns) || null, 2),
    answer('discord_username', 'Discord username', 'basic', 'Basic details', 'short-text', trim(state.profile.discord), 3),
    answer('country_region', 'Country / region', 'basic', 'Basic details', 'short-text', trim(state.profile.country) || null, 4),
    answer('applicant_timezone', 'Applicant time zone', 'basic', 'Basic details', 'short-text', trim(state.profile.timezone), 5),
    answer('age_range', 'Age range', 'basic', 'Basic details', 'single-selection', trim(state.profile.ageRange) || null, 6),
    answer('creator_role', 'What role do you want to fill?', 'profile', 'Creator profile', 'single-selection', trim(state.streamerRole), 7),
    answer('channel_link', 'Main public channel link', 'profile', 'Creator profile', 'url', trim(state.streamerProfile.channelLink), 8),
    answer('stream_schedule_description', 'When do you stream and how often?', 'schedule', 'Content schedule', 'long-text', trim(state.streamerProfile.schedule) || null, 9),
    answer('mental_health_experience', 'Mental health experience', 'profile', 'Creator profile', 'single-selection', trim(state.streamerProfile.mentalHealth) || null, 10),
    answer('why_apply', 'Why do you want to apply?', 'motivation', 'Motivation and goals', 'long-text', trim(state.streamerProfile.whyApply), 11),
    answer('confidence_fit', 'How do you see Project Respawn fitting your content?', 'motivation', 'Motivation and goals', 'long-text', trim(state.streamerProfile.confidenceFit), 12),
    answer('genres', 'Choose up to five genres', 'content', 'Content and games', 'genres', [...state.streamerProfile.genres], 13),
    answer('favourite_games', 'Choose up to three favourite games', 'content', 'Content and games', 'games', games, 14),
    answer('fit_reason', 'Why do you think you’re a good fit for our mission?', 'alignment', 'Alignment and final details', 'long-text', trim(state.alignment.fitReason), 15),
    answer('additional_information', 'Anything else we should know? (optional)', 'alignment', 'Alignment and final details', 'long-text', trim(state.alignment.questions) || null, 16),
    answer('public_content_review_consent', 'Permission to review supplied public profiles and content', 'consent', 'Consent and declarations', 'consent', state.alignment.publicContentConsent === true, 17, state.alignment.publicContentConsent ? 'Yes' : 'No'),
    answer('terms_accepted', 'I agree to the Project Respawn declarations.', 'consent', 'Consent and declarations', 'consent', state.alignment.termsAccepted === true, 18, state.alignment.termsAccepted ? 'Yes' : 'No'),
  ];
  return { pathwayId: 'creator', formVersion: CREATOR_FORM_VERSION, applicantFullName: trim(state.profile.name), creatorDisplayName: trim(state.profile.creatorName), contactEmail: email, confirmEmail: confirmation, consentVersion: CREATOR_CONSENT_VERSION, consentedAt: now.toISOString(), answers, creatorProfiles,
    schedules: [{ applicantTimeZone: trim(state.profile.timezone), hasRegularSchedule: schedule.hasRegularSchedule === true, scheduleVaries: schedule.scheduleVaries === true, dayOfWeek: schedule.scheduleVaries ? undefined : trim(schedule.dayOfWeek) || undefined, startLocalTime: schedule.scheduleVaries ? undefined : trim(schedule.startLocalTime) || undefined, endLocalTime: schedule.scheduleVaries ? undefined : trim(schedule.endLocalTime) || undefined, profileReference: trim(state.streamerProfile.handle) || trim(state.profile.creatorName), contentType: trim(schedule.contentType) || undefined, nextPlannedPublicStream: trim(schedule.nextPlannedPublicStream) ? new Date(schedule.nextPlannedPublicStream).toISOString() : undefined, publicViewingUrl: trim(state.streamerProfile.channelLink) || undefined, additionalNotes: trim(schedule.notes) || undefined, displayOrder: 1 }], auditMetadata: { publicForm: CREATOR_FORM_VERSION } };
}
let client;
export async function submitCreatorApplication(payload, requestToken, website = '') {
  client ||= generateClient({ authMode: 'apiKey' }); const operation = client?.mutations?.submitPublicApplication;
  if (typeof operation !== 'function') throw new Error('The public application service is unavailable. Please refresh and try again.');
  const response = await operation({ payload, requestToken, website }, { authMode: 'apiKey', selectionSet: ['success','reference','submittedAt','confirmationStatus','errorCode','issues','message','supportReference'] });
  if (response.errors?.length) throw new Error(response.errors[0].message || 'Application submission failed.');
  if (response.data?.success === false) { const error = new Error(response.data.message || response.data.errorCode || 'Application submission failed.'); error.code = response.data.errorCode; error.issues = response.data.issues; error.supportReference = response.data.supportReference; throw error; }
  return response.data;
}
