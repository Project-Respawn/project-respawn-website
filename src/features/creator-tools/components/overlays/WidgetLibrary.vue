<template>
  <aside
    class="builder-panel widget-library"
    aria-label="Widget library"
  >
    <!-- ======================================================
         SECTION 03A
         WIDGET LIBRARY HEADER
         ====================================================== -->

    <header class="builder-panel__heading library-header">
      <div>
        <span>⌘</span>
        <strong>Widget Library</strong>
      </div>

      <small>
        {{ activeTypes.size }} active
      </small>
    </header>


    <!-- ======================================================
         SECTION 03B
         SEARCH
         ====================================================== -->

    <div class="library-search">
      <input
        v-model="search"
        type="search"
        placeholder="Search widgets…"
        aria-label="Search widgets"
      >

      <button
        type="button"
        class="library-clear-button"
        aria-label="Clear widget filters"
        title="Clear filters"
        @click="clearFilters"
      >
        ×
      </button>
    </div>


    <!-- ======================================================
         SECTION 03C
         STATUS FILTER
         ====================================================== -->

    <div class="library-filter-group">
      <div class="library-filter-label">
        <span>Status</span>

        <small>
          {{ filteredWidgets.length }} shown
        </small>
      </div>

      <div
        class="library-status-filters"
        aria-label="Widget status filter"
      >
        <button
          v-for="item in statusFilters"
          :key="item.id"
          type="button"
          :class="{
            active: status === item.id
          }"
          @click="status = item.id"
        >
          <span>
            {{ item.label }}
          </span>

          <span class="filter-count">
            {{ item.count }}
          </span>
        </button>
      </div>
    </div>


    <!-- ======================================================
         SECTION 03D
         CATEGORY FILTER

         All canonical categories remain visible even when
         they currently contain no widgets.
         ====================================================== -->

    <div class="library-filter-group">
      <div class="library-filter-label">
        <span>Category</span>

        <button
          v-if="category !== 'all'"
          type="button"
          class="library-filter-reset"
          @click="category = 'all'"
        >
          Clear
        </button>
      </div>

      <div
        class="library-category-grid"
        aria-label="Widget category filter"
      >
        <button
          type="button"
          :class="{
            active: category === 'all'
          }"
          @click="category = 'all'"
        >
          All
        </button>

        <button
          v-for="item in widgetCategories"
          :key="item.id"
          type="button"
          :class="{
            active: category === item.id
          }"
          :title="item.label"
          @click="category = item.id"
        >
          {{ item.label }}
        </button>
      </div>
    </div>


    <!-- ======================================================
         SECTION 03E
         INTEGRATION FILTER
         ====================================================== -->

    <div class="library-filter-group">
      <div class="library-filter-label">
        <span>Integration</span>

        <button
          v-if="integration !== 'all'"
          type="button"
          class="library-filter-reset"
          @click="integration = 'all'"
        >
          Clear
        </button>
      </div>

      <div
        class="library-integration-filters"
        aria-label="Widget integration filter"
      >
        <button
          type="button"
          :class="{
            active: integration === 'all'
          }"
          @click="integration = 'all'"
        >
          All
        </button>

        <button
          v-for="item in availableIntegrations"
          :key="item.id"
          type="button"
          :class="{
            active: integration === item.id
          }"
          @click="integration = item.id"
        >
          {{ item.label }}
        </button>
      </div>
    </div>


    <!-- ======================================================
         SECTION 03F
         SCROLLABLE WIDGET RESULTS

         IMPORTANT:
         This is the ONLY area of Section 03 that should
         vertically scroll.
         ====================================================== -->

    <div
      v-if="filteredWidgets.length"
      class="library-scroll-region"
    >
      <div class="library-items">
        <button
          v-for="item in filteredWidgets"
          :key="item.type"
          type="button"
          class="library-widget"
          :class="{
            selected:
              selectedType === item.type,

            enabled:
              activeTypes.has(item.type)
          }"
          @click="choose(item)"
        >
          <!-- Widget icon -->
          <span class="library-icon">
            {{ resolveIcon(item) }}
          </span>


          <!-- Widget information -->
          <span class="library-widget-copy">
            <span class="library-widget-title-row">
              <b>
                {{ item.displayName }}
              </b>

              <em
                class="library-widget-status"
                :class="{
                  'is-on':
                    activeTypes.has(item.type)
                }"
              >
                {{
                  activeTypes.has(item.type)
                    ? 'On'
                    : 'Off'
                }}
              </em>
            </span>

            <small>
              {{ description(item) }}
            </small>

            <span class="library-widget-meta">
              <em>
                {{ categoryLabel(item) }}
              </em>

              <em
                v-for="source in integrationLabels(item)"
                :key="source"
              >
                {{ source }}
              </em>
            </span>
          </span>


          <!-- ================================================
               WIDGET ON / OFF TOGGLE
               ================================================ -->

          <label
            class="library-toggle"
            @click.stop
          >
            <input
              type="checkbox"
              :checked="
                activeTypes.has(item.type)
              "
              :aria-label="
                `${
                  activeTypes.has(item.type)
                    ? 'Turn off'
                    : 'Turn on'
                } ${item.displayName}`
              "
              @change="
                emit(
                  'toggle',
                  item.type,
                  $event.target.checked
                )
              "
            >

            <span aria-hidden="true"></span>
          </label>
        </button>
      </div>
    </div>


    <!-- ======================================================
         SECTION 03G
         EMPTY CATEGORY
         ====================================================== -->

    <div
      v-else-if="isEmptyCategory"
      class="library-empty"
    >
      <span class="library-empty-icon">
        ◇
      </span>

      <strong>
        No {{ selectedCategoryLabel }}
        widgets available yet
      </strong>

      <span>
        New widgets will appear here as they are
        added to Project Respawn.
      </span>

      <button
        type="button"
        @click="category = 'all'"
      >
        View all widgets
      </button>
    </div>


    <!-- ======================================================
         SECTION 03H
         GENERIC EMPTY RESULT
         ====================================================== -->

    <div
      v-else
      class="library-empty"
    >
      <span class="library-empty-icon">
        ⌕
      </span>

      <strong>
        No widgets found
      </strong>

      <span>
        Try changing your search, status or
        integration filters.
      </span>

      <button
        type="button"
        @click="clearFilters"
      >
        Clear filters
      </button>
    </div>


    <!-- ======================================================
         SECTION 03I
         TIP
         ====================================================== -->

    <aside class="library-tip">
      <strong>
        ✦ Tip
      </strong>

      <span>
        Turn widgets on here, then select them in
        the library, canvas or Layers to edit them.
      </span>
    </aside>
  </aside>
