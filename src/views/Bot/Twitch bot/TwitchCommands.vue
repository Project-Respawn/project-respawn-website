<!-- =========================================================
  TwitchCommands.vue
  Project Respawn – Twitch Command Manager

  Section map:
    1) Template
      1a) Page shell
        1a1) Sidebar
        1a2) Main content
      1b) Page header
      1c) Command builder help
      1d) Tab bar
      1e) Command table
        1e1) Table header
        1e2) Custom commands content
        1e3) Suggested commands content
    2) Script
      2a) Imports and constants
      2b) Component data state
      2c) Computed properties
      2d) Lifecycle hook
      2e) Methods
        2e1) UI helpers
        2e2) Twitch connection and command loading
        2e3) Command create/update/delete logic
    3) Styles
      3a) Layout and shell
      3b) Sidebar styles
      3c) Header and action styles
      3d) Panel and help styles
      3e) Tabs styles
      3f) Command table styles
      3g) Toggle and responsive styles
========================================================= -->

<template>
  <!-- =====================================================
       1. PAGE SHELL
       - Sidebar + Main content layout
  ====================================================== -->
  <div class="bot-page">
    <!-- ========================
         1.1 Sidebar
    ========================= -->
    <aside class="bot-sidebar">
      <!-- Brand -->
      <div class="brand-block">
        <div class="brand-icon">R</div>
        <div>
          <p class="brand-kicker">Project Respawn</p>
          <h1 class="brand-title">Twitch Dashboard</h1>
        </div>
      </div>

      <!-- Sidebar navigation -->
      <nav class="sidebar-nav">
        <!-- Main nav -->
        <router-link to="/bot" class="nav-item" exact-active-class="active">
          <span class="nav-dot"></span>
          Overview
        </router-link>

        <!-- Twitch section -->
        <div class="nav-section">
          <div class="nav-section-label">Twitch</div>

          <router-link
            to="/bot/twitch/commands"
            class="sub-nav-item"
            exact-active-class="active"
          >
            <span class="nav-dot"></span>
            Commands
          </router-link>
        </div>

        <!-- Other sections -->
        <router-link to="/bot/discord" class="nav-item" exact-active-class="active">
          <span class="nav-dot"></span>
          Discord
        </router-link>

        <router-link to="/bot/automation" class="nav-item" exact-active-class="active">
          <span class="nav-dot"></span>
          Automation
        </router-link>

        <router-link to="/bot/settings" class="nav-item" exact-active-class="active">
          <span class="nav-dot"></span>
          Settings
        </router-link>
      </nav>

      <!-- Sidebar footer / status -->
      <div class="sidebar-footer">
        <div class="status-pill online">Commands</div>
        <p class="sidebar-note">
          Manage Twitch bot commands from a simpler workspace.
        </p>
      </div>
    </aside>

    <!-- ========================
         1.2 Main content
    ========================= -->
    <main class="bot-main">
      <!-- =================================================
           2. PAGE HEADER
           - Title + search + primary actions
      ================================================== -->
      <section class="top-bar">
        <div>
          <p class="eyebrow">Chat commands</p>
          <h2>Build custom and suggested commands for your community</h2>
          <p class="page-subtitle">
            Create your own commands, enable suggested ones, and expand rows to edit settings inline.
          </p>
        </div>

        <div class="top-actions">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search commands..."
          />
          <button class="secondary-btn" @click="showHelp = !showHelp">
            {{ showHelp ? 'Hide Help' : 'Show Help' }}
          </button>
          <button class="primary-btn" @click="addNewCommand">
            Add Custom Command
          </button>
        </div>
      </section>

      <section v-if="commandError" class="error-banner panel-card">
        <div class="panel-header compact">
          <div>
            <p class="section-kicker">Error</p>
            <h3>An operation failed</h3>
          </div>
        </div>
        <p class="error-message">{{ commandError }}</p>
      </section>

      <!-- =================================================
           3. COMMAND BUILDER HELP
           - Variables & examples
      ================================================== -->
      <section v-if="showHelp" class="variables-panel panel-card">
        <div class="panel-header compact">
          <div>
            <p class="section-kicker">Command builder help</p>
            <h3>Variables and examples</h3>
          </div>
        </div>

        <div class="variables-grid">
          <div class="variable-chip">
            <code>$(user)</code>
            <span>User who triggered the command</span>
          </div>
          <div class="variable-chip">
            <code>$(touser)</code>
            <span>First tagged or mentioned user</span>
          </div>
          <div class="variable-chip">
            <code>$(channel)</code>
            <span>Current channel name</span>
          </div>
          <div class="variable-chip">
            <code>$(command)</code>
            <span>The command being run</span>
          </div>
          <div class="variable-chip">
            <code>$(args)</code>
            <span>Everything after the command</span>
          </div>
          <div class="variable-chip">
            <code>$(arg1)</code>
            <span>First argument after the command</span>
          </div>
        </div>

        <div class="builder-examples">
          <div class="example-card">
            <strong>Example:</strong>
            <p><code>!hug @sam</code> → <code>$(user) hugs $(touser)</code></p>
          </div>
          <div class="example-card">
            <strong>Example:</strong>
            <p><code>!topic confidence tips</code> → <code>$(user) asked about $(args)</code></p>
          </div>
        </div>
      </section>

      <!-- =================================================
           4. TAB BAR
           - Custom vs Suggested commands
      ================================================== -->
      <section class="tabs-bar">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'custom' }"
          @click="switchTab('custom')"
        >
          Custom commands
          <span class="tab-count">{{ filteredCustomCommands.length }}</span>
        </button>

        <button
          class="tab-btn"
          :class="{ active: activeTab === 'suggested' }"
          @click="switchTab('suggested')"
        >
          Suggested commands
          <span class="tab-count">{{ filteredSuggestedCommands.length }}</span>
        </button>
      </section>

      <!-- =================================================
           5. COMMAND TABLE
           - StreamElements-style rows + inline dropdown editors
      ================================================== -->
      <section class="panel-card commands-card">
        <!-- 5.1 Table header row -->
        <div class="table-head">
          <div>Enabled</div>
          <div>Command</div>
          <div>Description</div>
          <div>Category</div>
          <div>Cooldown</div>
          <div></div>
        </div>

        <!-- 5.2 Custom commands tab content -->
        <template v-if="activeTab === 'custom'">
          <div v-if="filteredCustomCommands.length === 0" class="empty-state">
            <h3>No custom commands yet</h3>
            <p>Create your first command or enable one from Suggested commands.</p>
          </div>

          <div
            v-for="command in filteredCustomCommands"
            :key="command.id"
            class="command-block"
          >
            <!-- Row -->
            <div
              class="command-row"
              :class="{ expanded: expandedCommandId === command.id }"
              @click="toggleExpanded(command.id)"
            >
              <div class="cell toggle-cell" @click.stop>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    :checked="command.enabled"
                    @change="toggleCommandEnabled(command)"
                  />
                  <span></span>
                </label>
              </div>

              <div class="cell command-name">
                <strong>!{{ command.name || 'new-command' }}</strong>
              </div>

              <div class="cell description-cell">
                {{ command.reply || 'No reply set yet.' }}
              </div>

              <div class="cell">
                <span class="mini-badge">{{ command.category || 'Custom' }}</span>
              </div>

              <div class="cell">
                {{ command.cooldownSeconds ?? 0 }}s
              </div>

              <div class="cell expand-cell">
                <span class="chevron" :class="{ open: expandedCommandId === command.id }">⌄</span>
              </div>
            </div>

            <!-- Inline editor dropdown -->
            <div v-if="expandedCommandId === command.id" class="command-dropdown">
              <div class="field-grid two-col">
                <label class="field">
                  <span>Command name</span>
                  <input
                    v-model="command.name"
                    type="text"
                    placeholder="discord"
                  />
                </label>

                <label class="field">
                  <span>Cooldown (seconds)</span>
                  <input
                    v-model.number="command.cooldownSeconds"
                    type="number"
                    min="0"
                  />
                </label>
              </div>

              <div class="field-grid two-col">
                <label class="field">
                  <span>Category</span>
                  <input
                    v-model="command.category"
                    type="text"
                    placeholder="Info / Fun / Mod"
                  />
                </label>

                <label class="field">
                  <span>Permission</span>
                  <select v-model="command.permissionLevel">
                    <option value="everyone">Everyone</option>
                    <option value="subscriber">Subscriber</option>
                    <option value="vip">VIP</option>
                    <option value="mod">Mod</option>
                    <option value="broadcaster">Broadcaster</option>
                  </select>
                </label>
              </div>

              <label class="field">
                <span>Reply text</span>
                <textarea
                  v-model="command.reply"
                  rows="6"
                  placeholder="Type the bot reply here..."
                ></textarea>
              </label>

              <div class="dropdown-actions">
                <button class="danger-btn" @click="removeCommand(command)">
                  Delete
                </button>

                <button class="primary-btn" :disabled="isSaving" @click="saveCommand(command)">
                  {{ isSaving ? 'Saving...' : 'Save Command' }}
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- 5.3 Suggested commands tab content -->
        <template v-else>
          <div v-if="filteredSuggestedCommands.length === 0" class="empty-state">
            <h3>No suggested commands found</h3>
            <p>Try a different search term.</p>
          </div>

          <div
            v-for="suggested in filteredSuggestedCommands"
            :key="suggested.key"
            class="command-block"
          >
            <!-- Row -->
            <div
              class="command-row"
              :class="{ expanded: expandedCommandId === suggested.key }"
              @click="toggleExpanded(suggested.key)"
            >
              <div class="cell toggle-cell" @click.stop>
                <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="suggested.isEnabled"
                @change="toggleSuggestedCommand(suggested)"
                />
                  <span></span>
                </label>
              </div>

              <div class="cell command-name">
                <strong>!{{ suggested.name }}</strong>
              </div>

              <div class="cell description-cell">
                {{ suggested.description }}
              </div>

              <div class="cell">
                <span class="mini-badge muted">{{ suggested.category || 'Suggested' }}</span>
                <span
                  class="mini-badge status-badge"
                  :class="suggested.isEnabled ? 'active' : 'muted'"
                >
                  {{ suggested.isEnabled ? 'Enabled' : 'Disabled' }}
                </span>
              </div>

              <div class="cell">
                {{ suggested.cooldownSeconds ?? 0 }}s
              </div>

              <div class="cell expand-cell">
                <span class="chevron" :class="{ open: expandedCommandId === suggested.key }">⌄</span>
              </div>
            </div>

            <!-- Suggested template editor -->
            <div v-if="expandedCommandId === suggested.key" class="command-dropdown">
              <div class="field-grid two-col">
                <label class="field">
                  <span>Command name</span>
                  <input
                    v-model="suggested.name"
                    type="text"
                    placeholder="discord"
                  />
                </label>

                <label class="field">
                  <span>Cooldown (seconds)</span>
                  <input
                    v-model.number="suggested.cooldownSeconds"
                    type="number"
                    min="0"
                  />
                </label>
              </div>

              <div class="field-grid two-col">
                <label class="field">
                  <span>Category</span>
                  <input
                    v-model="suggested.category"
                    type="text"
                    placeholder="Info / Community / Mod"
                  />
                </label>

                <label class="field">
                  <span>Permission</span>
                  <select v-model="suggested.permissionLevel">
                    <option value="everyone">Everyone</option>
                    <option value="subscriber">Subscriber</option>
                    <option value="vip">VIP</option>
                    <option value="mod">Mod</option>
                    <option value="broadcaster">Broadcaster</option>
                  </select>
                </label>
              </div>

              <label class="field">
                <span>Description</span>
                <input
                  v-model="suggested.description"
                  type="text"
                  placeholder="What this command does"
                />
              </label>

              <label class="field">
                <span>Reply text</span>
                <textarea
                  v-model="suggested.reply"
                  rows="5"
                  placeholder="Type the bot reply here..."
                ></textarea>
              </label>

              <div class="dropdown-actions">
                <button class="secondary-btn" @click.stop="resetSuggestedCommand(suggested.key)">
                  Reset Template
                </button>

                <button
                class="primary-btn"
                @click.stop="toggleSuggestedCommand(suggested)"
              >
                {{ suggested.isEnabled ? 'Disable Command' : 'Enable Command' }}
              </button>
              </div>
            </div>
          </div>
        </template>
      </section>
    </main>
  </div>
