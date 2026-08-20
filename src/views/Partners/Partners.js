import { computed } from 'vue';

export default {
  name: 'Partners',

  setup() {
    /*
     * TEMPORARY CONTENT SOURCE
     *
     * Add confirmed public partners here for now.
     * Do NOT list an affiliate programme, software vendor, platform, university
     * or brand as a "partner" unless there is a genuine relationship you are
     * entitled to describe publicly.
     *
     * Tomorrow this can be replaced by an Admin-managed backend model without
     * changing the public page structure.
     */
    const partners = [
      // EXAMPLE STRUCTURE — copy this object for a real confirmed relationship:
      //
      // {
      //   id: 'partner-slug',
      //   name: 'Partner Name',
      //   category: 'Technology Partner',
      //   relationship: 'Technology',
      //   description: 'One sentence describing the real public relationship.',
      //   logo: '/images/partners/partner-name.png',
      //   website: 'https://...',
      //   tags: ['Integration', 'Creator Tools'],
      //   featured: true,
      //   public: true
      // }
    ];

    const visiblePartners = computed(() =>
      partners
        .filter((partner) => partner.public !== false)
        .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    );

    return {
      visiblePartners
    };
  }
};
