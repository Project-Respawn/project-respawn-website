import BotSidebar from '@/components/BotSidebar/BotSidebar.vue';
import { refreshAccessContext } from '@/composables/useAccessContext.js';
import { getTwitchOverlayConfig, updateTwitchOverlayConfig } from '@/features/creator-tools/services/overlaySource.js';

const DEFAULT_RULES = [
  {
    id: 1,
    label: 'example spam phrase',
    category: 'Spam',
    scope: 'both',
    action: 'warn',
    enabled: true
  },
  {
    id: 2,
    label: 'abusive word',
    category: 'Harassment',
    scope: 'both',
    action: 'delete',
    enabled: true
  },
  {
    id: 3,
    label: 'self-promo link',
    category: 'Links',
    scope: 'twitch',
    action: 'review',
    enabled: true
  },
  {
    id: 4,
    label: 'discord invite spam',
    category: 'Links',
    scope: 'discord',
    action: 'delete',
    enabled: true
  },
  {
    id: 5,
    label: 'hate phrase variant',
    category: 'Language',
    scope: 'both',
    action: 'timeout',
    enabled: false
  }
];

export default {
  name: 'TwitchModeration',
  components: {
    BotSidebar
  },
  data() {
    return {
      toastMessage: '',
      workspaceId: '', brandId: '', canonicalConfig: null,
      toastTimer: null,
      moderationEnabled: true,
      activeFilter: 'all',
      newRuleLabel: '',
      newRuleCategory: 'Spam',
      newRuleAction: 'warn',
      newRuleScope: 'both',
      selectedAction: 'warn',
      cooldownSeconds: 30,
      warningMessage: 'Please keep chat respectful and follow the stream rules.',
      verifiedBans: [
        {
          id: 1,
          name: 'ShadowRaid99',
          reason: 'Harassment and repeated targeted abuse',
          status: 'Verified'
        },
        {
          id: 2,
          name: 'SpamForgeTV',
          reason: 'Repeated spam links across community channels',
          status: 'Verified'
        },
        {
          id: 3,
          name: 'FakeGiveawayLive',
          reason: 'Misleading promotion and scam-style behaviour',
          status: 'Reviewed'
        },
        {
          id: 4,
          name: 'RaidBaitCentral',
          reason: 'Organised spam raids and repeated bad-faith disruption',
          status: 'Verified'
        }
      ],
      moderationRules: DEFAULT_RULES.map((rule) => ({ ...rule })),
      ruleFilters: [
        { key: 'all', label: 'All rules' },
        { key: 'both', label: 'Both bots' },
        { key: 'twitch', label: 'Twitch only' },
        { key: 'discord', label: 'Discord only' },
        { key: 'active', label: 'Active' },
        { key: 'paused', label: 'Paused' }
      ],
      moderationToggles: [
        {
          key: 'general',
          badge: 'Core',
          title: 'Enable moderation tools',
          description: 'Turn Project Respawn moderation tools on or off for this community.',
          enabled: true
        },
        {
          key: 'links',
          badge: 'Filter',
          title: 'Block suspicious links',
          description: 'Catch suspicious or unwanted links before they clutter Twitch or Discord.',
          enabled: true
        },
        {
          key: 'spam',
          badge: 'Filter',
          title: 'Reduce spam messages',
          description: 'Detect repeated phrases, overposting, and obvious spam patterns.',
          enabled: true
        },
        {
          key: 'warnings',
          badge: 'Actions',
          title: 'Send warning messages',
          description: 'Automatically send a warning when a moderation rule is triggered.',
          enabled: true
        }
      ],
      moderationActions: [
        {
          key: 'warn',
          badge: 'Default',
          title: 'Warn user',
          description: 'Post a warning message without escalating immediately.'
        },
        {
          key: 'delete',
          badge: 'Action',
          title: 'Delete message',
          description: 'Remove the offending message and keep the space cleaner automatically.'
        },
        {
          key: 'timeout',
          badge: 'Action',
          title: 'Temporary timeout',
          description: 'Apply a temporary timeout when a rule reaches a stronger threshold.'
        },
        {
          key: 'review',
          badge: 'Review',
          title: 'Flag for review',
          description: 'Send the event for manual review instead of taking direct action.'
        }
      ]
    };
  },
  async mounted() {
    const access = await refreshAccessContext(); const requestedBrandId = String(this.$route?.query?.brandId || ''); const brand = access.brands?.find(item => item.brandId === requestedBrandId) || access.brands?.[0], workspace = access.workspaces?.[0];
    this.brandId = brand?.brandId || ''; this.workspaceId = brand?.workspaceId || workspace?.workspaceId || workspace?.id || '';
    if (!this.brandId || !this.workspaceId) return;
    const result = await getTwitchOverlayConfig(this.workspaceId, this.brandId); this.canonicalConfig = result.config;
    const terms = result.config?.chat?.blockedTerms || []; if (terms.length) this.moderationRules = terms.map((label, index) => ({ id: index + 1, label, category: 'Language', scope: 'twitch', action: 'delete', enabled: true }));
    this.moderationEnabled = result.config?.chat?.enabled !== false;
  },
  computed: {
    filteredRules() {
      switch (this.activeFilter) {
        case 'both':
          return this.moderationRules.filter((rule) => rule.scope === 'both');
        case 'twitch':
          return this.moderationRules.filter((rule) => rule.scope === 'twitch');
        case 'discord':
          return this.moderationRules.filter((rule) => rule.scope === 'discord');
        case 'active':
          return this.moderationRules.filter((rule) => rule.enabled);
        case 'paused':
          return this.moderationRules.filter((rule) => !rule.enabled);
        default:
          return this.moderationRules;
      }
    },
    activeRulesCount() {
      return this.moderationRules.filter((rule) => rule.enabled).length;
    },
    activeFilterLabel() {
      return (
        this.ruleFilters.find((filter) => filter.key === this.activeFilter)?.label ||
        'All rules'
      );
    },
    selectedActionLabel() {
      return (
        this.moderationActions.find((action) => action.key === this.selectedAction)?.title ||
        'None selected'
      );
    }
  },
  methods: {
    showToast(message) {
      this.toastMessage = message;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.toastMessage = '';
      }, 2500);
    },
    scopeLabel(scope) {
      if (scope === 'both') return 'Both bots';
      if (scope === 'twitch') return 'Twitch only';
      if (scope === 'discord') return 'Discord only';
      return 'Custom';
    },
    scopeClass(scope) {
      return {
        both: scope === 'both',
        twitch: scope === 'twitch',
        discord: scope === 'discord'
      };
    },
    actionLabel(action) {
      const match = this.moderationActions.find((item) => item.key === action);
      return match ? match.title : action;
    },
    handleToggleChange(key) {
      if (key === 'general') {
        const generalToggle = this.moderationToggles.find((toggle) => toggle.key === 'general');
        this.moderationEnabled = !!generalToggle?.enabled;
      }

      this.showToast('Moderation setting updated');
    },
    addRule() {
      const trimmed = this.newRuleLabel.trim();

      if (!trimmed) {
        this.showToast('Enter a word or phrase first');
        return;
      }

      this.moderationRules.unshift({
        id: Date.now(),
        label: trimmed,
        category: this.newRuleCategory,
        scope: this.newRuleScope,
        action: this.newRuleAction,
        enabled: true
      });

      this.newRuleLabel = '';
      this.newRuleCategory = 'Spam';
      this.newRuleAction = 'warn';
      this.newRuleScope = 'both';
      this.showToast('Moderation rule added');
    },
    removeRule(id) {
      this.moderationRules = this.moderationRules.filter((rule) => rule.id !== id);
      this.showToast('Moderation rule removed');
    },
    async saveSettings() {
      if (this.canonicalConfig && this.workspaceId && this.brandId) {
        const blockedTerms = this.moderationRules.filter(rule => rule.enabled && (rule.scope === 'twitch' || rule.scope === 'both')).map(rule => rule.label);
        const result = await updateTwitchOverlayConfig(this.workspaceId, this.brandId, { ...this.canonicalConfig, chat: { ...this.canonicalConfig.chat, enabled: this.moderationEnabled, blockedTerms } }); this.canonicalConfig = result.config;
      }
      this.showToast('Moderation settings saved');
    },
    resetSettings() {
      this.moderationEnabled = true;
      this.activeFilter = 'all';
      this.newRuleLabel = '';
      this.newRuleCategory = 'Spam';
      this.newRuleAction = 'warn';
      this.newRuleScope = 'both';
      this.selectedAction = 'warn';
      this.cooldownSeconds = 30;
      this.warningMessage = 'Please keep chat respectful and follow the stream rules.';
      this.moderationRules = DEFAULT_RULES.map((rule) => ({ ...rule }));
      this.moderationToggles = this.moderationToggles.map((toggle) => ({
        ...toggle,
        enabled: true
      }));
      this.showToast('Moderation settings reset');
    }
  },
  beforeUnmount() {
    clearTimeout(this.toastTimer);
  }
};
