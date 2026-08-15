import { computed, nextTick, ref } from 'vue';
import { useRoute } from 'vue-router';
import FeatureTeaser from '../../components/FeatureTeaser/FeatureTeaser.vue';
import TimezoneSelector from '../../components/TimezoneSelector/TimezoneSelector.vue';

const AVAILABLE_TYPES = new Set(['creator', 'competitive-streamer', 'competitive-player', 'competitive-coaching', 'competitive-analysis']);
const COMING_SOON_TYPES = new Set(['therapist', 'trainer']);
const GENRES = ['Action', 'Adventure', 'Battle royale', 'Cosy', 'Fighting', 'Horror', 'MMO', 'Party games', 'Platformer', 'Puzzle', 'Racing', 'RPG', 'Shooter', 'Simulation', 'Sports', 'Strategy', 'Survival'];
const COMPETITIVE_GAMES = {
  lol: { label: 'League of Legends', ranks: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger'], positions: ['Top', 'Jungle', 'Mid', 'Bot or ADC', 'Support'] },
  valorant: { label: 'Valorant', ranks: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'], positions: ['Duelist', 'Initiator', 'Controller', 'Sentinel', 'Flex'] },
  cs2: { label: 'Counter-Strike 2', ranks: ['Not ranked', 'Premier rating', 'Faceit level 1–3', 'Faceit level 4–6', 'Faceit level 7–9', 'Faceit level 10'], positions: ['Entry fragger', 'AWPer', 'In-game leader', 'Lurker', 'Support', 'Flex'] },
  rocketLeague: { label: 'Rocket League', ranks: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Champion', 'Grand Champion', 'Supersonic Legend'], positions: ['First player', 'Second player', 'Third player', 'Flex'] },
  other: { label: 'Other / rank not listed', ranks: ['Not ranked', 'Rank not listed'], positions: ['Player', 'Coach', 'Analyst', 'Manager or support staff', 'Other'] },
};

export default {
  name: 'Applications',
  components: { FeatureTeaser, TimezoneSelector },
  setup() {
    const route = useRoute();
    const requestedType = Array.isArray(route.query.type) ? route.query.type[0] : route.query.type;
    const initialType = [...AVAILABLE_TYPES, ...COMING_SOON_TYPES].includes(requestedType) ? requestedType : null;
    const currentStep = ref(1);
    const applicationType = ref(initialType);
    const profile = ref({ name: '', pronouns: '', discord: '', email: '', country: '', timezone: '', ageRange: '' });
    const streamerProfile = ref({ channelLink: '', schedule: '', mentalHealth: '', whyApply: '', confidenceFit: '', genres: [] });
    const streamerRole = ref(null);
    const competitiveProfile = ref({ game: 'lol', platform: '', region: '', peakRank: '', currentRank: '', primaryPosition: '', secondaryPosition: '', flexiblePosition: false, years: null, about: '', coachingExperience: '', coachingMethod: '' });
    const alignment = ref({ fitReason: '', questions: '', termsAccepted: false });

    const isComingSoon = computed(() => COMING_SOON_TYPES.has(applicationType.value));
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
      if (COMING_SOON_TYPES.has(type)) {
        currentStep.value = 1;
        await nextTick();
        document.querySelector('.coming-soon-panel h2')?.focus();
      }
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
      if (step === 1) return AVAILABLE_TYPES.has(applicationType.value);
      if (step === 2) return !!profile.value.name && !!profile.value.email && !!profile.value.discord;
      if (step === 3 && isStreamer.value) return !!streamerRole.value;
      return true;
    };
    const goToNextStep = () => { if (canProceedFromStep(currentStep.value) && currentStep.value < 4) currentStep.value += 1; };
    const goToPreviousStep = () => { if (currentStep.value > 1) currentStep.value -= 1; };
    const submitApplication = () => {
      // Intentionally disabled until protected Amplify application persistence exists.
    };

    return {
      currentStep, applicationType, profile, streamerProfile, streamerRole, competitiveProfile, alignment,
      genres: GENRES, competitiveGames: COMPETITIVE_GAMES, rankOptions, positionOptions,
      isComingSoon, isCreator, isStreamer, isCompetitive, isCompetitiveSupport, comingSoonCopy,
      setApplicationType, returnToChoices, toggleGenre, resetCompetitiveSelections,
      setStreamerRole, setStreamerMentalHealth, goToNextStep, goToPreviousStep, submitApplication,
    };
  },
};