</template>


<script setup>
import {
  computed,
  ref,
} from 'vue'


// ============================================================
// SECTION 03
// WIDGET REGISTRY
// ============================================================

import {
  getAllWidgets,
} from '../../widgets/registry/index.js'

import {
  widgetCategories,
} from '../../widgets/registry/categories.js'

import {
  widgetIntegrations,
} from '../../widgets/registry/integrations.js'


// ============================================================
// SECTION 03
// PROPS
// ============================================================

const props = defineProps({
  widgets: {
    type: Array,
    default: () => [],
  },

  selectedId: {
    type: String,
    default: '',
  },
})


// ============================================================
// SECTION 03
// EVENTS
// ============================================================

const emit = defineEmits([
  'toggle',
  'select',
])


// ============================================================
// SECTION 03
// FILTER STATE
// ============================================================

const search = ref('')

const status = ref('all')

const category = ref('all')

const integration = ref('all')


// ============================================================
// SECTION 03
// REGISTRY
// ============================================================

const registryWidgets = computed(() => {
  return getAllWidgets()
})


// ============================================================
// SECTION 03
// CURRENT SCENE STATE
// ============================================================

const activeTypes = computed(() => {
  return new Set(
    props.widgets.map(
      widget => widget.type,
    ),
  )
})


const selectedType = computed(() => {
  return (
    props.widgets.find(
      widget =>
        widget.id === props.selectedId,
    )?.type || ''
  )
})


// ============================================================
// SECTION 03
// STATUS COUNTS
// ============================================================

const statusFilters = computed(() => {
  const all =
    registryWidgets.value.length

  const on =
    registryWidgets.value.filter(
      widget =>
        activeTypes.value.has(
          widget.type,
        ),
    ).length

  const off =
    all - on

  return [
    {
      id: 'all',
      label: 'All',
      count: all,
    },

    {
      id: 'on',
      label: 'On',
      count: on,
    },

    {
      id: 'off',
      label: 'Off',
      count: off,
    },
  ]
})


// ============================================================
// SECTION 03
// AVAILABLE INTEGRATIONS
//
// Categories remain permanently visible.
//
// Integrations currently only appear when at least one
// registered widget uses them.
// ============================================================

