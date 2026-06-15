<template>
  <section class="admin-forums-page">
    <div class="admin-forums-hero">
      <div>
        <p class="admin-forums-kicker">Admin Console</p>
        <h1 class="admin-forums-title">Forum Management</h1>
        <p class="admin-forums-copy">
          Create, organise, rename, and manage forum categories and boards for Project Respawn.
        </p>
      </div>

      <div class="admin-forums-hero-actions">
        <button
          type="button"
          class="admin-forums-btn admin-forums-btn-primary"
          @click="openCreateCategory"
        >
          New Category
        </button>

        <button
          type="button"
          class="admin-forums-btn admin-forums-btn-secondary"
          @click="openCreateBoard()"
          :disabled="!categories.length"
        >
          New Board
        </button>
      </div>
    </div>

    <div
      v-if="loadError"
      class="admin-forums-alert admin-forums-alert-error"
      role="alert"
    >
      {{ loadError }}
    </div>

    <div
      v-if="saveMessage"
      class="admin-forums-alert admin-forums-alert-success"
      role="status"
    >
      {{ saveMessage }}
    </div>

    <section class="admin-forums-grid">
      <article class="admin-forums-panel">
        <div class="admin-forums-panel-header">
          <div>
            <p class="admin-forums-panel-kicker">Structure</p>
            <h2 class="admin-forums-panel-title">Categories &amp; Boards</h2>
          </div>

          <button
            type="button"
            class="admin-forums-btn admin-forums-btn-ghost"
            @click="fetchForumStructure"
            :disabled="loading"
          >
            {{ loading ? 'Refreshing…' : 'Refresh' }}
          </button>
        </div>

        <div v-if="loading" class="admin-forums-empty">
          Loading forum structure…
        </div>

        <div v-else-if="!forumSections.length" class="admin-forums-empty">
          No categories found yet. Create your first category to begin.
        </div>

        <div v-else class="admin-forums-sections">
          <section
            v-for="section in forumSections"
            :key="section.id"
            class="admin-forums-section-card"
          >
            <div class="admin-forums-section-top">
              <div>
                <h3 class="admin-forums-section-title">{{ section.name }}</h3>
                <p class="admin-forums-section-meta">
                  Slug: {{ section.slug }} · Sort: {{ section.sortOrder }} ·
                  {{ section.isActive ? 'Active' : 'Hidden' }}
                </p>
                <p class="admin-forums-section-copy">
                  {{ section.description || 'No category description yet.' }}
                </p>
              </div>

              <div class="admin-forums-row-actions">
                <button
                  type="button"
                  class="admin-forums-btn admin-forums-btn-ghost"
                  @click="editCategory(section)"
                >
                  Edit
                </button>

                <button
                  type="button"
                  class="admin-forums-btn admin-forums-btn-ghost"
                  @click="confirmDeleteCategory(section)"
                >
                  Delete
                </button>
              </div>
            </div>

            <div class="admin-forums-board-list">
              <article
                v-for="board in section.boards"
                :key="board.id"
                class="admin-forums-board-card"
              >
                <div class="admin-forums-board-main">
                  <div>
                    <h4 class="admin-forums-board-title">{{ board.name }}</h4>
                    <p class="admin-forums-board-meta">
                      Slug: {{ board.slug }} · Sort: {{ board.sortOrder }} ·
                      {{ board.isActive ? 'Active' : 'Hidden' }}
                    </p>
                    <p class="admin-forums-board-copy">
                      {{ board.description || 'No board description yet.' }}
                    </p>

                    <div
                      v-if="board.allowedGroupLabels && board.allowedGroupLabels.length"
                      class="admin-forums-board-permissions"
                    >
                      <span
                        v-for="groupLabel in board.allowedGroupLabels"
                        :key="groupLabel"
                        class="admin-forums-permission-tag"
                      >
                        {{ groupLabel }} can post
                      </span>
                    </div>

                    <div
                      v-else
                      class="admin-forums-board-permissions"
                    >
                      <span class="admin-forums-permission-tag">
                        Everyone can post
                      </span>
                    </div>
                  </div>

                  <div class="admin-forums-board-badges">
                    <span class="admin-forums-badge">
                      {{ board.threadCount }} threads
                    </span>
                  </div>
                </div>

                <div class="admin-forums-row-actions">
                  <button
                    type="button"
                    class="admin-forums-btn admin-forums-btn-ghost"
                    @click="editBoard(board)"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    class="admin-forums-btn admin-forums-btn-ghost"
                    @click="confirmDeleteBoard(board)"
                  >
                    Delete
                  </button>
                </div>
              </article>

              <button
                type="button"
                class="admin-forums-add-board"
                @click="openCreateBoard(section.id)"
              >
                + Add board to {{ section.name }}
              </button>
            </div>
          </section>
        </div>
      </article>

      <article class="admin-forums-panel">
        <div class="admin-forums-panel-header">
          <div>
            <p class="admin-forums-panel-kicker">Editor</p>
            <h2 class="admin-forums-panel-title">
              {{ formMode === 'category' ? 'Category Editor' : 'Board Editor' }}
            </h2>
          </div>
        </div>

        <form
          v-if="formMode === 'category'"
          class="admin-forums-form"
          @submit.prevent="submitCategory"
        >
          <label class="admin-forums-field">
            <span>Name</span>
            <input
              v-model.trim="categoryForm.name"
              type="text"
              required
              autocomplete="off"
            />
          </label>

          <label class="admin-forums-field">
            <span>Slug</span>
            <input
              v-model.trim="categoryForm.slug"
              type="text"
              required
              autocomplete="off"
            />
          </label>

          <label class="admin-forums-field">
            <span>Description</span>
            <textarea
              v-model="categoryForm.description"
              rows="4"
            ></textarea>
          </label>

          <label class="admin-forums-field">
            <span>Sort Order</span>
            <input
              v-model.number="categoryForm.sortOrder"
              type="number"
              min="0"
              required
            />
          </label>

          <label class="admin-forums-checkbox">
            <input v-model="categoryForm.isActive" type="checkbox" />
            <span>Active</span>
          </label>

          <div class="admin-forums-form-actions">
            <button
              type="submit"
              class="admin-forums-btn admin-forums-btn-primary"
              :disabled="saving"
            >
              {{ saving ? 'Saving…' : 'Save Category' }}
            </button>

            <button
              type="button"
              class="admin-forums-btn admin-forums-btn-secondary"
              @click="resetForms"
              :disabled="saving"
            >
              Clear
            </button>
          </div>
        </form>

        <form
          v-else
          class="admin-forums-form"
          @submit.prevent="submitBoard"
        >
          <label class="admin-forums-field">
            <span>Category</span>
            <select v-model="boardForm.categoryId" required>
              <option value="" disabled>Select a category</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </label>

          <label class="admin-forums-field">
            <span>Name</span>
            <input
              v-model.trim="boardForm.name"
              type="text"
              required
              autocomplete="off"
            />
          </label>

          <label class="admin-forums-field">
            <span>Slug</span>
            <input
              v-model.trim="boardForm.slug"
              type="text"
              required
              autocomplete="off"
            />
          </label>

          <label class="admin-forums-field">
            <span>Description</span>
            <textarea
              v-model="boardForm.description"
              rows="4"
            ></textarea>
          </label>

          <label class="admin-forums-field">
            <span>Sort Order</span>
            <input
              v-model.number="boardForm.sortOrder"
              type="number"
              min="0"
              required
            />
          </label>

          <div class="admin-forums-field">
            <label class="admin-forums-label">Who can create threads?</label>
            <p class="admin-forums-field-hint">
              Leave all unchecked to allow everyone to create threads in this board.
            </p>

            <div class="admin-forums-checkbox-group">
              <label
                v-for="group in availableGroups"
                :key="group.value"
                class="admin-forums-checkbox-card"
              >
                <input
                  type="checkbox"
                  :checked="boardForm.allowedGroups.includes(group.value)"
                  @change="toggleAllowedGroup(group.value)"
                />
                <span>{{ group.label }}</span>
              </label>
            </div>
          </div>

          <label class="admin-forums-checkbox">
            <input v-model="boardForm.isActive" type="checkbox" />
            <span>Active</span>
          </label>

          <div class="admin-forums-form-actions">
            <button
              type="submit"
              class="admin-forums-btn admin-forums-btn-primary"
              :disabled="saving"
            >
              {{ saving ? 'Saving…' : 'Save Board' }}
            </button>

            <button
              type="button"
              class="admin-forums-btn admin-forums-btn-secondary"
              @click="resetForms"
              :disabled="saving"
            >
              Clear
            </button>
          </div>
        </form>
      </article>
    </section>
  </section>
</template>

<script src="./AdminForums.js"></script>
<style src="./AdminForums.css"></style>