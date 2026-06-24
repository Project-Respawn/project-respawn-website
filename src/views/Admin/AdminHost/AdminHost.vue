<template>
  <section class="admin-page admin-host-permissions-page">
    <div class="admin-page-header">
      <div>
        <p class="admin-page-eyebrow">Events Admin</p>
        <h1>Host Permissions</h1>
        <p class="admin-page-intro">
          Search for users, enable host access, and manage which staff members can control each host.
        </p>
      </div>
    </div>

    <div v-if="loading" class="admin-page-card empty-state">
      Loading host permissions...
    </div>

    <div
      v-else-if="loadError && !hostProfiles.length && !assignments.length"
      class="admin-page-card empty-state"
    >
      <p>{{ loadError }}</p>
      <button class="btn-secondary" type="button" @click="initializePage">
        Retry
      </button>
    </div>

    <div v-else class="admin-host-permissions-layout">
      <article class="admin-page-card permissions-search-card">
        <div class="card-head">
          <div>
            <h2>Enable User as Host</h2>
            <p>Search for a user account, then allow them to appear in the event host selector.</p>
          </div>
        </div>

        <div class="form-row">
          <label for="user-search">Search users</label>
          <input
            id="user-search"
            v-model.trim="userSearch"
            type="text"
            placeholder="Search by name or email"
            :disabled="saving"
          />
        </div>

        <div class="user-search-results">
          <button
            v-for="user in filteredUsers"
            :key="user.id"
            type="button"
            class="user-result-card"
            :class="{ 'is-selected': selectedUser && selectedUser.id === user.id }"
            :disabled="saving"
            @click="selectUser(user)"
          >
            <span class="user-result-name">{{ user.name }}</span>
            <span v-if="user.email" class="user-result-meta">
              {{ user.email }}
            </span>
          </button>

          <div v-if="userSearch && !filteredUsers.length" class="empty-inline-state">
            No users match your search.
          </div>

          <div v-else-if="!allUsers.length" class="empty-inline-state">
            No users available yet.
          </div>
        </div>

        <form class="permission-form" @submit.prevent="enableSelectedUserAsHost">
          <div class="form-row">
            <label for="host-title">Host title</label>
            <input
              id="host-title"
              v-model.trim="hostForm.hostTitle"
              type="text"
              placeholder="Example: Community Host"
              :disabled="saving"
            />
          </div>

          <div v-if="selectedUser" class="selected-user-panel">
            <p class="selected-user-label">Selected user</p>
            <div class="selected-user-card">
              <strong>{{ selectedUser.name }}</strong>
              <span v-if="selectedUser.email">{{ selectedUser.email }}</span>
            </div>
          </div>

          <p v-if="formError" class="form-error">
            {{ formError }}
          </p>

          <p v-if="toastMessage" class="form-success">
            {{ toastMessage }}
          </p>

          <div class="form-actions">
            <button
              class="btn-primary"
              type="submit"
              :disabled="isEnableHostDisabled"
            >
              {{ saving ? 'Saving...' : 'Enable host access' }}
            </button>

            <button
              class="btn-secondary"
              type="button"
              :disabled="saving"
              @click="resetHostForm"
            >
              Reset
            </button>
          </div>
        </form>
      </article>

      <article class="admin-page-card permissions-brand-card">
        <div class="card-head">
          <div>
            <h2>Host Access Viewer</h2>
            <p>Select a host to see which staff members can manage them.</p>
          </div>
        </div>

        <div class="form-row">
          <label for="host-viewer">View host managers</label>
          <select
            id="host-viewer"
            v-model="selectedHostFilter"
            :disabled="saving || !hostProfiles.length"
          >
            <option disabled value="">Select a host</option>
            <option
              v-for="host in hostProfiles"
              :key="host.id"
              :value="host.id"
            >
              {{ host.displayName }}
            </option>
          </select>
        </div>

        <div v-if="selectedHostFilter" class="brand-members-summary">
          <p>
            Showing managers for
            <strong>{{ getHostName(selectedHostFilter) }}</strong>
          </p>
        </div>

        <div
          v-if="selectedHostFilter && filteredAssignments.length"
          class="brand-member-list"
        >
          <article
            v-for="assignment in filteredAssignments"
            :key="assignment.id"
            class="brand-member-item"
          >
            <div class="brand-member-main">
              <div class="brand-member-top">
                <h3>{{ assignment.managerName }}</h3>
                <span
                  class="scope-badge"
                  :class="assignment.accessLevel === 'assign_and_manage' ? 'is-manage' : 'is-assign'"
                >
                  {{
                    assignment.accessLevel === 'assign_and_manage'
                      ? 'Manage host'
                      : 'Assignment access'
                  }}
                </span>
              </div>

              <p v-if="assignment.managerEmail" class="brand-member-meta">
                {{ assignment.managerEmail }}
              </p>
            </div>

            <div class="brand-member-actions">
              <button
                class="btn-secondary btn-danger"
                type="button"
                :disabled="saving"
                @click="removeAssignment(assignment)"
              >
                Remove access
              </button>
            </div>
          </article>
        </div>

        <div v-else-if="selectedHostFilter" class="empty-state">
          No managers currently have access to this host.
        </div>

        <div v-else class="empty-state">
          Select a host to view its managers.
        </div>

        <p v-if="loadError && (hostProfiles.length || assignments.length)" class="form-error">
          {{ loadError }}
        </p>
      </article>

      <article class="admin-page-card permissions-brand-card">
        <div class="card-head">
          <div>
            <h2>Assign Manager to Host</h2>
            <p>Give a staff member permission to manage a selected host.</p>
          </div>
        </div>

        <form class="permission-form" @submit.prevent="assignManagerToHost">
          <div class="form-row">
            <label for="host-assignment-select">Select host</label>
            <select
              id="host-assignment-select"
              v-model="newAssignment.hostUserId"
              :disabled="saving || !hostProfiles.length"
            >
              <option disabled value="">Select a host</option>
              <option
                v-for="host in hostProfiles"
                :key="host.id"
                :value="host.id"
              >
                {{ host.displayName }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <label for="manager-search">Search manager user</label>
            <input
              id="manager-search"
              v-model.trim="assignmentUserSearch"
              type="text"
              placeholder="Search by name or email"
              :disabled="saving || !newAssignment.hostUserId"
            />
          </div>

          <div class="user-search-results">
            <button
              v-for="user in filteredManagerUsers"
              :key="user.id"
              type="button"
              class="user-result-card"
              :class="{ 'is-selected': selectedManagerUser && selectedManagerUser.id === user.id }"
              :disabled="saving"
              @click="selectManagerUser(user)"
            >
              <span class="user-result-name">{{ user.name }}</span>
              <span v-if="user.email" class="user-result-meta">
                {{ user.email }}
              </span>
            </button>

            <div
              v-if="assignmentUserSearch && !filteredManagerUsers.length"
              class="empty-inline-state"
            >
              No manager users match your search.
            </div>
          </div>

          <div class="form-row">
            <label for="host-access-level">Access level</label>
            <select
              id="host-access-level"
              v-model="newAssignment.accessLevel"
              :disabled="saving"
            >
              <option value="assign_only">Assignment access</option>
              <option value="assign_and_manage">Manage host</option>
            </select>
          </div>

          <div v-if="selectedManagerUser" class="selected-user-panel">
            <p class="selected-user-label">Selected manager</p>
            <div class="selected-user-card">
              <strong>{{ selectedManagerUser.name }}</strong>
              <span v-if="selectedManagerUser.email">{{ selectedManagerUser.email }}</span>
            </div>
          </div>

          <p v-if="formError" class="form-error">
            {{ formError }}
          </p>

          <p v-if="toastMessage" class="form-success">
            {{ toastMessage }}
          </p>

          <div class="form-actions">
            <button
              class="btn-primary"
              type="submit"
              :disabled="isAssignmentDisabled"
            >
              {{ saving ? 'Saving...' : 'Assign manager' }}
            </button>

            <button
              class="btn-secondary"
              type="button"
              :disabled="saving"
              @click="resetAssignmentForm"
            >
              Reset
            </button>
          </div>
        </form>
      </article>
    </div>
  </section>
</template>

<script src="./AdminHost.js"></script>
<style src="./AdminHost.css"></style>