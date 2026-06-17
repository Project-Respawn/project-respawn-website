<template>
  <main class="account-page">
    <section class="account-shell">
      <template v-if="isSignedIn">
        <header class="account-topbar">
          <div>
            <p class="account-eyebrow">Project Respawn</p>
            <h1 class="account-title">Profile Hub</h1>
            <p class="account-subtitle">
              This profile board is driven by runtime layout data, not CSS-defined dashboard structure.
            </p>
          </div>

          <div class="account-topbar-actions">
            <button
              type="button"
              class="account-btn account-btn-secondary"
              @click="toggleEditMode"
            >
              {{ editMode ? "Done editing" : "Edit layout" }}
            </button>

            <button
              type="button"
              class="account-btn account-btn-secondary"
              @click="openAddBoxModal"
            >
              Add box
            </button>

            <button
              type="button"
              class="account-btn account-btn-primary"
              @click="openIdentityEditor"
            >
              Edit profile
            </button>
          </div>
        </header>

        <p v-if="profileLoadError" class="account-inline-error" role="status">
          {{ profileLoadError }}
        </p>

        <section class="account-row">
          <article class="account-box account-box--identity account-box--full-width">
            <div class="account-box-inner">
              <div class="account-box-header">
                <div>
                  <p class="account-box-kicker">Permanent</p>
                  <h2 class="account-box-title">Identity</h2>
                </div>
                <span class="account-badge account-badge-live">Always shown</span>
              </div>

              <div class="account-identity-layout">
                <div class="account-avatar-column">
                  <img
                    v-if="profile.avatarObjectUrl"
                    :src="profile.avatarObjectUrl"
                    alt=""
                    class="account-avatar-image"
                  />
                  <div v-else class="account-avatar-placeholder" aria-hidden="true">
                    {{ profileInitials }}
                  </div>

                  <button
                    type="button"
                    class="account-btn account-btn-ghost account-btn-sm"
                    @click="openIdentityEditor"
                  >
                    Change avatar
                  </button>
                </div>

                <div class="account-identity-copy">
                  <p class="account-box-kicker">Project Respawn Member</p>
                  <h3 class="account-display-name">
                    {{ profile.displayName || "Set your display name" }}
                  </h3>
                  <p class="account-bio-text">
                    {{
                      profile.bio ||
                      "Add a short intro so people know who you are and what you are about."
                    }}
                  </p>

                  <div class="account-chip-row">
                    <span class="account-chip">Profile {{ profileCompletion }}% complete</span>
                    <span class="account-chip">{{ modules.length }} showcase boxes</span>
                    <span class="account-chip">{{ boardConfig.columns }} × {{ boardConfig.rows }} board</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section class="account-layout-section">
          <header class="account-row-header">
            <div>
              <p class="account-row-kicker">Custom layout</p>
              <h2 class="account-row-title">Showcase board</h2>
            </div>
          </header>

          <div class="account-board-shell" :style="boardStyle">
            <button
              v-for="cell in boardCells"
              :key="cell.key"
              type="button"
              class="account-board-cell"
              :class="{
                'is-occupied': cell.occupied,
                'is-drop-target': hoveredCellKey === cell.key
              }"
              :style="cell.style"
              @dragover.prevent="onCellDragOver(cell)"
              @dragleave="onCellDragLeave(cell)"
              @drop.prevent="onCellDrop(cell)"
            >
              <span class="account-board-cell-label">
                Slot {{ cell.col }},{{ cell.row }}
              </span>
            </button>

            <article
              v-for="module in placedModules"
              :key="module.id"
              class="account-box account-board-module"
              :class="{
                'is-editing': editMode,
                'is-drag-source': draggedModuleId === module.id,
                'is-coming-soon': module.comingSoon
              }"
              :style="module.style"
            >
              <div class="account-box-inner">
                <div class="account-box-header">
                  <div>
                    <p class="account-box-kicker">{{ module.category }}</p>
                    <h3 class="account-box-title">{{ module.title }}</h3>
                  </div>

                  <div class="account-box-header-actions">
                    <span
                      v-if="module.visibility === 'public'"
                      class="account-badge account-badge-live"
                    >
                      Public
                    </span>
                    <span
                      v-else
                      class="account-badge account-badge-friends"
                    >
                      Friends
                    </span>

                    <button
                      v-if="editMode"
                      type="button"
                      class="account-box-handle"
                      draggable="true"
                      @dragstart="onDragStart($event, module.id)"
                      @dragend="onDragEnd"
                      @mousedown.stop
                    >
                      Drag box
                    </button>
                  </div>
                </div>

                <div v-if="editMode" class="account-box-toolbar">
                  <label class="account-control-group account-control-group--compact">
                    <span class="account-control-label">Box type</span>
                    <select
                      class="account-select"
                      :value="module.type"
                      @mousedown.stop
                      @change="updateModuleType(module.id, $event.target.value)"
                    >
                      <option
                        v-for="option in moduleTypeOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </option>
                    </select>
                  </label>

                  <label class="account-control-group account-control-group--compact">
                    <span class="account-control-label">Width</span>
                    <select
                      class="account-select"
                      :value="module.w"
                      @mousedown.stop
                      @change="updateModuleWidth(module.id, Number($event.target.value))"
                    >
                      <option :value="1">1 box</option>
                      <option :value="2">2 boxes</option>
                      <option :value="3">3 boxes</option>
                      <option :value="4">4 boxes</option>
                    </select>
                  </label>

                  <label class="account-control-group account-control-group--compact">
                    <span class="account-control-label">Height</span>
                    <select
                      class="account-select"
                      :value="module.h"
                      @mousedown.stop
                      @change="updateModuleHeight(module.id, Number($event.target.value))"
                    >
                      <option :value="1">1 box</option>
                      <option :value="2">2 boxes</option>
                      <option :value="3">3 boxes</option>
                    </select>
                  </label>
                </div>

                <p class="account-box-description">
                  {{ module.description }}
                </p>

                <div v-if="module.supportsText" class="account-text-module">
                  <p class="account-user-text">
                    {{ module.textContent || "Nothing written here yet." }}
                  </p>
                </div>

                <div v-else class="account-empty-state">
                  <p>{{ module.description }}</p>
                </div>

                <div v-if="editMode" class="account-box-controls">
                  <label class="account-control-group">
                    <span class="account-control-label">Visibility</span>
                    <select
                      class="account-select"
                      :value="module.visibility"
                      @mousedown.stop
                      @change="updateModuleVisibility(module.id, $event.target.value)"
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends only</option>
                    </select>
                  </label>

                  <button
                    v-if="module.supportsText"
                    type="button"
                    class="account-btn account-btn-secondary account-btn-sm"
                    @mousedown.stop
                    @click="openTextEditor(module.id)"
                  >
                    Edit text
                  </button>

                  <button
                    type="button"
                    class="account-btn account-btn-secondary account-btn-sm"
                    @mousedown.stop
                    @click="duplicateModule(module.id)"
                  >
                    Duplicate
                  </button>

                  <button
                    type="button"
                    class="account-btn account-btn-ghost account-btn-sm"
                    @mousedown.stop
                    @click="removeModule(module.id)"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div v-if="module.comingSoon" class="account-coming-soon-overlay">
                <span>Coming soon</span>
              </div>
            </article>
          </div>
        </section>
      </template>

      <section v-else class="account-signed-out-card">
        <h2>Sign in to view your profile</h2>
        <p>
          Create an account or sign in to customize your profile layout and visibility settings.
        </p>
        <router-link to="/join" class="account-btn account-btn-primary">
          Go to Join
        </router-link>
      </section>
    </section>

    <div
      v-if="identityEditorOpen && draft"
      class="account-modal-overlay"
      role="presentation"
      @click.self="cancelIdentityEditor"
    >
      <div
        class="account-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="identity-editor-title"
      >
        <button
          type="button"
          class="account-modal-close"
          aria-label="Close"
          @click="cancelIdentityEditor"
        >
          ✕
        </button>

        <h2 id="identity-editor-title" class="account-modal-title">Edit profile</h2>

        <div class="account-form-field">
          <label class="account-form-label" for="edit-name">Display name</label>
          <input
            id="edit-name"
            v-model="draft.displayName"
            type="text"
            class="account-form-control"
            autocomplete="nickname"
          />
        </div>

        <div class="account-form-field">
          <label class="account-form-label" for="edit-bio">About</label>
          <textarea
            id="edit-bio"
            v-model="draft.bio"
            class="account-form-control account-form-control-textarea"
            rows="4"
            placeholder="Write something about yourself…"
          />
        </div>

        <div class="account-form-field">
          <label class="account-form-label" for="edit-avatar">Avatar</label>
          <input
            id="edit-avatar"
            type="file"
            class="account-form-control account-form-control-file"
            accept="image/*"
            @change="onAvatarFile($event)"
          />
        </div>

        <p v-if="profileSaveError" class="account-inline-error" role="status">
          {{ profileSaveError }}
        </p>

        <div class="account-modal-actions">
          <button
            type="button"
            class="account-btn account-btn-secondary"
            @click="cancelIdentityEditor"
          >
            Cancel
          </button>
          <button
            type="button"
            class="account-btn account-btn-primary"
            :disabled="savingProfile"
            @click="saveIdentityEditor"
          >
            {{ savingProfile ? "Saving…" : "Save profile" }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="textEditorOpen && activeTextModule"
      class="account-modal-overlay"
      role="presentation"
      @click.self="cancelTextEditor"
    >
      <div
        class="account-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="text-editor-title"
      >
        <button
          type="button"
          class="account-modal-close"
          aria-label="Close"
          @click="cancelTextEditor"
        >
          ✕
        </button>

        <h2 id="text-editor-title" class="account-modal-title">
          Edit {{ activeTextModule.title }}
        </h2>

        <div class="account-form-field">
          <label class="account-form-label" for="module-title">Title</label>
          <input
            id="module-title"
            v-model="activeTextDraftTitle"
            type="text"
            class="account-form-control"
            placeholder="Box title"
          />
        </div>

        <div class="account-form-field">
          <label class="account-form-label" for="module-text">Text</label>
          <textarea
            id="module-text"
            v-model="textDraft"
            class="account-form-control account-form-control-textarea"
            rows="6"
            placeholder="Write what should appear in this box…"
          />
        </div>

        <div class="account-modal-actions">
          <button
            type="button"
            class="account-btn account-btn-secondary"
            @click="cancelTextEditor"
          >
            Cancel
          </button>
          <button
            type="button"
            class="account-btn account-btn-primary"
            @click="saveTextEditor"
          >
            Save text
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="addBoxModalOpen"
      class="account-modal-overlay"
      role="presentation"
      @click.self="cancelAddBoxModal"
    >
      <div
        class="account-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-box-title"
      >
        <button
          type="button"
          class="account-modal-close"
          aria-label="Close"
          @click="cancelAddBoxModal"
        >
          ✕
        </button>

        <h2 id="add-box-title" class="account-modal-title">Add profile box</h2>

        <div class="account-form-field">
          <label class="account-form-label" for="new-box-type">Box type</label>
          <select
            id="new-box-type"
            v-model="newBoxDraft.type"
            class="account-form-control"
          >
            <option
              v-for="option in moduleTypeOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="account-form-field">
          <label class="account-form-label" for="new-box-title-input">Title</label>
          <input
            id="new-box-title-input"
            v-model="newBoxDraft.title"
            type="text"
            class="account-form-control"
            placeholder="Box title"
          />
        </div>

        <div class="account-form-field">
          <label class="account-form-label" for="new-box-width">Width</label>
          <select
            id="new-box-width"
            v-model.number="newBoxDraft.w"
            class="account-form-control"
          >
            <option :value="1">1 box</option>
            <option :value="2">2 boxes</option>
            <option :value="3">3 boxes</option>
            <option :value="4">4 boxes</option>
          </select>
        </div>

        <div class="account-form-field">
          <label class="account-form-label" for="new-box-height">Height</label>
          <select
            id="new-box-height"
            v-model.number="newBoxDraft.h"
            class="account-form-control"
          >
            <option :value="1">1 box</option>
            <option :value="2">2 boxes</option>
            <option :value="3">3 boxes</option>
          </select>
        </div>

        <div class="account-form-field">
          <label class="account-form-label" for="new-box-visibility">Visibility</label>
          <select
            id="new-box-visibility"
            v-model="newBoxDraft.visibility"
            class="account-form-control"
          >
            <option value="public">Public</option>
            <option value="friends">Friends only</option>
          </select>
        </div>

        <div class="account-modal-actions">
          <button
            type="button"
            class="account-btn account-btn-secondary"
            @click="cancelAddBoxModal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="account-btn account-btn-primary"
            @click="addNewModule"
          >
            Add box
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import AccountLogic from "./Account.js";

export default AccountLogic;
</script>

<style scoped src="./Account.css"></style>