</template>

<!-- =========================================================
     2) SCRIPT – Logic, Amplify integration, state, methods
       2a) Imports and constants
       2b) Component data state
       2c) Computed properties
       2d) Lifecycle
       2e) Methods
========================================================= -->
<script>
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';

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
        const userId = user?.userId || user?.username;

        if (!userId) {
          throw new Error('No authenticated user found');
        }

        const response = await fetch(
          `${TWITCH_API_BASE}/api/twitch/connection-by-user?userId=${encodeURIComponent(userId)}`
        );

        const data = await response.json();
        const connection = data?.connection || null;

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
</script>

<!-- =========================================================
     3) STYLES – Layout & visual style
       3a) Layout and shell
       3b) Sidebar styles
       3c) Header and actions
       3d) Panels and help
       3e) Tabs and command table
       3f) Toggles and responsive
========================================================= -->
<style scoped>
/* 3.1 Layout: page shell */
.bot-page {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.16), transparent 22%),
    linear-gradient(180deg, #0c1020 0%, #12182b 100%);
  color: #eef2ff;
}

.bot-main {
  padding: 28px;
}

/* 3.2 Sidebar */
.bot-sidebar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px 18px;
  background: rgba(8, 12, 24, 0.82);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}

.brand-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 1rem;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: #fff;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.35);
}

