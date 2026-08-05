/* <!-- =========================================================
     2) SCRIPT – Logic, Amplify integration, state, methods
       2a) Imports and constants
       2b) Component data state
       2c) Computed properties
       2d) Lifecycle
       2e) Methods
========================================================= -->*/


import { generateClient } from 'aws-amplify/data';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import BotSidebar from '@/components/BotSidebar/BotSidebar.vue';

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
  name: 'TwitchCommands',
  components: {
    BotSidebar
  },

  /* ---------------------------------------------
   * 2.1 Component state (data)
   * ------------------------------------------- */
  data() {
    return {
      // Selection
      selectedCommandId: null,
      expandedCommandId: null,

      // Twitch connection
      streamerId: null,
      connection: null,

      // Commands
      commands: [],

      // UI state
      isLoading: false,
      isSaving: false,
      connectionError: '',
      commandError: '',
      activeTab: 'custom',
      searchQuery: '',
      showHelp: true,

      // Suggested/default command templates (base + editable copy)
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

  /* ---------------------------------------------
   * 2.2 Derived state (computed)
   * ------------------------------------------- */
  computed: {
    filteredCustomCommands() {
      const q = this.searchQuery.trim().toLowerCase();
      const customCommands = this.commands.filter(command => command.isCustom === true);
      if (!q) return customCommands;

      return customCommands.filter(command => {
        return (
          (command.name && command.name.toLowerCase().includes(q)) ||
          (command.reply && command.reply.toLowerCase().includes(q)) ||
          (command.category && command.category.toLowerCase().includes(q))
        );
      });
    },

    filteredSuggestedCommands() {
      const q = this.searchQuery.trim().toLowerCase();
      if (!q) return this.suggestedCommands;

      return this.suggestedCommands.filter(command => {
        return (
          (command.name && command.name.toLowerCase().includes(q)) ||
          (command.description && command.description.toLowerCase().includes(q)) ||
          (command.category && command.category.toLowerCase().includes(q))
        );
      });
    }
  },

  /* ---------------------------------------------
   * 2.3 Lifecycle
   * ------------------------------------------- */
  async mounted() {
    // Initialize suggested commands from base
    this.suggestedCommands = this.baseSuggestedCommands.map(item => ({ ...item }));
    // Initialize Twitch connection + load commands
    await this.initializeBroadcasterContext();
  },

  /* ---------------------------------------------
   * 2.4 Methods – behavior & data ops
   * ------------------------------------------- */
  methods: {
    /* UI helpers */
    switchTab(tab) {
      this.activeTab = tab;
      this.expandedCommandId = null;
    },

    toggleExpanded(id) {
      this.expandedCommandId = this.expandedCommandId === id ? null : id;
    },

    showCommandError(message, error) {
      const details = error?.message ||
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
        isEnabled: current.isEnabled
      });
    },

    /* Amplify / Twitch context */
    async initializeBroadcasterContext() {
      this.isLoading = true;
      this.connectionError = '';

      try {
        const user = await getCurrentUser();
        const session = await fetchAuthSession();

        const tokenSub = session?.tokens?.idToken?.payload?.sub || '';
        const amplifyUserId = user?.userId || '';
        const amplifyUsername = user?.username || '';

        const lookupUserIds = [tokenSub, amplifyUserId, amplifyUsername]
          .map((value) => String(value || '').trim())
          .filter((value, index, list) => value && list.indexOf(value) === index);

        if (!lookupUserIds.length) {
          throw new Error('No authenticated user found');
        }

        let connection = null;

        for (const userId of lookupUserIds) {
          const response = await fetch(
            `${TWITCH_API_BASE}/api/twitch/connection-by-user?userId=${encodeURIComponent(userId)}&t=${Date.now()}`,
            {
              cache: 'no-store'
            }
          );

          if (!response.ok) {
            continue;
          }

          const data = await response.json();
          const candidate = data?.connection || null;

          if (candidate) {
            connection = candidate;
            break;
          }
        }

        if (!connection?.broadcasterUserId) {
          throw new Error('No connected Twitch broadcaster found for this account');
        }

        this.connection = connection;
        this.streamerId = String(connection.broadcasterUserId);

        await this.loadCommands();
      } catch (error) {
        console.error('Failed to initialize broadcaster context:', error);
        this.connectionError = error.message || 'Failed to load Twitch connection';
      } finally {
        this.isLoading = false;
      }
    },

    async loadCommands() {
      if (!this.streamerId) return;

      this.isLoading = true;

      try {
        const response = await client.models.TwitchCommand.list({
          filter: {
            streamerId: {
              eq: this.streamerId
            }
          }
        });

        this.commands = (response.data || []).filter(Boolean).map(command => ({
          ...command,
          category: command.category || 'Custom',
          permissionLevel: command.permissionLevel || 'everyone'
        }));

        // Seed default hello if none exist
        if (this.commands.length === 0) {
          const starter = await client.models.TwitchCommand.create({
            streamerId: this.streamerId,
            name: 'hello',
            reply: 'Hey $(user), welcome in!',
            enabled: true,
            cooldownSeconds: 10,
            isCustom: true,
            category: 'Info',
            permissionLevel: 'everyone'
          });

          if (starter.data) {
            this.commands = [
              {
                ...starter.data,
                category: starter.data.category || 'Info',
                permissionLevel: starter.data.permissionLevel || 'everyone'
              }
            ];
          }
        }

        this.syncSuggestedStates();
      } catch (error) {
        console.error('Failed to load Twitch commands:', error);
      } finally {
        this.isLoading = false;
      }
    },

        syncSuggestedStates() {
        this.suggestedCommands = this.suggestedCommands.map(suggested => {
          const existing = this.commands.find(command => {
            return String(command.name || '').trim().toLowerCase() === String(suggested.name || '').trim().toLowerCase();
          });

          return {
            ...suggested,
            isEnabled: existing ? existing.enabled === true : false,
            savedCommandId: existing ? existing.id : null
          };
        });
      },

    /* Command operations – create / update / delete */
    async addNewCommand() {
      if (!this.streamerId) {
        this.showCommandError('Cannot create command', 'Missing streamerId');
        return;
      }

      try {
        const response = await client.models.TwitchCommand.create({
          streamerId: this.streamerId,
          name: 'new-command',
          reply: 'Edit this response',
          enabled: true,
          cooldownSeconds: 10,
          isCustom: true,
          category: 'Custom',
          permissionLevel: 'everyone'
        });

        if (response?.errors?.length) {
          this.showCommandError('Failed to create command', response.errors);
          return;
        }

        if (!response?.data) {
          this.showCommandError('Failed to create command', 'No data returned');
          return;
        }

        const created = {
          ...response.data,
          category: response.data.category || 'Custom',
          permissionLevel: response.data.permissionLevel || 'everyone'
        };

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
        const response = await client.models.TwitchCommand.update({
          id: command.id,
          streamerId: this.streamerId,
          name: command.name,
          reply: command.reply,
          enabled: command.enabled,
          cooldownSeconds: command.cooldownSeconds,
          isCustom: command.isCustom,
          category: command.category || 'Custom',
          permissionLevel: command.permissionLevel || 'everyone'
        });

        if (response?.errors?.length) {
          this.showCommandError('Failed to save command', response.errors);
          return;
        }

        if (!response?.data) {
          this.showCommandError('Failed to save command', 'No data returned');
          return;
        }

        const index = this.commands.findIndex(item => item.id === response.data.id);

        if (index !== -1) {
          this.commands.splice(index, 1, {
            ...response.data,
            category: response.data.category || 'Custom',
            permissionLevel: response.data.permissionLevel || 'everyone'
          });
        }

        this.syncSuggestedStates();
      } catch (error) {
        this.showCommandError('Failed to save command', error);
      } finally {
        this.isSaving = false;
      }
    },

    async toggleCommandEnabled(command) {
      command.enabled = !command.enabled;
      await this.saveCommand(command);
    },

    async removeCommand(command) {
      if (!command) return;

      try {
        await client.models.TwitchCommand.delete({
          id: command.id
        });

        this.commands = this.commands.filter(item => item.id !== command.id);

        if (this.expandedCommandId === command.id) {
          this.expandedCommandId = null;
        }

        this.syncSuggestedStates();
      } catch (error) {
        console.error('Failed to delete command:', error);
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

          const response = await client.models.TwitchCommand.update({
            id: existing.id,
            streamerId: this.streamerId,
            name: suggested.name,
            reply: suggested.reply,
            enabled: nextEnabled,
            cooldownSeconds: suggested.cooldownSeconds,
            isCustom: existing.isCustom ?? false,
            category: suggested.category || 'Custom',
            permissionLevel: suggested.permissionLevel || 'everyone'
          });

          if (response?.errors?.length) {
            this.showCommandError('Failed to update suggested command', response.errors);
            return;
          }

          if (!response?.data) {
            this.showCommandError('Failed to update suggested command', 'No data returned');
            return;
          }

          const index = this.commands.findIndex(item => item.id === response.data.id);

          if (index !== -1) {
            this.commands.splice(index, 1, {
              ...response.data,
              category: response.data.category || suggested.category || 'Suggested',
              permissionLevel:
                response.data.permissionLevel || suggested.permissionLevel || 'everyone'
            });
          }
        } else {
          const response = await client.models.TwitchCommand.create({
            streamerId: this.streamerId,
            name: suggested.name,
            reply: suggested.reply,
            enabled: true,
            cooldownSeconds: suggested.cooldownSeconds,
            isCustom: false,
            category: suggested.category || 'Custom',
            permissionLevel: suggested.permissionLevel || 'everyone'
          });

          if (response?.errors?.length) {
            this.showCommandError('Failed to create suggested command', response.errors);
            return;
          }

          if (!response?.data) {
            this.showCommandError('Failed to create suggested command', 'No data returned');
            return;
          }

          this.commands.unshift({
            ...response.data,
            category: response.data.category || suggested.category || 'Suggested',
            permissionLevel:
              response.data.permissionLevel || suggested.permissionLevel || 'everyone'
          });
        }

        this.syncSuggestedStates();
      } catch (error) {
        this.showCommandError('Failed to toggle suggested command', error);
      }
    }
  }
};