const availableIntegrations = computed(() => {
  const usedIntegrations =
    new Set(
      registryWidgets.value.flatMap(
        widget =>
          widget.integrations || [],
      ),
    )

  return widgetIntegrations.filter(
    item =>
      usedIntegrations.has(item.id),
  )
})


// ============================================================
// SECTION 03
// SELECTED CATEGORY
// ============================================================

const selectedCategory = computed(() => {
  if (
    category.value === 'all'
  ) {
    return null
  }

  return (
    widgetCategories.find(
      item =>
        item.id === category.value,
    ) || null
  )
})


const selectedCategoryLabel = computed(() => {
  return (
    selectedCategory.value?.label ||
    'Selected'
  )
})


// ============================================================
// SECTION 03
// CATEGORY AVAILABILITY
// ============================================================

const selectedCategoryHasWidgets =
  computed(() => {
    if (
      category.value === 'all'
    ) {
      return true
    }

    return registryWidgets.value.some(
      widget =>
        (
          widget.categories || []
        ).includes(
          category.value,
        ),
    )
  })


// ============================================================
// SECTION 03
// EMPTY CATEGORY STATE
// ============================================================

const isEmptyCategory = computed(() => {
  return (
    category.value !== 'all' &&
    !selectedCategoryHasWidgets.value &&
    !search.value.trim() &&
    status.value === 'all' &&
    integration.value === 'all'
  )
})


// ============================================================
// SECTION 03
// FILTERED WIDGETS
// ============================================================

