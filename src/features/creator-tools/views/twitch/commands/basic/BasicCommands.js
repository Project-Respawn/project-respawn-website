import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import BotSidebar from '@/components/BotSidebar/BotSidebar.vue';
import { refreshAccessContext } from '@/composables/useAccessContext.js';
import { filterTwitchCommandsForBrand, getTwitchCommandCapabilities } from './BasicCommands.access.js';

let generatedClient = null;
const client = new Proxy({}, {
  get(_, prop) {
    if (!generatedClient) {
      generatedClient = generateClient();
    }
    return generatedClient[prop];
  }
});

const TWITCH_API_BASE = 'http://localhost:3000';

export default {
  name: 'BasicCommands',
  components: {
    BotSidebar
  },

  data() {
    return {
      selectedCommandId: null,
      expandedCommandId: null,
      streamerId: null,
      connection: null,
      hasBroadcasterContext: false,
      integrationId: null,
      secureFoundationEnabled: import.meta.env.VITE_TWITCH_SECURE_INTEGRATION === 'true',
      commands: [],
      accessContext: { groups: [], brands: [] },
      selectedBrandId: '',
      accessLoading: false,
      isLoading: false,
      isSaving: false,
      connectionError: '',
      commandError: '',
      activeTab: 'custom',
      searchQuery: '',
      showHelp: true,
      baseSuggestedCommands: [
        {
          key: 'discord',
          name: 'discord',
          description: 'Share your Discord community link.',
          reply: 'Join our Discord at https://discord.gg/yourlink',
          cooldownSeconds: 10,
          category: 'Community',
          permissionLevel: 'everyone',
          isCustom: false,
          isEnabled: false
        },
        {
          key: 'lurk',
          name: 'lurk',
          description: 'Let viewers announce they are lurking.',
          reply: 'Thanks for lurking, $(user) — good luck with your side quest.',
          cooldownSeconds: 5,
          category: 'Community',
          permissionLevel: 'everyone',
          isCustom: false,
          isEnabled: false
        },
        {
          key: 'so',
          name: 'so',
          description: 'Shout out another streamer.',
          reply: 'Go check out $(touser) over at https://twitch.tv/$(touser)',
          cooldownSeconds: 15,
          category: 'Mod',
          permissionLevel: 'mod',
          isCustom: false,
          isEnabled: false
        },
        {
          key: 'commands',
          name: 'commands',
          description: 'Show viewers where to find command help.',
          reply: 'You can find our commands and info here: https://your-site-link-here',
          cooldownSeconds: 10,
          category: 'Info',
          permissionLevel: 'everyone',
          isCustom: false,
          isEnabled: false
        }
      ],
      suggestedCommands: []
    };
  },

  computed: {
    commandCapabilities() {
      return getTwitchCommandCapabilities(this.accessContext, this.selectedBrandId);
    },

    isPlatformOperator() {
      return this.commandCapabilities.isPlatformOperator;
    },

    accessibleBrandOptions() {
      return this.accessContext.brands || [];
    },

    canManageSelectedBrandCommands() {
      return this.commandCapabilities.canManageSelectedBrandCommands;
    },

    filteredCustomCommands() {
      const q = this.searchQuery.trim().toLowerCase();
      const customCommands = this.commands.filter(command => command.isCustom === true);
      if (!q) return customCommands;

      return customCommands.filter(command =>
        (command.name && command.name.toLowerCase().includes(q)) ||
        (command.reply && command.reply.toLowerCase().includes(q)) ||
        (command.category && command.category.toLowerCase().includes(q))
      );
    },

    filteredSuggestedCommands() {
      const q = this.searchQuery.trim().toLowerCase();
      if (!q) return this.suggestedCommands;

      return this.suggestedCommands.filter(command =>
        (command.name && command.name.toLowerCase().includes(q)) ||
        (command.description && command.description.toLowerCase().includes(q)) ||
        (command.category && command.category.toLowerCase().includes(q))
      );
    }
  },

  async mounted() {
    this.suggestedCommands = this.baseSuggestedCommands.map(item => ({ ...item }));
    await this.loadAccessContext();
    await this.initializeBroadcasterContext();
  },

  methods: {
    async loadAccessContext() {
      this.accessLoading = true;
      try {
        const context = await refreshAccessContext();
        this.accessContext = context;
        this.selectedBrandId = context.brands?.some((brand) => brand.brandId === this.selectedBrandId)
          ? this.selectedBrandId
          : context.brands?.[0]?.brandId || '';
      } catch (error) {
        this.accessContext = { groups: [], brands: [] };
        this.selectedBrandId = '';
        this.showCommandError('Failed to load Brand access', error);
      } finally {
        this.accessLoading = false;
      }
    },

    async selectBrandContext() {
      this.commandError = '';
      await this.loadCommands();
    },

    assertCanManageCommands() {
      if (!this.selectedBrandId) throw new Error('Select a Brand before managing Twitch commands.');
      if (!this.canManageSelectedBrandCommands) throw new Error('You do not have permission to manage Twitch commands for the selected Brand.');
    },

    canManageCommand(command) {
      return this.canManageSelectedBrandCommands && !command?.isUnscoped && command?.brandId === this.selectedBrandId;
    },

    async createManagedCommand(payload) {
      this.assertCanManageCommands();
      const response = await client.mutations.createManagedTwitchCommand({ ...payload, brandId: this.selectedBrandId });
      if (response?.errors?.length) throw new Error(response.errors[0].message || 'Failed to create command.');
      if (!response?.data) throw new Error('No data returned while creating command.');
      return { id: response.data.commandId, ...payload, brandId: this.selectedBrandId };
    },

    async updateManagedCommand(command, payload) {
      this.assertCanManageCommands();
      if (!command?.id || command.brandId !== this.selectedBrandId) throw new Error('Command is outside the selected Brand context.');
      const response = await client.mutations.updateManagedTwitchCommand({ commandId: command.id, brandId: this.selectedBrandId, ...payload });
      if (response?.errors?.length) throw new Error(response.errors[0].message || 'Failed to update command.');
      if (!response?.data) throw new Error('No data returned while updating command.');
      return { ...command, ...payload, brandId: this.selectedBrandId };
    },

    async deleteManagedCommand(command) {
      this.assertCanManageCommands();
      if (!command?.id || command.brandId !== this.selectedBrandId) throw new Error('Command is outside the selected Brand context.');
      const response = await client.mutations.deleteManagedTwitchCommand({ commandId: command.id, brandId: this.selectedBrandId });
      if (response?.errors?.length) throw new Error(response.errors[0].message || 'Failed to delete command.');
      return response.data;
    },
    switchTab(tab) {
      this.activeTab = tab;
      this.expandedCommandId = null;
    },

    toggleExpanded(id) {
      this.expandedCommandId = this.expandedCommandId === id ? null : id;
    },

    showCommandError(message, error) {
      const details =
        error?.message ||
        (Array.isArray(error)
          ? error.map(err => err?.message || String(err)).join('; ')
          : String(error || ''));

      const fullMessage = `${message}${details ? `: ${details}` : ''}`;
      console.error(fullMessage, error);
      this.commandError = fullMessage;
      alert(fullMessage);
    },

    resetSuggestedCommand(key) {
      const original = this.baseSuggestedCommands.find(item => item.key === key);
      const current = this.suggestedCommands.find(item => item.key === key);
      const index = this.suggestedCommands.findIndex(item => item.key === key);

      if (!original || !current || index === -1) return;

      this.suggestedCommands.splice(index, 1, {
        ...original,
        isEnabled: current.isEnabled,
        savedCommandId: current.savedCommandId || null
      });
    },

    async initializeBroadcasterContext() {
      this.isLoading = true;
      this.connectionError = '';
      this.hasBroadcasterContext = false;
      this.connection = null;
      this.streamerId = null;

      try {
        if (this.secureFoundationEnabled) {
          if (!this.selectedBrandId) throw new Error('No accessible Brand selected');
          const result = await client.queries.getMyTwitchIntegration({ brandId: this.selectedBrandId });
          if (result?.errors?.length) throw new Error(result.errors[0].message || 'Integration lookup failed');
          const integration = result?.data?.integration || null;
          if (!integration?.twitchBroadcasterId) throw new Error('No connected Twitch integration exists for the selected Brand');
          this.integrationId = integration.id;
          this.connection = integration;
          this.streamerId = String(integration.twitchBroadcasterId);
          this.hasBroadcasterContext = integration.connectionStatus === 'CONNECTED';
          await this.loadCommands();
          return;
        }
        const user = await getCurrentUser();
        const amplifyUserId = user?.userId || '';
        const amplifyUsername = user?.username || '';

        const lookupUserIds = [this.accessContext.userId, amplifyUserId, amplifyUsername]
          .map(value => String(value || '').trim())
          .filter((value, index, list) => value && list.indexOf(value) === index);

        if (!lookupUserIds.length) {
          this.connectionError = 'No authenticated user found';
          this.loadSuggestedCommandsWithoutBroadcaster();
          await this.loadCommands();
          return;
        }

        let connection = null;

        for (const userId of lookupUserIds) {
          const response = await fetch(
            `${TWITCH_API_BASE}/api/twitch/connection-by-user?userId=${encodeURIComponent(userId)}&t=${Date.now()}`,
            { cache: 'no-store' }
          );

          if (!response.ok) continue;

          const data = await response.json();
          const candidate = data?.connection || null;

          if (candidate) {
            connection = candidate;
            break;
          }
        }

        if (!connection?.broadcasterUserId) {
          this.connectionError = 'No connected Twitch broadcaster found for this account';
          this.loadSuggestedCommandsWithoutBroadcaster();
          await this.loadCommands();
          return;
        }

        this.connection = connection;
        this.streamerId = String(connection.broadcasterUserId);
        this.hasBroadcasterContext = true;

        await this.loadCommands();
      } catch (error) {
        console.error('Failed to initialize broadcaster context:', error);
        this.connectionError = error?.message || 'Failed to load Twitch connection';
        this.loadSuggestedCommandsWithoutBroadcaster();
        await this.loadCommands();
      } finally {
        this.isLoading = false;
      }
    },

    loadSuggestedCommandsWithoutBroadcaster() {
      this.commands = [];
      this.suggestedCommands = this.baseSuggestedCommands.map(item => ({
        ...item,
        isEnabled: false,
        savedCommandId: null
      }));
    },

    async loadCommands() {
      if (!this.selectedBrandId) {
        this.loadSuggestedCommandsWithoutBroadcaster();
        return;
      }

      this.isLoading = true;

      try {
        const response = await client.queries.listManagedTwitchCommands({
          brandId: this.selectedBrandId,
          includeUnscoped: this.isPlatformOperator,
        });
        if (response?.errors?.length) throw new Error(response.errors[0].message || 'Failed to load Twitch commands.');

        this.commands = filterTwitchCommandsForBrand(
          (response.data || []).filter(Boolean),
          this.commandCapabilities,
          this.selectedBrandId
        )
          .map(command => ({
            ...command,
            category: command.category || 'Custom',
            permissionLevel: command.permissionLevel || 'everyone'
          }));

        if (this.commands.length === 0 && this.streamerId && this.canManageSelectedBrandCommands) {
          const starter = await this.createManagedCommand({
            streamerId: this.streamerId,
            name: 'hello',
            reply: 'Hey $(user), welcome in!',
            enabled: true,
            cooldownSeconds: 10,
            isCustom: true,
            category: 'Info',
            permissionLevel: 'everyone'
          });

          if (starter) {
            this.commands = [
              {
                ...starter,
                category: starter.category || 'Info',
                permissionLevel: starter.permissionLevel || 'everyone'
              }
            ];
          }
        }

        this.syncSuggestedStates();
      } catch (error) {
        this.showCommandError('Failed to load Twitch commands', error);
      } finally {
        this.isLoading = false;
      }
    },

    syncSuggestedStates() {
      this.suggestedCommands = this.baseSuggestedCommands.map(base => {
        const existing =
          this.commands.find(command => command.id === base.savedCommandId) ||
          this.commands.find(command =>
            String(command.name || '').trim().toLowerCase() === String(base.name || '').trim().toLowerCase()
          );

        return {
          ...base,
          isEnabled: existing ? existing.enabled === true : false,
          savedCommandId: existing ? existing.id : null
        };
      });
    },

    async addNewCommand() {
      if (!this.streamerId) {
        this.showCommandError('Cannot create command', 'Missing streamerId');
        return;
      }

      try {
        const created = await this.createManagedCommand({
          streamerId: this.streamerId,
          name: 'new-command',
          reply: 'Edit this response',
          enabled: true,
          cooldownSeconds: 10,
          isCustom: true,
          category: 'Custom',
          permissionLevel: 'everyone'
        });

        created.category = created.category || 'Custom';
        created.permissionLevel = created.permissionLevel || 'everyone';

        this.commands.unshift(created);
        this.activeTab = 'custom';
        this.expandedCommandId = created.id;
      } catch (error) {
        this.showCommandError('Failed to create command', error);
      }
    },

    async saveCommand(command) {
      if (!command || !this.streamerId) {
        this.showCommandError('Cannot save command', 'Missing command or streamerId');
        return;
      }

      this.isSaving = true;

      try {
        const saved = await this.updateManagedCommand(command, {
          streamerId: command.streamerId,
          name: command.name,
          reply: command.reply,
          enabled: command.enabled,
          cooldownSeconds: command.cooldownSeconds,
          isCustom: command.isCustom,
          category: command.category || 'Custom',
          permissionLevel: command.permissionLevel || 'everyone'
        });

        const index = this.commands.findIndex(item => item.id === saved.id);

        if (index !== -1) {
          this.commands.splice(index, 1, {
            ...saved,
            category: saved.category || 'Custom',
            permissionLevel: saved.permissionLevel || 'everyone'
          });
        }

        this.syncSuggestedStates();
      } catch (error) {
        this.showCommandError('Failed to save command', error);
      } finally {
        this.isSaving = false;
      }
    },

    async saveSuggestedCommand(suggested) {
      if (!suggested || !this.streamerId) {
        this.showCommandError('Cannot save suggested command', 'Missing suggested command or streamerId');
        return;
      }

      const existing = this.commands.find(command => {
        return String(command.name || '').trim().toLowerCase() === String(suggested.name || '').trim().toLowerCase();
      });

      try {
        if (existing) {
          const saved = await this.updateManagedCommand(existing, {
            streamerId: existing.streamerId,
            name: suggested.name,
            reply: suggested.reply,
            enabled: existing.enabled,
            cooldownSeconds: suggested.cooldownSeconds,
            isCustom: existing.isCustom ?? false,
            category: suggested.category || 'Custom',
            permissionLevel: suggested.permissionLevel || 'everyone'
          });

          const index = this.commands.findIndex(item => item.id === saved.id);

          if (index !== -1) {
            this.commands.splice(index, 1, {
              ...saved,
              category: saved.category || suggested.category || 'Suggested',
              permissionLevel: saved.permissionLevel || suggested.permissionLevel || 'everyone'
            });
          }
        } else {
          const created = await this.createManagedCommand({
            streamerId: this.streamerId,
            name: suggested.name,
            reply: suggested.reply,
            enabled: false,
            cooldownSeconds: suggested.cooldownSeconds,
            isCustom: false,
            category: suggested.category || 'Custom',
            permissionLevel: suggested.permissionLevel || 'everyone'
          });

          this.commands.unshift({
            ...created,
            category: created.category || suggested.category || 'Suggested',
            permissionLevel: created.permissionLevel || suggested.permissionLevel || 'everyone'
          });
        }

        this.syncSuggestedStates();
      } catch (error) {
        this.showCommandError('Failed to save suggested command', error);
      }
    },

    async toggleCommandEnabled(command) {
      if (!command) return;
      command.enabled = !command.enabled;
      await this.saveCommand(command);
    },

    async removeCommand(command) {
      if (!command) return;

      try {
        await this.deleteManagedCommand(command);
        this.commands = this.commands.filter(item => item.id !== command.id);

        if (this.expandedCommandId === command.id) {
          this.expandedCommandId = null;
        }

        this.syncSuggestedStates();
      } catch (error) {
        this.showCommandError('Failed to delete command', error);
      }
    },

    async toggleSuggestedCommand(suggested) {
      if (!suggested || !this.streamerId) {
        this.showCommandError('Cannot toggle suggested command', 'Missing suggested command or streamerId');
        return;
      }

      try {
        const existing = this.commands.find(command => {
          return String(command.name || '').trim().toLowerCase() === String(suggested.name || '').trim().toLowerCase();
        });

        if (existing) {
          const nextEnabled = !existing.enabled;

          const saved = await this.updateManagedCommand(existing, {
            streamerId: existing.streamerId,
            name: suggested.name,
            reply: suggested.reply,
            enabled: nextEnabled,
            cooldownSeconds: suggested.cooldownSeconds,
            isCustom: existing.isCustom ?? false,
            category: suggested.category || 'Custom',
            permissionLevel: suggested.permissionLevel || 'everyone'
          });

          const index = this.commands.findIndex(item => item.id === saved.id);

          if (index !== -1) {
            this.commands.splice(index, 1, {
              ...saved,
              enabled: nextEnabled,
              category: saved.category || suggested.category || 'Suggested',
              permissionLevel: saved.permissionLevel || suggested.permissionLevel || 'everyone'
            });
          }

          suggested.isEnabled = nextEnabled;
          suggested.savedCommandId = saved.id;
        } else {
          const created = await this.createManagedCommand({
            streamerId: this.streamerId,
            name: suggested.name,
            reply: suggested.reply,
            enabled: true,
            cooldownSeconds: suggested.cooldownSeconds,
            isCustom: false,
            category: suggested.category || 'Custom',
            permissionLevel: suggested.permissionLevel || 'everyone'
          });

          this.commands.unshift({
            ...created,
            enabled: true,
            category: created.category || suggested.category || 'Suggested',
            permissionLevel: created.permissionLevel || suggested.permissionLevel || 'everyone'
          });

          suggested.isEnabled = true;
          suggested.savedCommandId = created.id;
        }

        this.syncSuggestedStates();
      } catch (error) {
        this.showCommandError('Failed to toggle suggested command', error);
      }
    }
  }
};
