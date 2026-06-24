import { generateClient } from 'aws-amplify/data';
import { fetchAuthSession } from 'aws-amplify/auth';

const client = generateClient({ authMode: 'userPool' });

function createEmptyTicketTier() {
  return {
    localId: `ticket-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    price: 0,
    perks: '',
    quantityAvailable: null,
  };
}

function createEmptyForm() {
  return {
    id: null,
    title: '',
    shortDescription: '',
    longDescription: '',
    // categories is now an array, not a single string
    categories: [],
    locationType: 'online',
    tagIds: [],
    // host selection fields
    hostUserId: '',
    hostDisplayName: '',
    startAt: '',
    endAt: '',
    ctaLabel: 'View event',
    ctaUrl: '',
    rewardText: '',
    featured: false,
    status: 'draft',
    ticketMode: 'free',
    ticketTiers: [],
  };
}

export default {
  name: 'AdminEvents',

  data() {
    return {
      loading: false,
      saving: false,
      currentUserGroups: [],

      events: [],
      suggestions: [],
      tags: [],

      eventSearch: '',
      eventStatusFilter: 'all',

      wizardOpen: false,
      wizardMode: 'create',
      currentStep: 1,
      selectedSuggestion: null,

      eventForm: createEmptyForm(),

      // new host search state
      hostSearch: '',
      hostOptions: [],

      // static category options for checkbox group
      categoryOptions: [
        { value: 'community', label: 'Community' },
        { value: 'quest', label: 'Quest' },
        { value: 'gaming', label: 'Gaming' },
        { value: 'support', label: 'Support' },
        { value: 'development', label: 'Development' },
      ],

      newTag: {
        name: '',
        type: 'category',
        visibleOnEventCard: false,
      },
    };
  },

  computed: {
    summary() {
      return {
        upcoming: this.events.filter((item) => item.status === 'upcoming').length,
        draft: this.events.filter((item) => item.status === 'draft' || !item.status).length,
        pendingSuggestions: this.suggestions.filter((item) => item.status === 'pending').length,
        tags: this.tags.length,
      };
    },

    filteredEvents() {
      return this.events.filter((event) => {
        const matchesSearch =
          !this.eventSearch ||
          `${event.title} ${event.shortDescription || ''} ${event.description || ''}`
            .toLowerCase()
            .includes(this.eventSearch.toLowerCase());

        const matchesStatus =
          this.eventStatusFilter === 'all' ||
          (event.status || 'draft') === this.eventStatusFilter;

        return matchesSearch && matchesStatus;
      });
    },

    pendingSuggestions() {
      return this.suggestions.filter((item) => item.status === 'pending');
    },

    groupedTags() {
      const labelMap = {
        category: 'Categories',
        location: 'Locations',
        host: 'Host tags',
        general: 'General tags',
      };

      const grouped = {};

      this.tags.forEach((tag) => {
        const type = tag.type || 'general';
        if (!grouped[type]) grouped[type] = [];
        grouped[type].push(tag);
      });

      return Object.keys(grouped).map((type) => ({
        type,
        label: labelMap[type] || type,
        items: grouped[type],
      }));
    },

    wizardHeading() {
      if (this.wizardMode === 'suggestion') {
        return 'Review and publish suggested event';
      }

      if (this.eventForm.id) {
        return 'Edit event';
      }

      return 'Create a new event';
    },

    wizardSubmitLabel() {
      if (this.wizardMode === 'suggestion') {
        return 'Approve and create event';
      }

      return this.eventForm.id ? 'Save changes' : 'Create event';
    },

    // host list filtered by search
    filteredHostOptions() {
      const search = this.hostSearch.toLowerCase().trim();

      return this.hostOptions.filter((user) => {
        const text = `${user.displayName || ''} ${user.primaryRoleLabel || ''}`.toLowerCase();
        return !search || text.includes(search);
      });
    },
  },

  async created() {
    await this.bootstrap();
  },

  methods: {
    async bootstrap() {
      this.loading = true;

      try {
        await Promise.all([
          this.loadCurrentUserGroups(),
          this.loadEvents(),
          this.loadSuggestions(),
          this.loadTags(),
          this.loadHostOptions(),
        ]);
      } catch (error) {
        console.error('AdminEvents bootstrap failed:', error);
      } finally {
        this.loading = false;
      }
    },

    async loadCurrentUserGroups() {
      try {
        const session = await fetchAuthSession();
        this.currentUserGroups = session.tokens?.accessToken?.payload?.['cognito:groups'] || [];
      } catch (error) {
        console.error('Could not load current user groups:', error);
        this.currentUserGroups = [];
      }
    },

    async loadEvents() {
      try {
        const { data, errors } = await client.models.Event.list();

        if (errors?.length) {
          console.error('Event list errors:', errors);
          return;
        }

        this.events = (data || []).map((item) => {
          const categories = Array.isArray(item.categories) ? item.categories : [];
          const categorySummary = categories.join(', ');
          return {
            ...item,
            categories,
            categorySummary,
            shortDescription: item.shortDescription || item.description || '',
          };
        });
      } catch (error) {
        console.error('Failed to load events:', error);
      }
    },

    async loadSuggestions() {
      try {
        if (!client.models.EventSuggestion) {
          this.suggestions = [];
          return;
        }

        const { data, errors } = await client.models.EventSuggestion.list();

        if (errors?.length) {
          console.error('Suggestion list errors:', errors);
          return;
        }

        this.suggestions = data || [];
      } catch (error) {
        console.error('Failed to load suggestions:', error);
      }
    },

    async loadTags() {
      try {
        if (!client.models.EventTag) {
          this.tags = [];
          return;
        }

        const { data, errors } = await client.models.EventTag.list();

        if (errors?.length) {
          console.error('Tag list errors:', errors);
          return;
        }

        this.tags = data || [];
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    },

    // hostOptions should come from your own user profile model
    async loadHostOptions() {
      try {
        if (!client.models.UserProfile) {
          this.hostOptions = [];
          return;
        }

        const { data, errors } = await client.models.UserProfile.list();

        if (errors?.length) {
          console.error('Host list errors:', errors);
          return;
        }

        const allowedRoles = ['Trainer', 'StreamingPartner', 'Streamer'];

        this.hostOptions = (data || [])
          .filter((user) => {
            const roles = Array.isArray(user.roles) ? user.roles : [];
            return roles.some((role) => allowedRoles.includes(role));
          })
          .map((user) => ({
            id: user.id,
            displayName:
              user.preferredUsername ||
              user.displayName ||
              user.username ||
              user.email,
            primaryRoleLabel: Array.isArray(user.roles) ? user.roles[0] : 'Host',
          }))
          .sort((a, b) => a.displayName.localeCompare(b.displayName));
      } catch (error) {
        console.error('Failed to load host options:', error);
        this.hostOptions = [];
      }
    },

    async refreshAll() {
      await this.bootstrap();
    },

    openCreateWizard() {
      this.wizardMode = 'create';
      this.selectedSuggestion = null;
      this.currentStep = 1;
      this.eventForm = createEmptyForm();
      this.hostSearch = '';
      this.wizardOpen = true;
    },

    closeWizard() {
      this.wizardOpen = false;
      this.currentStep = 1;
      this.selectedSuggestion = null;
      this.wizardMode = 'create';
      this.eventForm = createEmptyForm();
      this.hostSearch = '';
    },

    goToStep(step) {
      this.currentStep = step;
    },

    nextStep() {
      if (this.currentStep < 3) {
        this.currentStep += 1;
      }
    },

    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep -= 1;
      }
    },

    editEvent(event) {
      this.wizardMode = 'create';
      this.selectedSuggestion = null;
      this.currentStep = 1;

      const categories = Array.isArray(event.categories) ? [...event.categories] : [];
      this.eventForm = {
        id: event.id,
        title: event.title || '',
        shortDescription: event.shortDescription || event.description || '',
        longDescription: event.longDescription || event.description || '',
        categories,
        locationType: event.locationType || 'online',
        tagIds: Array.isArray(event.tagIds) ? [...event.tagIds] : [],
        hostUserId: event.hostUserId || '',
        hostDisplayName: event.hostDisplayName || event.host || '',
        startAt: this.toLocalDateTime(event.startAt),
        endAt: this.toLocalDateTime(event.endAt),
        ctaLabel: event.ctaLabel || 'View event',
        ctaUrl: event.ctaUrl || '',
        rewardText: event.rewardText || '',
        featured: !!event.featured,
        status: event.status || 'draft',
        ticketMode: event.ticketMode || 'free',
        ticketTiers: Array.isArray(event.ticketTiers)
          ? event.ticketTiers.map((tier, index) => ({
              localId: `ticket-edit-${index}-${Date.now()}`,
              name: tier.name || '',
              price: tier.price || 0,
              perks: tier.perks || '',
              quantityAvailable: tier.quantityAvailable ?? null,
            }))
          : [],
      };

      this.hostSearch = '';
      this.wizardOpen = true;
    },

    approveSuggestionStart(suggestion) {
      this.wizardMode = 'suggestion';
      this.selectedSuggestion = suggestion;
      this.currentStep = 1;

      this.eventForm = {
        ...createEmptyForm(),
        title: suggestion.title || '',
        shortDescription: suggestion.description || '',
        longDescription: suggestion.notes || suggestion.description || '',
        categories: Array.isArray(suggestion.categories)
          ? [...suggestion.categories]
          : suggestion.category
          ? [suggestion.category]
          : [],
        locationType: suggestion.locationType || 'online',
        hostUserId: suggestion.hostUserId || '',
        hostDisplayName: suggestion.host || suggestion.ownerDisplayName || '',
        startAt: this.toLocalDateTime(suggestion.startAt),
        endAt: this.toLocalDateTime(suggestion.endAt),
      };

      this.hostSearch = this.eventForm.hostDisplayName || '';
      this.wizardOpen = true;
    },

    async rejectSuggestion(suggestion) {
      try {
        if (!client.models.EventSuggestion) return;

        const { errors } = await client.models.EventSuggestion.update({
          id: suggestion.id,
          status: 'rejected',
        });

        if (errors?.length) {
          console.error('Reject suggestion errors:', errors);
          return;
        }

        await this.loadSuggestions();
      } catch (error) {
        console.error('Failed to reject suggestion:', error);
      }
    },

    toggleFormTag(tagId) {
      if (this.eventForm.tagIds.includes(tagId)) {
        this.eventForm.tagIds = this.eventForm.tagIds.filter((id) => id !== tagId);
      } else {
        this.eventForm.tagIds = [...this.eventForm.tagIds, tagId];
      }
    },

    toggleCategory(value) {
      if (this.eventForm.categories.includes(value)) {
        this.eventForm.categories = this.eventForm.categories.filter(
          (item) => item !== value,
        );
      } else {
        this.eventForm.categories = [...this.eventForm.categories, value];
      }
    },

    syncSelectedHost() {
      const selected = this.hostOptions.find(
        (user) => user.id === this.eventForm.hostUserId,
      );
      this.eventForm.hostDisplayName = selected?.displayName || '';
    },

    async createTag() {
      const name = this.newTag.name.trim();
      if (!name || !client.models.EventTag) return;

      try {
        const payload = {
          name,
          slug: this.slugify(name),
          type: this.newTag.type,
          visibleOnEventCard: !!this.newTag.visibleOnEventCard,
          isActive: true,
        };

        const { errors } = await client.models.EventTag.create(payload);

        if (errors?.length) {
          console.error('Create tag errors:', errors);
          return;
        }

        this.newTag = {
          name: '',
          type: 'category',
          visibleOnEventCard: false,
        };

        await this.loadTags();
      } catch (error) {
        console.error('Failed to create tag:', error);
      }
    },

    async toggleTagActive(tag) {
      try {
        if (!client.models.EventTag) return;

        const { errors } = await client.models.EventTag.update({
          id: tag.id,
          isActive: !tag.isActive,
        });

        if (errors?.length) {
          console.error('Toggle tag errors:', errors);
          return;
        }

        await this.loadTags();
      } catch (error) {
        console.error('Failed to toggle tag:', error);
      }
    },

    addTicketTier() {
      this.eventForm.ticketTiers.push(createEmptyTicketTier());
    },

    removeTicketTier(index) {
      this.eventForm.ticketTiers.splice(index, 1);
    },

    async toggleFeatured(event) {
      try {
        const { errors } = await client.models.Event.update({
          id: event.id,
          featured: !event.featured,
        });

        if (errors?.length) {
          console.error('Toggle featured errors:', errors);
          return;
        }

        await this.loadEvents();
      } catch (error) {
        console.error('Failed to toggle featured:', error);
      }
    },

    async submitWizard() {
      this.saving = true;

      try {
        const payload = {
          title: this.eventForm.title,
          shortDescription: this.eventForm.shortDescription,
          description: this.eventForm.longDescription,
          longDescription: this.eventForm.longDescription,
          categories: this.eventForm.categories,
          locationType: this.eventForm.locationType,
          tagIds: this.eventForm.tagIds,
          hostUserId: this.eventForm.hostUserId,
          host: this.eventForm.hostDisplayName,
          startAt: this.toIsoDateTime(this.eventForm.startAt),
          endAt: this.toIsoDateTime(this.eventForm.endAt),
          ctaLabel: this.eventForm.ctaLabel,
          ctaUrl: this.eventForm.ctaUrl,
          rewardText: this.eventForm.rewardText,
          featured: this.eventForm.featured,
          status: this.eventForm.status,
          ticketMode: this.eventForm.ticketMode,
          ticketTiers:
            this.eventForm.ticketMode === 'ticketed'
              ? this.eventForm.ticketTiers
              : [],
        };

        if (this.eventForm.id) {
          const { errors } = await client.models.Event.update({
            id: this.eventForm.id,
            ...payload,
          });

          if (errors?.length) {
            console.error('Update event errors:', errors);
            return;
          }
        } else {
          const { errors } = await client.models.Event.create(payload);

          if (errors?.length) {
            console.error('Create event errors:', errors);
            return;
          }
        }

        if (
          this.wizardMode === 'suggestion' &&
          this.selectedSuggestion &&
          client.models.EventSuggestion
        ) {
          const { errors } = await client.models.EventSuggestion.update({
            id: this.selectedSuggestion.id,
            status: 'approved',
          });

          if (errors?.length) {
            console.error('Approve suggestion errors:', errors);
          }
        }

        await Promise.all([this.loadEvents(), this.loadSuggestions()]);
        this.closeWizard();
      } catch (error) {
        console.error('Failed to submit event wizard:', error);
      } finally {
        this.saving = false;
      }
    },

    formatDateRange(startAt, endAt) {
      if (!startAt) return 'No date set';

      const start = new Date(startAt);
      const end = endAt ? new Date(endAt) : null;

      const startText = start.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      if (!end) return startText;

      const endText = end.toLocaleString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });

      return `${startText} - ${endText}`;
    },

    slugify(value) {
      return String(value || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    },

    toLocalDateTime(value) {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      const pad = (num) => String(num).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate(),
      )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    },

    toIsoDateTime(value) {
      if (!value) return null;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return null;
      return date.toISOString();
    },
  },
};