.brand-kicker {
  margin: 0 0 4px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #9ca3af;
}

.brand-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.nav-item,
.sub-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: transparent;
  color: #c7d2fe;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: 0.25s ease;
}

.sub-nav-item {
  margin-left: 10px;
  width: calc(100% - 10px);
}

.nav-item:hover,
.sub-nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.nav-item.active,
.sub-nav-item.active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.22), rgba(56, 189, 248, 0.14));
  border-color: rgba(96, 165, 250, 0.25);
  color: #fff;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-section-label {
  padding: 2px 4px 2px 2px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #93c5fd;
  font-weight: 700;
}

.nav-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.8;
}

.sidebar-footer {
  padding-top: 20px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
}

.status-pill.online {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
  border: 1px solid rgba(147, 197, 253, 0.2);
}

.sidebar-note {
  margin-top: 12px;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #94a3b8;
}

/* 3.3 Header & actions */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 22px;
}

.eyebrow,
.section-kicker {
  margin: 0 0 8px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #93c5fd;
}

.top-bar h2 {
  margin: 0;
  font-size: 2rem;
  line-height: 1.15;
  max-width: 18ch;
}

.page-subtitle {
  margin: 12px 0 0;
  max-width: 60ch;
  color: #94a3b8;
  line-height: 1.5;
}

