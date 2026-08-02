import { ref, computed } from 'vue';

export default {
  name: 'Applications',
  setup() {
    const currentStep = ref(1);

    const applicationType = ref(null);

    const profile = ref({
      name: '',
      pronouns: '',
      discord: '',
      email: '',
      country: '',
      timezone: '',
      ageRange: '',
    });

    const streamerProfile = ref({
      channelLink: '',
      schedule: '',
      mentalHealth: '',
      whyApply: '',
      confidenceFit: '',
    });

    const streamerRole = ref(null);

    const therapistProfile = ref({
      practiceType: '',
      qualifications: '',
      clientFocus: '',
      questsUsage: '',
    });

    const trainerProfile = ref({
      trainingFocus: '',
      deliveryMode: '',
      questsUsage: '',
    });

    const competitiveProfile = ref({
      game: '',
      platform: '',
      peakRank: '',
      currentRank: '',
      roles: '',
      years: null,
      about: '',
    });

    const alignment = ref({
      fitReason: '',
      questions: '',
      termsAccepted: false,
    });

    const isStreamer = computed(() =>
      applicationType.value === 'streamer-community' ||
      applicationType.value === 'streamer-competitive' ||
      applicationType.value === 'streamer-both',
    );

    const setApplicationType = (type) => {
      applicationType.value = type;
      // reset type-specific fields where sensible
      if (!isStreamer.value) {
        streamerRole.value = null;
        streamerProfile.value.mentalHealth = '';
      }
    };

    const setStreamerRole = (roleKey) => {
      streamerRole.value = roleKey;
    };

    const setStreamerMentalHealth = (value) => {
      streamerProfile.value.mentalHealth = value;
    };

    const canProceedFromStep = (step) => {
      if (step === 1) {
        return !!applicationType.value;
      }

      if (step === 2) {
        return !!profile.value.name && !!profile.value.email && !!profile.value.discord;
      }

      if (step === 3 && isStreamer.value) {
        // require streamerRole if streamer
        return !!streamerRole.value;
      }

      // you can add more validation per role here later
      return true;
    };

    const goToNextStep = () => {
      if (!canProceedFromStep(currentStep.value)) {
        return;
      }
      if (currentStep.value < 4) {
        currentStep.value += 1;
      }
    };

    const goToPreviousStep = () => {
      if (currentStep.value > 1) {
        currentStep.value -= 1;
      }
    };

    const submitApplication = () => {
      const payload = {
        applicationType: applicationType.value,
        profile: profile.value,
        streamerProfile: isStreamer.value ? streamerProfile.value : null,
        streamerRole: isStreamer.value ? streamerRole.value : null,
        therapistProfile:
          applicationType.value === 'therapist' ? therapistProfile.value : null,
        trainerProfile:
          applicationType.value === 'trainer' ? trainerProfile.value : null,
        competitiveProfile:
          applicationType.value === 'competitive-only' ? competitiveProfile.value : null,
        alignment: alignment.value,
      };

      // TODO: wire up to Amplify / API / CSV backend
      console.log('Application submitted:', payload);
      // For now, you could also reset:
      // currentStep.value = 1;
      // etc.
    };

    return {
      currentStep,
      applicationType,
      // shared
      profile,
      // streamer
      isStreamer,
      streamerProfile,
      streamerRole,
      setStreamerRole,
      setStreamerMentalHealth,
      // therapist
      therapistProfile,
      // trainer
      trainerProfile,
      // competitive
      competitiveProfile,
      // alignment
      alignment,
      // controls
      setApplicationType,
      goToNextStep,
      goToPreviousStep,
      submitApplication,
    };
  },
};