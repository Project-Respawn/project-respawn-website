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
    2) Script @imported from TwitchCommands.js
      2a) Imports and constants
      2b) Component data state
      2c) Computed properties
      2d) Lifecycle hook
      2e) Methods
        2e1) UI helpers
        2e2) Twitch connection and command loading
        2e3) Command create/update/delete logic
    3) Styles @imported from TwitchCommands.css
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
   
    <BotSidebar :title="'Twitch Commands'" 
    :colourBrand1="'#2563eb'" 
    :colourBrand2="'#38bdf8'" 
    :colourBoxShadow="'rgba(37, 99, 235, 0.35)'"/>

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
                @click.stop="toggleSuggestedCommand(suggested)">
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


<!-- 2) SCRIPT – Logic, Amplify integration, state, methods -->
<script scoped src="./TwitchCommands.js"></script>


<!-- 3) STYLES – Layout & visual style -->
<style scoped src="./TwitchCommands.css"></style>

