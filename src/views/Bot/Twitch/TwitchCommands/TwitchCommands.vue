<template>
  <div class="bot-page">
    <BotSidebar
      :title="'Twitch Commands'"
      :colourBrand1="'#2563eb'"
      :colourBrand2="'#38bdf8'"
      :colourBoxShadow="'rgba(37, 99, 235, 0.35)'"
    />

    <main class="bot-main">
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

      <section v-if="connectionError" class="error-banner panel-card">
        <div class="panel-header compact">
          <div>
            <p class="section-kicker">Connection</p>
            <h3>Twitch connection unavailable</h3>
          </div>
        </div>
        <p class="error-message">{{ connectionError }}</p>
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

      <section v-if="showHelp" class="variables-panel panel-card">
        <div class="panel-header compact">
          <div>
            <p class="section-kicker">Command builder help</p>
            <h3>Variables and examples</h3>
          </div>
        </div>

        <div class="variables-grid">
          <div class="variable-chip"><code>$(user)</code><span>User who triggered the command</span></div>
          <div class="variable-chip"><code>$(touser)</code><span>First tagged or mentioned user</span></div>
          <div class="variable-chip"><code>$(channel)</code><span>Current channel name</span></div>
          <div class="variable-chip"><code>$(command)</code><span>The command being run</span></div>
          <div class="variable-chip"><code>$(args)</code><span>Everything after the command</span></div>
          <div class="variable-chip"><code>$(arg1)</code><span>First argument after the command</span></div>
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

      <section class="panel-card commands-card">
        <div class="table-head">
          <div>Enabled</div>
          <div>Command</div>
          <div>Description</div>
          <div>Category</div>
          <div>Cooldown</div>
          <div></div>
        </div>

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

            <div v-if="expandedCommandId === command.id" class="command-dropdown">
              <div class="field-grid two-col">
                <label class="field">
                  <span>Command name</span>
                  <input v-model="command.name" type="text" placeholder="discord" />
                </label>

                <label class="field">
                  <span>Cooldown (seconds)</span>
                  <input v-model.number="command.cooldownSeconds" type="number" min="0" />
                </label>
              </div>

              <div class="field-grid two-col">
                <label class="field">
                  <span>Category</span>
                  <input v-model="command.category" type="text" placeholder="Info / Fun / Mod" />
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
                    :disabled="isLoading || !streamerId"
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

            <div v-if="expandedCommandId === suggested.key" class="command-dropdown">
              <div class="field-grid two-col">
                <label class="field">
                  <span>Command name</span>
                  <input v-model="suggested.name" type="text" placeholder="discord" />
                </label>

                <label class="field">
                  <span>Cooldown (seconds)</span>
                  <input v-model.number="suggested.cooldownSeconds" type="number" min="0" />
                </label>
              </div>

              <div class="field-grid two-col">
                <label class="field">
                  <span>Category</span>
                  <input v-model="suggested.category" type="text" placeholder="Info / Community / Mod" />
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
                  :disabled="isLoading || !streamerId"
                  @click.stop="saveSuggestedCommand(suggested)"
                >
                  Save Template
                </button>

                <button
                  class="primary-btn"
                  :disabled="isLoading || !streamerId"
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

<script scoped src="./TwitchCommands.js"></script>
<style scoped src="./TwitchCommands.css"></style>