.top-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.search-input {
  min-width: 240px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.75);
  color: #eef2ff;
  outline: none;
}

/* Buttons */
.primary-btn,
.secondary-btn,
.danger-btn {
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s ease;
}

.primary-btn {
  background: #fff;
  color: #111827;
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.18);
}

.danger-btn {
  background: rgba(239, 68, 68, 0.14);
  color: #fecaca;
}

/* 3.4 Panels & help */
.panel-card {
  padding: 22px;
  border-radius: 22px;
  background: rgba(10, 16, 31, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
}

.error-banner {
  border-color: rgba(248, 113, 113, 0.3);
  background: rgba(254, 202, 202, 0.12);
}

.error-message {
  color: #fee2e2;
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.6;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 18px;
}

.panel-header.compact {
  margin-bottom: 14px;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #fff;
}

.variables-panel {
  margin-bottom: 18px;
}

.variables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.variable-chip {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.variable-chip code {
  color: #93c5fd;
  font-weight: 700;
}

.variable-chip span {
  color: #cbd5e1;
  font-size: 0.9rem;
}

.builder-examples {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.example-card {
  padding: 14px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
}

.example-card p {
  margin: 8px 0 0;
}

.example-card code {
  color: #93c5fd;
}

/* 3.5 Tabs */
.tabs-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 4px;
  margin-bottom: -1px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #94a3b8;
  cursor: pointer;
  font-weight: 700;
}

.tab-btn.active {
  color: #fff;
  border-bottom-color: #3b82f6;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.16);
  color: #93c5fd;
  font-size: 0.78rem;
}

/* 3.6 Command table */
.commands-card {
  padding: 0;
  overflow: hidden;
}

.table-head,
.command-row {
  display: grid;
  grid-template-columns: 100px 220px minmax(0, 1fr) 140px 110px 60px;
  align-items: center;
}

.table-head {
  padding: 16px 20px;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.command-block {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.command-row {
  padding: 16px 20px;
  gap: 12px;
  cursor: pointer;
  transition: 0.2s ease;
}

.command-row:hover,
.command-row.expanded {
  background: rgba(15, 23, 42, 0.55);
}

.cell {
  min-width: 0;
}

.command-name strong {
  color: #fff;
}

.description-cell {
  color: #cbd5e1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.expand-cell {
  display: flex;
  justify-content: flex-end;
}

.chevron {
  font-size: 1.2rem;
  color: #94a3b8;
  transition: transform 0.2s ease;
}

.chevron.open {
  transform: rotate(180deg);
}

.command-dropdown {
  padding: 0 20px 20px;
  background: rgba(8, 12, 24, 0.45);
}

.field-grid {
  display: grid;
  gap: 16px;
  margin-bottom: 16px;
}

.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field span {
  font-size: 0.9rem;
  color: #cbd5e1;
  font-weight: 600;
}

.field input,
.field textarea,
.field select,
.search-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.75);
  color: #eef2ff;
  outline: none;
}

.field textarea {
  resize: vertical;
  min-height: 160px;
}

.field input:focus,
.field textarea:focus,
.field select:focus,
.search-input:focus {
  border-color: rgba(96, 165, 250, 0.65);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
}

.dropdown-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Badges & empty states */
.mini-badge {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.14);
  color: #93c5fd;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.mini-badge.active {
  background: rgba(34, 197, 94, 0.14);
  color: #86efac;
}

.mini-badge.disabled {
  background: rgba(148, 163, 184, 0.12);
  color: #cbd5e1;
}

.mini-badge.muted {
  background: rgba(148, 163, 184, 0.12);
  color: #cbd5e1;
}

.mini-badge.status-badge {
  margin-left: 8px;
  font-size: 0.65rem;
  padding: 4px 8px;
  text-transform: none;
}

.empty-state {
  padding: 32px 20px;
  color: #cbd5e1;
}

.empty-state h3 {
  margin: 0 0 8px;
}

.empty-state p {
  margin: 0;
  color: #94a3b8;
}

/* 3.7 Toggle switches */
.toggle-switch {
  position: relative;
  display: inline-flex;
  width: 40px;
  height: 22px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch span {
  position: absolute;
  inset: 0;
  background-color: rgba(55, 65, 81, 0.9);
  border-radius: 999px;
  transition: 0.2s ease;
}

.toggle-switch span::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  left: 2px;
  top: 2px;
  border-radius: 50%;
  background: #fff;
  transition: 0.2s ease;
}

.toggle-switch input:checked + span {
  background: #3b82f6;
}

.toggle-switch input:checked + span::before {
  transform: translateX(18px);
}

/* 3.8 Responsive */
@media (max-width: 1200px) {
  .table-head,
  .command-row {
    grid-template-columns: 90px 180px minmax(0, 1fr) 120px 90px 50px;
  }
}

@media (max-width: 980px) {
  .bot-page {
    grid-template-columns: 1fr;
  }

  .bot-sidebar {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .top-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .table-head {
    display: none;
  }

  .command-row {
    grid-template-columns: 60px 1fr 40px;
    grid-template-areas:
      "toggle command expand"
      "toggle description expand"
      "toggle meta expand";
    align-items: start;
  }

  .toggle-cell {
    grid-area: toggle;
  }

  .command-name {
    grid-area: command;
  }

  .description-cell {
    grid-area: description;
    white-space: normal;
  }

  .expand-cell {
    grid-area: expand;
  }

  .command-row .cell:nth-child(4),
  .command-row .cell:nth-child(5) {
    grid-area: meta;
  }

  .two-col {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .bot-main {
    padding: 18px;
  }

  .panel-card {
    padding: 18px;
  }

  .commands-card {
    padding: 0;
  }

  .top-bar h2 {
    font-size: 1.6rem;
  }

  .search-input {
    min-width: 100%;
    width: 100%;
  }

  .top-actions {
    width: 100%;
  }
}
</style>