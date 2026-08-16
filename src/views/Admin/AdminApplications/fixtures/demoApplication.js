import { EMPTY_REVIEWER_SLOTS } from '../applicationTypes.js';

const answer = (key, label, section, order, type, value, displayValue) => Object.freeze({
  key, label, section, order, type, value, ...(displayValue === undefined ? {} : { displayValue }),
});

// Frontend-only fictional development data. This is not a genuine applicant and
// must be removed when applicationAdminData.js is replaced by the real service.
export const DEMO_APPLICATION = Object.freeze({
  id: 'APP-DEMO-0001',
  reference: 'APP-DEMO-0001',
  applicantName: 'Alex Demo',
  applicantEmail: 'alex.demo@example.com',
  pathway: 'creator',
  pathwayLabel: 'Creator Programme',
  status: 'awaiting-review',
  submittedAt: '2026-07-14T18:30:00.000Z',
  completedReviews: 0,
  identity: Object.freeze({
    displayName: 'Alex Demo',
    creatorName: 'DemoQuestAlex',
    email: 'alex.demo@example.com',
    discord: 'alexdemo.example',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    ageRange: '25–34',
    pronouns: null,
  }),
  answers: Object.freeze([
    answer('creator_name', 'Creator / display name', 'Basic details', 1, 'text', 'DemoQuestAlex'),
    answer('creator_platforms', 'Creator platforms', 'Creator profile', 2, 'list', ['Twitch', 'YouTube', 'TikTok']),
    answer('channel_link', 'Main channel link (Twitch or other)', 'Creator profile', 3, 'link', 'https://example.com/demoquestalex'),
    answer('profile_links', 'Other channel / profile links', 'Creator profile', 4, 'links', ['https://example.com/demoquestalex/videos', 'https://example.com/demoquestalex/community']),
    answer('stream_schedule', 'When do you stream and how often?', 'Creator profile', 5, 'long-text', 'Three evenings each week, usually Tuesday, Thursday and Sunday from 19:00–22:00 UK time. I also publish one edited community challenge each month.'),
    answer('availability', 'Availability', 'Creator profile', 6, 'list', ['Weekday evenings', 'Sunday afternoons', 'Two community events per month']),
    answer('mental_health_experience', 'Mental health experience', 'Creator profile', 7, 'text', 'Lived experience'),
    answer('creator_role', 'What role do you want to fill?', 'Creator profile', 8, 'text', 'Community streamer'),
    answer('genres', 'Choose up to five genres', 'Content and games', 9, 'list', ['Cozy', 'Role-playing', 'Strategy', 'Indie', 'Co-op']),
    answer('favourite_games', 'Choose up to three favourite games', 'Content and games', 10, 'list', ['Stardew Valley', 'Final Fantasy XIV', 'Deep Rock Galactic']),
    answer('competitive_information', 'Competitive information (where applicable)', 'Content and games', 11, 'text', null),
    answer('creator_experience', 'Creator experience', 'Experience and community', 12, 'long-text', 'I have spent three fictional years producing welcoming live and edited content, learning moderation workflows, accessible presentation and collaborative event planning.'),
    answer('community_experience', 'Community experience', 'Experience and community', 13, 'long-text', 'I run a small fictional Discord community centred on patient co-op play. Volunteer moderators use published expectations, content notes and clear escalation routes.'),
    answer('audience_information', 'Audience / community information', 'Experience and community', 14, 'text', 'A fictional mixed-platform community of around 450 followers, with 20–35 regular live participants.'),
    answer('previous_work', 'Examples of previous work', 'Experience and community', 15, 'links', ['https://example.com/demoquestalex/community-night', 'https://example.com/demoquestalex/accessibility-guide']),
    answer('why_apply', 'Why do you want to apply?', 'Motivation and goals', 16, 'long-text', 'I want to help show that progress in games and personal confidence can be celebrated without turning either into a competition. The programme would help me build more thoughtful community challenges.'),
    answer('confidence_fit', 'How do you see Project Respawn fitting your content?', 'Motivation and goals', 17, 'long-text', 'Project Respawn fits naturally into my fictional monthly co-op goals and reflection streams. I would introduce quests as optional prompts and celebrate participation rather than outcomes.'),
    answer('goals', 'Goals', 'Motivation and goals', 18, 'list', ['Host accessible community events', 'Create confidence-building challenges', 'Share practical moderation resources']),
    answer('relevant_skills', 'Relevant skills', 'Motivation and goals', 19, 'list', ['Live hosting', 'Video editing', 'Community moderation', 'Event planning']),
    answer('fit_reason', 'Why do you think you’re a good fit for our mission?', 'Alignment and final details', 20, 'long-text', 'I value kind, sustainable communities and transparent boundaries. My fictional work focuses on small achievable steps, asking for help, and making multiplayer spaces easier to enter.'),
    answer('additional_information', 'Anything else we should know? (optional)', 'Alignment and final details', 21, 'text', null),
    answer('terms_accepted', 'I agree to follow the Project Respawn code of conduct and understand this is a beta program.', 'Consent and declarations', 22, 'boolean', true, 'Yes'),
    answer('fictional_data_declaration', 'Demo record declaration', 'Consent and declarations', 23, 'boolean', true, 'Fictional frontend-only record'),
  ]),
  reviewerSlots: EMPTY_REVIEWER_SLOTS,
  metadata: Object.freeze({
    createdAt: '2026-07-14T18:30:00.000Z',
    updatedAt: '2026-07-14T18:30:00.000Z',
    formVersion: 'creator-demo-v1',
    auditHistory: null,
  }),
});

export const DEMO_APPLICATIONS = Object.freeze([DEMO_APPLICATION]);
