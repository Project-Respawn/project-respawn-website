import { computed } from 'vue';

export default {
  name: 'Creators',

  setup() {
    /*
     * TEMPORARY CONTENT SOURCE
     *
     * Add public creators to this array for now.
     * Tomorrow this can be replaced by an Admin-managed backend model without
     * changing the public page structure.
     *
     * Only add creators who have agreed to be publicly listed.
     */
    const creators = [
      // EXAMPLE STRUCTURE — copy this object when adding a real creator:
      //
      // {
      //   id: 'creator-slug',
      //   name: 'Creator Name',
      //   headline: 'Variety creator · Community focused',
      //   description: 'Short public description of their community.',
      //   image: '/images/creators/creator-name.jpg',
      //   tags: ['Variety', 'Just Chatting', 'Community'],
      //   twitch: 'https://twitch.tv/...',
      //   youtube: '',
      //   website: '',
      //   status: 'Founding Creator',
      //   featured: true,
      //   public: true
      // }
    ];

    const visibleCreators = computed(() =>
      creators
        .filter((creator) => creator.public !== false)
        .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    );

    function creatorInitials(name = '') {
      const parts = name.trim().split(/\s+/).filter(Boolean);
      if (!parts.length) return '?';
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return {
      visibleCreators,
      creatorInitials
    };
  }
};
