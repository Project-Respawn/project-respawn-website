import { computed, reactive, ref } from 'vue';

const STORAGE_KEY = 'project-respawn-creator-profile-demo-v1';

function defaultProfile() {
  return {
    displayName: '',
    headline: '',
    bio: '',
    avatarUrl: '',
    categories: ['Variety', 'Community'],
    games: [],
    theme: 'respawn',
    publicOptIn: false,
    status: 'draft',
    featured: false,
    links: {
      twitch: '',
      youtube: '',
      tiktok: '',
      instagram: '',
      website: ''
    }
  };
}

function loadStoredProfile() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return parsed && typeof parsed === 'object'
      ? {
          ...defaultProfile(),
          ...parsed,
          links: {
            ...defaultProfile().links,
            ...(parsed.links || {})
          }
        }
      : defaultProfile();
  } catch {
    return defaultProfile();
  }
}

export default {
  name: 'CreatorProfile',

  setup() {
    const profile = reactive(loadStoredProfile());
    const activeTab = ref('identity');
    const newCategory = ref('');
    const newGame = ref('');
    const lastSaved = ref('');

    const tabs = [
      { key: 'identity', label: 'Identity' },
      { key: 'content', label: 'Content & Categories' },
      { key: 'links', label: 'Links' },
      { key: 'appearance', label: 'Appearance' },
      { key: 'discovery', label: 'Discovery' }
    ];

  const themes = [
  { key: 'respawn', label: 'Respawn', description: 'Default' },
  { key: 'midnight', label: 'Midnight', description: 'Cool & Bold' },
  { key: 'ember', label: 'Ember', description: 'Warm & Intense' },
  { key: 'aurora', label: 'Aurora', description: 'Fresh & Vibrant' },
  { key: 'pink', label: 'Neon Pink', description: 'Bright & Playful' },
  { key: 'rainbow', label: 'Rainbow', description: 'Colourful & Expressive' },
  { key: 'sunset', label: 'Sunset', description: 'Warm & Colourful' },
  { key: 'frost', label: 'Frost', description: 'Cool & Clean' }
];

    const howItWorks = [
      { title: 'Set up', copy: 'Create your creator identity and card.' },
      { title: 'Preview', copy: 'See exactly how your card will look.' },
      { title: 'Submit', copy: 'Opt into creator discovery.' },
      { title: 'Review', copy: 'Project Respawn can approve the public listing.' },
      { title: 'Go live', copy: 'Your creator card appears for the community to discover.' }
    ];

    const initials = computed(() => {
      const value = (profile.displayName || 'CR').trim();
      const parts = value.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return value.slice(0, 2).toUpperCase();
    });

    const statusLabel = computed(() => {
      if (profile.status === 'pending') return 'Pending Review';
      if (profile.status === 'published') return 'Published';
      if (profile.status === 'hidden') return 'Hidden';
      return 'Draft';
    });

    const activeThemeLabel = computed(() =>
      themes.find((theme) => theme.key === profile.theme)?.label || 'Respawn'
    );

    function addCategory() {
      const value = newCategory.value.trim();
      if (!value || profile.categories.length >= 5) return;
      if (!profile.categories.some((item) => item.toLowerCase() === value.toLowerCase())) {
        profile.categories.push(value);
      }
      newCategory.value = '';
    }

    function removeCategory(category) {
      profile.categories = profile.categories.filter((item) => item !== category);
    }

    function addGame() {
      const value = newGame.value.trim();
      if (!value || profile.games.length >= 4) return;
      if (!profile.games.some((item) => item.toLowerCase() === value.toLowerCase())) {
        profile.games.push(value);
      }
      newGame.value = '';
    }

    function removeGame(game) {
      profile.games = profile.games.filter((item) => item !== game);
    }

    function saveProfile() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      lastSaved.value = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    function submitForReview() {
      profile.status = 'pending';
      saveProfile();
    }

    function scrollToPreview() {
      document.getElementById('creator-profile-preview')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }

    return {
      profile,
      activeTab,
      newCategory,
      newGame,
      lastSaved,
      tabs,
      themes,
      howItWorks,
      initials,
      statusLabel,
      activeThemeLabel,
      addCategory,
      removeCategory,
      addGame,
      removeGame,
      saveProfile,
      submitForReview,
      scrollToPreview
    };
  }
};