const filteredWidgets = computed(() => {
  const query =
    search.value
      .trim()
      .toLowerCase()

  return registryWidgets.value.filter(
    widget => {
      // ------------------------------------------------------
      // SEARCH
      // ------------------------------------------------------

      const searchable = [
        widget.displayName,
        widget.description,
        widget.type,

        ...(widget.categories || []),

        ...(widget.integrations || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        !query ||
        searchable.includes(query)


      // ------------------------------------------------------
      // STATUS
      // ------------------------------------------------------

      const isActive =
        activeTypes.value.has(
          widget.type,
        )

      const matchesStatus =
        status.value === 'all' ||

        (
          status.value === 'on' &&
          isActive
        ) ||

        (
          status.value === 'off' &&
          !isActive
        )


      // ------------------------------------------------------
      // CATEGORY
      // ------------------------------------------------------

      const matchesCategory =
        category.value === 'all' ||

        (
          widget.categories || []
        ).includes(
          category.value,
        )


      // ------------------------------------------------------
      // INTEGRATION
      // ------------------------------------------------------

      const matchesIntegration =
        integration.value === 'all' ||

        (
          widget.integrations || []
        ).includes(
          integration.value,
        )


      // ------------------------------------------------------
      // FINAL RESULT
      // ------------------------------------------------------

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesIntegration
      )
    },
  )
})


// ============================================================
// SECTION 03
// DISPLAY HELPERS
// ============================================================

function description(widget) {
  return (
    widget.description ||
    `${widget.displayName} overlay widget`
  )
}


function categoryLabel(widget) {
  const firstCategory =
    widget.categories?.[0]

  if (!firstCategory) {
    return 'Other'
  }

  return (
    widgetCategories.find(
      item =>
        item.id === firstCategory,
    )?.label ||
    firstCategory
  )
}


function integrationLabels(widget) {
  return (
    widget.integrations || []
  )
    .map(
      id =>
        widgetIntegrations.find(
          item =>
            item.id === id,
        )?.label || id,
    )
    .slice(0, 2)
}


function resolveIcon(widget) {
  if (
    typeof widget.icon === 'string' &&
    widget.icon.length <= 4
  ) {
    return widget.icon
  }

  return '◆'
}


// ============================================================
// SECTION 03
// WIDGET SELECTION
// ============================================================

function choose(widget) {
  const activeWidget =
    props.widgets.find(
      item =>
        item.type === widget.type,
    )

  /*
   * ON:
   * Select existing widget.
   *
   * OFF:
   * Enable widget on current scene.
   */

  if (activeWidget) {
    emit(
      'select',
      activeWidget.id,
    )

    return
  }

  emit(
    'toggle',
    widget.type,
    true,
  )
}


// ============================================================
// SECTION 03
// RESET FILTERS
// ============================================================

function clearFilters() {
  search.value = ''
  status.value = 'all'
  category.value = 'all'
  integration.value = 'all'
}
</script>


<style scoped>
/* ============================================================
   PROJECT RESPAWN
   SECTION 03 — WIDGET LIBRARY

   INTERNAL LAYOUT

   03A Header
   03B Search
   03C Status
   03D Categories
   03E Integrations
   03F Scrollable Widget Results
   03G Empty Category
   03H Empty Search
   03I Tip

   IMPORTANT:
   Only 03F scrolls vertically.
   ============================================================ */


/* ============================================================
   03 - ROOT
   ============================================================ */

.widget-library {
  display: flex;

  width: 100%;
  height: 100%;

  min-width: 0;
  min-height: 0;

  flex-direction: column;

  overflow: hidden;
}


/* ============================================================
   03A - FIXED HEADER
   ============================================================ */

.library-header {
  flex: 0 0 auto;
}


/* ============================================================
   03B - SEARCH
   ============================================================ */

.library-search {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    32px;

  flex: 0 0 auto;

  gap: 6px;

  padding:
    9px 10px 6px;
}

.library-search input {
  width: 100%;
  min-width: 0;

  height: 32px;

  padding:
    0 10px;

  border:
    1px solid
    rgba(
      148,
      163,
      184,
      0.16
    );

  border-radius:
    7px;

  outline:
    none;

  background:
    rgba(
      6,
      16,
      29,
      0.72
    );

  color:
    #e5edf7;

  font-size:
    11px;
}

.library-search input::placeholder {
  color:
    #60748a;
}

.library-search input:focus {
  border-color:
    rgba(
      139,
      92,
      246,
      0.65
    );

  box-shadow:
    0 0 0 2px
    rgba(
      139,
      92,
      246,
      0.08
    );
}

.library-clear-button {
  display: grid;

  width: 32px;
  height: 32px;

  place-items: center;

  padding: 0;

  border:
    1px solid
    rgba(
      148,
      163,
      184,
      0.16
    );

  border-radius:
    7px;

  background:
    rgba(
      12,
      27,
      44,
      0.75
    );

  color:
    #8495a9;

  font-size:
    16px;

  cursor:
    pointer;
}

.library-clear-button:hover {
  border-color:
    rgba(
      139,
      92,
      246,
      0.4
    );

  color:
    #c4b5fd;
}


/* ============================================================
   03C / 03D / 03E
   FIXED FILTER GROUPS
   ============================================================ */

.library-filter-group {
  flex: 0 0 auto;

  padding:
    7px 10px;

  border-top:
    1px solid
    rgba(
      148,
      163,
      184,
      0.07
    );
}

.library-filter-label {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 8px;

  margin-bottom:
    6px;
}

.library-filter-label > span {
  color:
    #788ba2;

  font-size:
    8px;

  font-weight:
    800;

  letter-spacing:
    0.1em;

  text-transform:
    uppercase;
}

.library-filter-label small {
  color:
    #63758a;

  font-size:
    8px;
}

.library-filter-reset {
  padding:
    0;

  border:
    0;

  background:
    transparent;

  color:
    #a78bfa;

  font-size:
    8px;

  font-weight:
    700;

  cursor:
    pointer;
}


/* ============================================================
   03C - STATUS
   ============================================================ */

.library-status-filters {
  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap:
    5px;
}

.library-status-filters button {
  display: flex;

  min-width: 0;
  min-height: 28px;

  align-items: center;
  justify-content: center;

  gap:
    5px;

  padding:
    4px 5px;

  border:
    1px solid
    rgba(
      148,
      163,
      184,
      0.12
    );

  border-radius:
    6px;

  background:
    rgba(
      10,
      23,
      39,
      0.74
    );

  color:
    #8ea0b6;

  font-size:
    9px;

  font-weight:
    700;

  cursor:
    pointer;
}

.filter-count {
  display: inline-grid;

  min-width: 16px;
  height: 16px;

  place-items: center;

  padding:
    0 4px;

  border-radius:
    999px;

  background:
    rgba(
      148,
      163,
      184,
      0.1
    );

  font-size:
    7px;
}


/* ============================================================
   03D - CATEGORY GRID

   All + 14 canonical categories = 15 buttons.
   3 columns = 5 clean rows.
   ============================================================ */

.library-category-grid {
  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap:
    5px;
}

.library-category-grid button {
  min-width: 0;
  min-height: 27px;

  padding:
    4px;

  overflow:
    hidden;

  border:
    1px solid
    rgba(
      148,
      163,
      184,
      0.12
    );

  border-radius:
    6px;

  background:
    rgba(
      10,
      23,
      39,
      0.74
    );

  color:
    #8ea0b6;

  font-size:
    8px;

  font-weight:
    700;

  line-height:
    1.1;

  text-overflow:
    ellipsis;

  cursor:
    pointer;
}


/* ============================================================
   03E - INTEGRATIONS
   ============================================================ */

.library-integration-filters {
  display: flex;

  flex-wrap: wrap;

  gap:
    5px;
}

.library-integration-filters button {
  min-height:
    26px;

  padding:
    4px 8px;

  border:
    1px solid
    rgba(
      148,
      163,
      184,
      0.12
    );

  border-radius:
    6px;

  background:
    rgba(
      10,
      23,
      39,
      0.74
    );

  color:
    #8ea0b6;

  font-size:
    8px;

  font-weight:
    700;

  cursor:
    pointer;
}


/* ============================================================
   03C / 03D / 03E
   FILTER STATES
   ============================================================ */

.library-status-filters button:hover,
.library-category-grid button:hover,
.library-integration-filters button:hover {
  border-color:
    rgba(
      139,
      92,
      246,
      0.38
    );

  color:
    #c4b5fd;
}

.library-status-filters button.active,
.library-category-grid button.active,
.library-integration-filters button.active {
  border-color:
    rgba(
      139,
      92,
      246,
      0.7
    );

  background:
    rgba(
      91,
      33,
      182,
      0.22
    );

  color:
    #ddd6fe;
}


/* ============================================================
   03F - SCROLL REGION

   CRITICAL:
   This region takes all remaining available height.

   The outer Widget Library remains fixed in its grid cell.
   ============================================================ */

.library-scroll-region {
  flex:
    1 1 0;

  width:
    100%;

  /*
   * Important for nested flex scrolling.
   */
  height:
    0;

  min-width:
    0;

  min-height:
    0;

  overflow-x:
    hidden;

  overflow-y:
    auto;

  scrollbar-gutter:
    stable;
}


/* ============================================================
   03F - WIDGET LIST

   The list itself does NOT own the scrolling anymore.
   The parent .library-scroll-region does.
   ============================================================ */

.library-items {
  display:
    grid;

  width:
    100%;

  min-width:
    0;

  align-content:
    start;

  gap:
    5px;

  padding:
    8px 10px;

  box-sizing:
    border-box;
}


/* ============================================================
   03F - WIDGET CARD
   ============================================================ */

.library-widget {
  display:
    grid;

  grid-template-columns:
    29px
    minmax(0, 1fr)
    auto;

  width:
    100%;

  min-height:
    50px;

  align-items:
    center;

  gap:
    7px;

  padding:
    6px 7px;

  border:
    1px solid
    rgba(
      148,
      163,
      184,
      0.11
    );

  border-radius:
    8px;

  background:
    rgba(
      8,
      19,
      33,
      0.72
    );

  color:
    #d7e1ec;

  text-align:
    left;

  cursor:
    pointer;
}

.library-widget:hover {
  border-color:
    rgba(
      139,
      92,
      246,
      0.35
    );

  background:
    rgba(
      13,
      27,
      46,
      0.9
    );
}

.library-widget.enabled {
  border-color:
    rgba(
      139,
      92,
      246,
      0.28
    );
}

.library-widget.selected {
  border-color:
    rgba(
      167,
      139,
      250,
      0.78
    );

  box-shadow:
    inset 0 0 0 1px
    rgba(
      139,
      92,
      246,
      0.18
    );
}


/* ============================================================
   03F - ICON
   ============================================================ */

.library-icon {
  display:
    grid;

  width:
    29px;

  height:
    29px;

  place-items:
    center;

  border-radius:
    7px;

  background:
    rgba(
      139,
      92,
      246,
      0.09
    );

  color:
    #b8a4ff;

  font-size:
    14px;
}


/* ============================================================
   03F - WIDGET COPY
   ============================================================ */

.library-widget-copy {
  min-width:
    0;
}

.library-widget-title-row {
  display:
    flex;

  min-width:
    0;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    5px;
}

.library-widget-title-row b {
  min-width:
    0;

  overflow:
    hidden;

  color:
    #e5edf7;

  font-size:
    10px;

  font-weight:
    700;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;
}

.library-widget-copy > small {
  display:
    block;

  margin-top:
    2px;

  overflow:
    hidden;

  color:
    #74869b;

  font-size:
    8px;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;
}


/* ============================================================
   03F - ON / OFF LABEL
   ============================================================ */

.library-widget-status {
  flex:
    0 0 auto;

  color:
    #60748a;

  font-size:
    7px;

  font-style:
    normal;

  font-weight:
    800;

  text-transform:
    uppercase;
}

.library-widget-status.is-on {
  color:
    #a78bfa;
}


/* ============================================================
   03F - WIDGET METADATA
   ============================================================ */

.library-widget-meta {
  display:
    flex;

  flex-wrap:
    wrap;

  gap:
    3px;

  margin-top:
    4px;
}

.library-widget-meta em {
  padding:
    2px 4px;

  border-radius:
    4px;

  background:
    rgba(
      148,
      163,
      184,
      0.07
    );

  color:
    #718399;

  font-size:
    7px;

  font-style:
    normal;
}


/* ============================================================
   03F - ON / OFF TOGGLE
   ============================================================ */

.library-toggle {
  position:
    relative;

  display:
    inline-flex;

  flex:
    0 0 auto;

  align-items:
    center;

  cursor:
    pointer;
}

.library-toggle input {
  position:
    absolute;

  width:
    1px;

  height:
    1px;

  opacity:
    0;

  pointer-events:
    none;
}

.library-toggle span {
  position:
    relative;

  display:
    block;

  width:
    29px;

  height:
    16px;

  border:
    1px solid
    rgba(
      148,
      163,
      184,
      0.18
    );

  border-radius:
    999px;

  background:
    rgba(
      51,
      65,
      85,
      0.52
    );
}

.library-toggle span::after {
  position:
    absolute;

  top:
    2px;

  left:
    2px;

  width:
    10px;

  height:
    10px;

  border-radius:
    50%;

  background:
    #94a3b8;

  content:
    "";

  transition:
    transform 140ms ease,
    background 140ms ease;
}

.library-toggle
  input:checked
  + span {
  border-color:
    rgba(
      139,
      92,
      246,
      0.7
    );

  background:
    rgba(
      109,
      40,
      217,
      0.52
    );
}

.library-toggle
  input:checked
  + span::after {
  background:
    #ddd6fe;

  transform:
    translateX(13px);
}

.library-toggle
  input:focus-visible
  + span {
  outline:
    2px solid #a78bfa;

  outline-offset:
    2px;
}


/* ============================================================
   03G / 03H - EMPTY STATES

   Empty results occupy the remaining vertical space instead
   of causing the Widget Library to expand.
   ============================================================ */

.library-empty {
  display:
    grid;

  flex:
    1 1 0;

  min-height:
    0;

  align-content:
    center;

  justify-items:
    center;

  gap:
    6px;

  margin:
    8px 10px;

  padding:
    18px 10px;

  border:
    1px dashed
    rgba(
      148,
      163,
      184,
      0.16
    );

  border-radius:
    8px;

  text-align:
    center;
}

.library-empty-icon {
  display:
    grid;

  width:
    28px;

  height:
    28px;

  place-items:
    center;

  margin-bottom:
    2px;

  border-radius:
    50%;

  background:
    rgba(
      139,
      92,
      246,
      0.08
    );

  color:
    #a78bfa;

  font-size:
    14px;
}

.library-empty strong {
  color:
    #cbd5e1;

  font-size:
    10px;
}

.library-empty
  > span:not(
    .library-empty-icon
  ) {
  max-width:
    210px;

  color:
    #718399;

  font-size:
    8px;

  line-height:
    1.4;
}

.library-empty button {
  margin-top:
    3px;

  padding:
    0;

  border:
    0;

  background:
    transparent;

  color:
    #a78bfa;

  font-size:
    8px;

  font-weight:
    700;

  cursor:
    pointer;
}


/* ============================================================
   03I - TIP

   Fixed to the bottom of Section 03.
   ============================================================ */

.library-tip {
  display:
    grid;

  flex:
    0 0 auto;

  gap:
    3px;

  margin:
    2px 10px 10px;

  padding:
    8px;

  border:
    1px solid
    rgba(
      139,
      92,
      246,
      0.13
    );

  border-radius:
    7px;

  background:
    rgba(
      91,
      33,
      182,
      0.07
    );
}

.library-tip strong {
  color:
    #b8a4ff;

  font-size:
    8px;
}

.library-tip span {
  color:
    #74869b;

  font-size:
    8px;

  line-height:
    1.35;
}


/* ============================================================
   SECTION 03
   NARROW PANEL FALLBACK
   ============================================================ */

@media (max-width: 1150px) {
  .library-category-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}
</style>