import { computed, nextTick, ref } from 'vue';
import { useRoute } from 'vue-router';
import FeatureTeaser from '../../components/FeatureTeaser/FeatureTeaser.vue';
import TimezoneSelector from '../../components/TimezoneSelector/TimezoneSelector.vue';
import { APPLICATION_PATHWAY_AVAILABILITY, APPLICATION_PATHWAY_LABELS, PATHWAY_AVAILABILITY, canEnterApplicationPathway, getPathwayAvailability } from '../../config/applicationPathwayAvailability.js';
import { createRequestToken, mapCreatorApplication, submitCreatorApplication } from './applicationSubmission.js';

const KNOWN_TYPES = new Set(Object.keys(APPLICATION_PATHWAY_AVAILABILITY));
const GENRES = ['Action', 'Adventure', 'Battle royale', 'Cosy', 'Fighting', 'Horror', 'MMO', 'Party games', 'Platformer', 'Puzzle', 'Racing', 'RPG', 'Shooter', 'Simulation', 'Sports', 'Strategy', 'Survival'];
const COMPETITIVE_GAMES = {
  lol: { label: 'League of Legends', ranks: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger'], positions: ['Top', 'Jungle', 'Mid', 'Bot or ADC', 'Support'] },
  valorant: { label: 'Valorant', ranks: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'], positions: ['Duelist', 'Initiator', 'Controller', 'Sentinel', 'Flex'] },
  cs2: { label: 'Counter-Strike 2', ranks: ['Not ranked', 'Premier rating', 'Faceit level 1–3', 'Faceit level 4–6', 'Faceit level 7–9', 'Faceit level 10'], positions: ['Entry fragger', 'AWPer', 'In-game leader', 'Lurker', 'Support', 'Flex'] },
  rocketLeague: { label: 'Rocket League', ranks: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Champion', 'Grand Champion', 'Supersonic Legend'], positions: ['First player', 'Second player', 'Third player', 'Flex'] },
  other: { label: 'Other / rank not listed', ranks: ['Not ranked', 'Rank not listed'], positions: ['Player', 'Coach', 'Analyst', 'Manager or support staff', 'Other'] },
};
const createCompetitiveProfile = () => ({ game: 'lol', platform: '', region: '', peakRank: '', currentRank: '', primaryPosition: '', secondaryPosition: '', flexiblePosition: false, years: null, about: '', coachingExperience: '', coachingMethod: '' });

export default {
  name: 'Applications',
  components: { FeatureTeaser, TimezoneSelector },
  setup() {
    const route = useRoute();
    const requestedType = Array.isArray(route.query.type) ? route.query.type[0] : route.query.type;
    const initialType = KNOWN_TYPES.has(requestedType) ? requestedType : null;
    const currentStep = ref(1);
    const applicationType = ref(initialType);
    const profile = ref({ name: '', creatorName: '', pronouns: '', discord: '', email: '', confirmEmail: '', country: '', timezone: '', ageRange: '' });
    const streamerProfile = ref({ platform: 'Twitch', customPlatformLabel: '', handle: '', channelLink: '', otherProfiles: '', discordInvite: '', discordRelationship: '', schedule: '', mentalHealth: '', whyApply: '', confidenceFit: '', genres: [], games: '' });
    const schedule = ref({ hasRegularSchedule: true, scheduleVaries: false, dayOfWeek: '', startLocalTime: '', endLocalTime: '', contentType: '', nextPlannedPublicStream: '', notes: '' });
    const streamerRole = ref(null);
    const competitiveProfile = ref(createCompetitiveProfile());
    const alignment = ref({ fitReason: '', questions: '', termsAccepted: false, publicContentConsent: false });
    const submission = ref({ state: 'idle', error: '', reference: '', submittedAt: '' });
    const requestToken = ref(createRequestToken());
    const website = ref('');

    const selectedAvailability = computed(() => getPathwayAvailability(applicationType.value));
    const isComingSoon = computed(() => selectedAvailability.value === PATHWAY_AVAILABILITY.COMING_SOON);
    const isClosed = computed(() => selectedAvailability.value === PATHWAY_AVAILABILITY.CLOSED);
    const isActivePathway = computed(() => canEnterApplicationPathway(applicationType.value));
    const selectedPathwayLabel = computed(() => APPLICATION_PATHWAY_LABELS[applicationType.value] || 'Application pathway');
    const isCreator = computed(() => applicationType.value === 'creator');
    const isStreamer = computed(() => applicationType.value === 'creator');
    const isCompetitive = computed(() => applicationType.value?.startsWith('competitive-'));
    const isCompetitiveSupport = computed(() => ['competitive-coaching', 'competitive-analysis'].includes(applicationType.value));
    const selectedGame = computed(() => COMPETITIVE_GAMES[competitiveProfile.value.game] || COMPETITIVE_GAMES.other);
    const rankOptions = computed(() => selectedGame.value.ranks);
    const positionOptions = computed(() => selectedGame.value.positions);
    const comingSoonCopy = computed(() => applicationType.value === 'therapist'
      ? 'We are developing a dedicated partnership pathway for therapists who want to use Project Respawn’s confidence-building quests and progression tools alongside their work.'
      : 'We are developing a dedicated partnership pathway for personal trainers who want to connect physical goals, confidence-building challenges and member progression.');

    const setApplicationType = async (type) => {
      applicationType.value = type;
      streamerRole.value = null;
      if (!canEnterApplicationPathway(type)) {
        currentStep.value = 1;
        await nextTick();
        document.querySelector(isClosed.value ? '.closed-recruitment-panel h2' : '.coming-soon-panel h2')?.focus();
      }
    };
    const startCreatorApplication = async () => {
      competitiveProfile.value = createCompetitiveProfile();
      streamerRole.value = null;
      applicationType.value = 'creator';
      currentStep.value = 1;
      await nextTick();
      document.querySelector('.step-title')?.focus();
    };
    const returnToChoices = async () => {
      applicationType.value = null;
      await nextTick();
      document.querySelector('.step-title')?.focus();
    };
    const toggleGenre = (genre) => {
      const selected = streamerProfile.value.genres;
      const index = selected.indexOf(genre);
      if (index >= 0) selected.splice(index, 1);
      else if (selected.length < 5) selected.push(genre);
    };
    const resetCompetitiveSelections = () => {
      Object.assign(competitiveProfile.value, { currentRank: '', peakRank: '', primaryPosition: '', secondaryPosition: '' });
    };
    const setStreamerRole = (roleKey) => { streamerRole.value = roleKey; };
    const setStreamerMentalHealth = (value) => { streamerProfile.value.mentalHealth = value; };
    const canProceedFromStep = (step) => {
      if (step === 1) return canEnterApplicationPathway(applicationType.value);
      if (step === 2) return !!profile.value.name && !!profile.value.creatorName && !!profile.value.email && !!profile.value.confirmEmail && !!profile.value.discord && !!profile.value.timezone;
      if (step === 3 && isStreamer.value) return !!streamerRole.value && !!streamerProfile.value.channelLink && !!streamerProfile.value.whyApply && !!streamerProfile.value.confidenceFit;
      return true;
    };
    const goToNextStep = () => { if (canProceedFromStep(currentStep.value) && currentStep.value < 4) currentStep.value += 1; };
    const goToPreviousStep = () => { if (currentStep.value > 1) currentStep.value -= 1; };
    const submitApplication = async () => {
      if (!canEnterApplicationPathway(applicationType.value)) return;
      if (submission.value.state === 'submitting') return;
      submission.value = { state: 'submitting', error: '', reference: '', submittedAt: '' };
      try {
        const payload = mapCreatorApplication({ applicationType: applicationType.value, profile: profile.value, streamerProfile: streamerProfile.value, streamerRole: streamerRole.value, schedule: schedule.value, alignment: alignment.value });
        const result = await submitCreatorApplication(payload, requestToken.value, website.value);
        submission.value = { state: 'success', error: '', reference: result.reference, submittedAt: result.submittedAt };
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        const friendly = /EMAIL_CONFIRMATION_MISMATCH|do not match/i.test(message) ? 'The contact email addresses do not match.' : /RATE_LIMITED/i.test(message) ? 'Too many application attempts were made. Please wait and try again.' : /CONTACT_EMAIL|email/i.test(message) ? 'Enter a valid contact email address in both email fields.' : /PATHWAY/i.test(message) ? 'This application pathway is not open.' : /network|fetch/i.test(message) ? 'The application could not reach the server. Your answers are still here; please try again.' : 'The application could not be submitted. Your answers are still here; please review them and try again.';
        submission.value = { state: 'error', error: friendly, reference: '', submittedAt: '' };
      }
    };

    return {
      currentStep, applicationType, profile, streamerProfile, streamerRole, competitiveProfile, alignment, schedule, submission, website,
      genres: GENRES, competitiveGames: COMPETITIVE_GAMES, rankOptions, positionOptions,
      isComingSoon, isClosed, isActivePathway, selectedPathwayLabel, isCreator, isStreamer, isCompetitive, isCompetitiveSupport, comingSoonCopy,
      pathwayAvailability: APPLICATION_PATHWAY_AVAILABILITY, availabilityStates: PATHWAY_AVAILABILITY,
      setApplicationType, returnToChoices, startCreatorApplication, toggleGenre, resetCompetitiveSelections,
      setStreamerRole, setStreamerMentalHealth, goToNextStep, goToPreviousStep, submitApplication,
    };
  },
};
