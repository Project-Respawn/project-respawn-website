/* =========================================================
   1. IMPORTS
   Vue, Amplify client, auth helpers
   ========================================================= */
import { computed, onMounted, onUnmounted, ref } from "vue";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth";
import { useAuth } from "../../composables/useAuth.js";

/* =========================================================
   2. CLIENT SETUP
   Amplify data client
   ========================================================= */
const client = generateClient();

/* =========================================================
   3. MODULE RELEASE FLAGS
   Turn modules on/off here as they become available
   true  = live / unlocked
   false = coming soon
   ========================================================= */
const MODULE_RELEASES = {
  stats: false,
  achievements: false,
  friends: false,
  events: false,
  activity: false,
  orders: false,
  favoriteGames: false,
  mediaShowcase: false,
  communityRoles: false,
  links: false,
  customNote: false,
  profileStory: false,
  currentGoals: false,
};

/* =========================================================
   4. MODULE LIBRARY
   Master definitions for every available module type
   comingSoon is now driven by MODULE_RELEASES
   ========================================================= */
const MODULE_LIBRARY = {
  stats: {
    category: "Progress",
    title: "Stats",
    description: "A quick snapshot of your current progress.",
    supportsText: false,
  },
  achievements: {
    category: "Progress",
    title: "Achievements",
    description: "Show off earned badges and milestones.",
    supportsText: false,
  },
  friends: {
    category: "Community",
    title: "Friends",
    description: "Let others see parts of your friend network.",
    supportsText: false,
  },
  events: {
    category: "Discovery",
    title: "Events",
    description: "Joined events and suggested events will live here.",
    supportsText: false,
  },
  activity: {
    category: "Activity",
    title: "Recent Activity",
    description: "Recent quests, rewards, and profile activity.",
    supportsText: false,
  },
  orders: {
    category: "Rewards",
    title: "Orders and Items",
    description: "Marketplace items and order history.",
    supportsText: false,
  },
  favoriteGames: {
    category: "Showcase",
    title: "Favorite Games",
    description: "Feature the games you want people to see first.",
    supportsText: false,
  },
  mediaShowcase: {
    category: "Showcase",
    title: "Media Showcase",
    description: "Highlight screenshots, clips, or creator content.",
    supportsText: false,
  },
  communityRoles: {
    category: "Community",
    title: "Community Roles",
    description: "Show your groups, clan roles, or community status.",
    supportsText: false,
  },
  links: {
    category: "Links",
    title: "Links",
    description: "Show important profile links and socials.",
    supportsText: false,
  },
  customNote: {
    category: "Personal",
    title: "Custom Note",
    description: "Write a short message, intro, or profile note.",
    supportsText: true,
  },
  profileStory: {
    category: "Personal",
    title: "Profile Story",
    description: "A larger free-text section for personality and self-expression.",
    supportsText: true,
  },
  currentGoals: {
    category: "Personal",
    title: "Current Goals",
    description: "Share what you are working on right now.",
    supportsText: true,
  },
};

/* =========================================================
   5. MODULE TYPE OPTIONS
   Options shown in selectors / add box modal
   ========================================================= */
const MODULE_TYPE_OPTIONS = [
  { value: "stats", label: "Stats" },
  { value: "achievements", label: "Achievements" },
  { value: "friends", label: "Friends" },
  { value: "events", label: "Events" },
  { value: "activity", label: "Recent Activity" },
  { value: "orders", label: "Orders and Items" },
  { value: "favoriteGames", label: "Favorite Games" },
  { value: "mediaShowcase", label: "Media Showcase" },
  { value: "communityRoles", label: "Community Roles" },
  { value: "links", label: "Links" },
  { value: "customNote", label: "Custom Note" },
  { value: "profileStory", label: "Profile Story" },
  { value: "currentGoals", label: "Current Goals" },
];

/* =========================================================
   6. PROFILE DEFAULT STATE
   Empty/fallback profile object
   ========================================================= */
const EMPTY_PROFILE = {
  id: null,
  ownerUserId: "",
  displayName: "",
  email: "",
  bio: "",
  avatarObjectUrl: null,
};

/* =========================================================
   7. BOARD CONFIG
   Master board sizing
   Change these to make all boxes larger/smaller
   ========================================================= */
const BOARD_CONFIG = {
  columns: 4,
  rows: 5,
  cellWidth: 400,
  cellHeight: 550,
  gap: 18,
  padding: 18,
};

/* =========================================================
   8. MODULE RELEASE HELPERS
   Utility helpers for feature availability
   ========================================================= */
function isModuleReleased(type) {
  return MODULE_RELEASES[type] === true;
}

/* =========================================================
   9. MODULE FACTORY
   Creates a module instance with defaults
   w / h control actual module footprint on the board
   ========================================================= */
function createModule(type, overrides = {}) {
  const base = MODULE_LIBRARY[type] || MODULE_LIBRARY.customNote;

  return {
    id: overrides.id || `${type}-${Math.random().toString(36).slice(2, 10)}`,
    type,
    category: overrides.category ?? base.category,
    title: overrides.title ?? base.title,
    description: overrides.description ?? base.description,
    x: overrides.x ?? 1,
    y: overrides.y ?? 1,
    w: overrides.w ?? 1,
    h: overrides.h ?? 1,
    visibility: overrides.visibility ?? "public",
    supportsText: overrides.supportsText ?? base.supportsText,
    textContent: overrides.textContent ?? "",
    comingSoon: overrides.comingSoon ?? !isModuleReleased(type),
  };
}

/* =========================================================
   10. DEFAULT MODULE LAYOUT
   Starting modules shown on the board
   w = width in cells
   h = height in cells
   ========================================================= */
const DEFAULT_MODULES = [
  createModule("stats", { id: "stats-1", x: 1, y: 1, w: 2, h: 1 }),
  createModule("achievements", { id: "achievements-1", x: 3, y: 1, w: 2, h: 2 }),
  createModule("friends", { id: "friends-1", x: 1, y: 2, w: 2, h: 2, visibility: "friends" }),
  createModule("customNote", {
    id: "custom-note-1",
    x: 3,
    y: 3,
    w: 2,
    h: 1,
    textContent: "Welcome to my profile.",
  }),
  createModule("events", { id: "events-1", x: 1, y: 4, w: 2, h: 1, visibility: "friends" }),
  createModule("activity", { id: "activity-1", x: 3, y: 4, w: 2, h: 2 }),
  createModule("orders", { id: "orders-1", x: 1, y: 5, w: 1, h: 1, visibility: "friends" }),
  createModule("currentGoals", { id: "goals-1", x: 2, y: 5, w: 2, h: 1 }),
];

/* =========================================================
   11. COMPONENT
   Main account page component
   ========================================================= */
export default {
  name: "AccountPage",
  setup() {
    /* =====================================================
       12. AUTH / COMPOSABLES
       ===================================================== */
    const { displayName, email, isSignedIn, refreshAuth } = useAuth();

    /* =====================================================
       13. CORE REACTIVE STATE
       ===================================================== */
    const boardConfig = ref({ ...BOARD_CONFIG });
    const profile = ref({ ...EMPTY_PROFILE });
    const modules = ref(DEFAULT_MODULES.map((item) => ({ ...item })));

    /* =====================================================
       14. SAVE / LOAD STATE
       ===================================================== */
    const savingProfile = ref(false);
    const profileLoadError = ref("");
    const profileSaveError = ref("");

    /* =====================================================
       15. BOARD UI STATE
       ===================================================== */
    const editMode = ref(false);
    const draggedModuleId = ref(null);
    const hoveredCellKey = ref("");

    /* =====================================================
       16. MODAL STATE
       ===================================================== */
    const identityEditorOpen = ref(false);
    const textEditorOpen = ref(false);
    const addBoxModalOpen = ref(false);

    /* =====================================================
       17. TEXT EDITOR STATE
       ===================================================== */
    const textDraft = ref("");
    const activeTextDraftTitle = ref("");
    const activeTextModuleId = ref(null);

    /* =====================================================
       18. PROFILE EDIT DRAFT STATE
       ===================================================== */
    const draft = ref(null);
    let snapshotOnOpen = null;

    /* =====================================================
       19. ADD BOX DRAFT
       ===================================================== */
    const newBoxDraft = ref({
      type: "customNote",
      title: "",
      w: 1,
      h: 1,
      visibility: "public",
    });

    /* =====================================================
       20. STATIC OPTIONS
       ===================================================== */
    const moduleTypeOptions = MODULE_TYPE_OPTIONS;

    /* =====================================================
       21. BOARD SIZE COMPUTED VALUES
       Actual rendered board dimensions
       ===================================================== */
    const boardPixelWidth = computed(() => {
      const { columns, cellWidth, gap, padding } = boardConfig.value;
      return (columns * cellWidth) + ((columns - 1) * gap) + (padding * 2);
    });

    const boardPixelHeight = computed(() => {
      const { rows, cellHeight, gap, padding } = boardConfig.value;
      return (rows * cellHeight) + ((rows - 1) * gap) + (padding * 2);
    });

    /* =====================================================
       22. BOARD STYLE
       Inline board wrapper styles
       ===================================================== */
    const boardStyle = computed(() => ({
      position: "relative",
      width: `${boardPixelWidth.value}px`,
      height: `${boardPixelHeight.value}px`,
      maxWidth: "100%",
      margin: "0 auto",
    }));

    /* =====================================================
       23. GENERIC HELPERS
       ===================================================== */
    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function normalizeModule(module) {
      const { columns, rows } = boardConfig.value;
      module.w = clamp(Number(module.w || 1), 1, columns);
      module.h = clamp(Number(module.h || 1), 1, 3);
      module.x = clamp(Number(module.x || 1), 1, columns - module.w + 1);
      module.y = clamp(Number(module.y || 1), 1, rows - module.h + 1);
      module.comingSoon = !isModuleReleased(module.type);
      return module;
    }

    /* =====================================================
       24. LAYOUT COLLISION HELPERS
       ===================================================== */
    function rectsOverlap(a, b) {
      return !(
        a.x + a.w - 1 < b.x ||
        b.x + b.w - 1 < a.x ||
        a.y + a.h - 1 < b.y ||
        b.y + b.h - 1 < a.y
      );
    }

    function canPlaceRect(rect, items, ignoreId = null) {
      const { columns, rows } = boardConfig.value;

      if (rect.x < 1 || rect.y < 1) return false;
      if (rect.x + rect.w - 1 > columns) return false;
      if (rect.y + rect.h - 1 > rows) return false;

      return !items.some((item) => {
        if (item.id === ignoreId) return false;
        return rectsOverlap(rect, item);
      });
    }

    function firstAvailablePosition(w, h, items, ignoreId = null) {
      const { columns, rows } = boardConfig.value;

      for (let row = 1; row <= rows - h + 1; row += 1) {
        for (let col = 1; col <= columns - w + 1; col += 1) {
          const rect = { x: col, y: row, w, h };
          if (canPlaceRect(rect, items, ignoreId)) {
            return rect;
          }
        }
      }
      return null;
    }

    /* =====================================================
       25. REPACK LOGIC
       Reflows modules to valid positions
       ===================================================== */
    function repackModules(preferredOrder = null) {
      const order = preferredOrder || modules.value.map((item) => item.id);

      const source = order
        .map((id) => modules.value.find((item) => item.id === id))
        .filter(Boolean)
        .map((item) => normalizeModule({ ...item }));

      const placed = [];

      for (const item of source) {
        const wanted = { x: item.x, y: item.y, w: item.w, h: item.h };

        if (canPlaceRect(wanted, placed, item.id)) {
          placed.push({ ...item, ...wanted });
          continue;
        }

        const fallback = firstAvailablePosition(item.w, item.h, placed, item.id);
        if (fallback) {
          placed.push({ ...item, ...fallback });
          continue;
        }

        const reduced = firstAvailablePosition(1, 1, placed, item.id);
        if (reduced) {
          placed.push({ ...item, ...reduced, w: 1, h: 1 });
        }
      }

      modules.value = placed;
    }

    /* =====================================================
       26. BOARD PIXEL MATH
       Converts cell positions into absolute pixel positions
       ===================================================== */
    function cellPixelRect(col, row) {
      const { cellWidth, cellHeight, gap, padding } = boardConfig.value;

      const left = padding + ((col - 1) * (cellWidth + gap));
      const top = padding + ((row - 1) * (cellHeight + gap));

      return {
        left,
        top,
        width: cellWidth,
        height: cellHeight,
      };
    }

    function modulePixelRect(module) {
      const { cellWidth, cellHeight, gap } = boardConfig.value;
      const base = cellPixelRect(module.x, module.y);

      return {
        left: base.left,
        top: base.top,
        width: (module.w * cellWidth) + ((module.w - 1) * gap),
        height: (module.h * cellHeight) + ((module.h - 1) * gap),
      };
    }

    /* =====================================================
       27. BOARD OCCUPANCY HELPERS
       ===================================================== */
    function isCellOccupied(col, row) {
      return modules.value.some((module) => (
        col >= module.x &&
        col < module.x + module.w &&
        row >= module.y &&
        row < module.y + module.h
      ));
    }

    /* =====================================================
       28. BOARD CELLS COMPUTED
       Drop targets / visible board cells
       ===================================================== */
    const boardCells = computed(() => {
      const cells = [];
      const { columns, rows } = boardConfig.value;

      for (let row = 1; row <= rows; row += 1) {
        for (let col = 1; col <= columns; col += 1) {
          const rect = cellPixelRect(col, row);
          const key = `${col}-${row}`;
          cells.push({
            key,
            col,
            row,
            occupied: isCellOccupied(col, row),
            style: {
              position: "absolute",
              left: `${rect.left}px`,
              top: `${rect.top}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
            },
          });
        }
      }

      return cells;
    });

    /* =====================================================
       29. PLACED MODULES COMPUTED
       Final rendered modules with absolute positioning
       ===================================================== */
    const placedModules = computed(() => {
      return [...modules.value]
        .sort((a, b) => (a.y - b.y) || (a.x - b.x))
        .map((module) => {
          const rect = modulePixelRect(module);
          return {
            ...module,
            style: {
              position: "absolute",
              left: `${rect.left}px`,
              top: `${rect.top}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
              zIndex: draggedModuleId.value === module.id ? 5 : 4,
            },
          };
        });
    });

    /* =====================================================
       30. MODULE PLACEMENT ACTIONS
       ===================================================== */
    function tryPlaceModule(moduleId, targetX, targetY) {
      const next = modules.value.map((item) => ({ ...item }));
      const module = next.find((item) => item.id === moduleId);
      if (!module) return false;

      normalizeModule(module);
      module.x = clamp(targetX, 1, boardConfig.value.columns - module.w + 1);
      module.y = clamp(targetY, 1, boardConfig.value.rows - module.h + 1);

      const reordered = [
        module.id,
        ...next.filter((item) => item.id !== module.id).map((item) => item.id),
      ];

      modules.value = next;
      repackModules(reordered);
      return true;
    }

    /* =====================================================
       31. MODULE TYPE HELPERS
       ===================================================== */
    function getTypeMeta(type) {
      return MODULE_LIBRARY[type] || MODULE_LIBRARY.customNote;
    }

    /* =====================================================
       32. MODULE EDIT ACTIONS
       Type, width, height, visibility
       ===================================================== */
    function updateModuleType(moduleId, nextType) {
      const module = modules.value.find((item) => item.id === moduleId);
      if (!module) return;

      const meta = getTypeMeta(nextType);
      module.type = nextType;
      module.category = meta.category;
      module.description = meta.description;
      module.supportsText = meta.supportsText;
      module.comingSoon = !isModuleReleased(nextType);

      if (!module.title || MODULE_TYPE_OPTIONS.some((option) => option.label === module.title)) {
        module.title = meta.title;
      }

      if (!meta.supportsText) {
        module.textContent = "";
      }

      repackModules();
    }

    function updateModuleWidth(moduleId, width) {
      const module = modules.value.find((item) => item.id === moduleId);
      if (!module) return;

      module.w = clamp(width, 1, boardConfig.value.columns);
      normalizeModule(module);
      repackModules([module.id, ...modules.value.filter((item) => item.id !== module.id).map((item) => item.id)]);
    }

    function updateModuleHeight(moduleId, height) {
      const module = modules.value.find((item) => item.id === moduleId);
      if (!module) return;

      module.h = clamp(height, 1, 3);
      normalizeModule(module);
      repackModules([module.id, ...modules.value.filter((item) => item.id !== module.id).map((item) => item.id)]);
    }

    function updateModuleVisibility(moduleId, visibility) {
      const module = modules.value.find((item) => item.id === moduleId);
      if (!module) return;
      module.visibility = visibility === "friends" ? "friends" : "public";
    }

    /* =====================================================
       33. MODULE DUPLICATE / REMOVE
       ===================================================== */
    function duplicateModule(moduleId) {
      const source = modules.value.find((item) => item.id === moduleId);
      if (!source) return;

      modules.value.push({
        ...source,
        id: `${source.type}-${Math.random().toString(36).slice(2, 10)}`,
      });

      repackModules();
    }

    function removeModule(moduleId) {
      modules.value = modules.value.filter((item) => item.id !== moduleId);
      repackModules();
    }

    /* =====================================================
       34. ADD BOX MODAL ACTIONS
       ===================================================== */
    function openAddBoxModal() {
      newBoxDraft.value = {
        type: "customNote",
        title: "",
        w: 1,
        h: 1,
        visibility: "public",
      };
      addBoxModalOpen.value = true;
      window.addEventListener("keydown", onEscapeClose);
    }

    function cancelAddBoxModal() {
      addBoxModalOpen.value = false;
      window.removeEventListener("keydown", onEscapeClose);
    }

    function addNewModule() {
      const type = newBoxDraft.value.type;
      const meta = getTypeMeta(type);

      modules.value.push(createModule(type, {
        title: newBoxDraft.value.title?.trim() || meta.title,
        w: clamp(newBoxDraft.value.w, 1, boardConfig.value.columns),
        h: clamp(newBoxDraft.value.h, 1, 3),
        visibility: newBoxDraft.value.visibility,
      }));

      repackModules();
      cancelAddBoxModal();
    }

    /* =====================================================
       35. EDIT MODE ACTIONS
       ===================================================== */
    function toggleEditMode() {
      editMode.value = !editMode.value;
      draggedModuleId.value = null;
      hoveredCellKey.value = "";
    }

    /* =====================================================
       36. DRAG AND DROP ACTIONS
       ===================================================== */
    function onDragStart(event, moduleId) {
      if (!editMode.value) return;
      event.stopPropagation();
      draggedModuleId.value = moduleId;

      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", moduleId);
      }
    }

    function onDragEnd() {
      draggedModuleId.value = null;
      hoveredCellKey.value = "";
    }

    function onCellDragOver(cell) {
      hoveredCellKey.value = cell.key;
    }

    function onCellDragLeave(cell) {
      if (hoveredCellKey.value === cell.key) {
        hoveredCellKey.value = "";
      }
    }

    function onCellDrop(cell) {
      const moduleId = draggedModuleId.value;
      if (!editMode.value || !moduleId) return;

      tryPlaceModule(moduleId, cell.col, cell.row);
      draggedModuleId.value = null;
      hoveredCellKey.value = "";
    }

    /* =====================================================
       37. PROFILE DISPLAY COMPUTED
       Initials and profile completion
       ===================================================== */
    const profileInitials = computed(() => {
      const source = (profile.value.displayName || profile.value.email || "").trim();
      if (!source) return "?";
      if (source.includes("@")) return source.slice(0, 2).toUpperCase();
      const parts = source.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return source.slice(0, 2).toUpperCase();
    });

    const profileCompletion = computed(() => {
      let score = 35;
      if (profile.value.displayName?.trim()) score += 25;
      if (profile.value.bio?.trim()) score += 25;
      if (profile.value.avatarObjectUrl) score += 15;
      return Math.min(score, 100);
    });

    /* =====================================================
       38. ACTIVE TEXT MODULE COMPUTED
       ===================================================== */
    const activeTextModule = computed(() => {
      return modules.value.find((module) => module.id === activeTextModuleId.value) || null;
    });

    /* =====================================================
       39. PROFILE CLONE / CLEANUP HELPERS
       ===================================================== */
    function cloneProfileState(source) {
      return {
        id: source.id ?? null,
        ownerUserId: source.ownerUserId ?? "",
        displayName: source.displayName ?? "",
        email: source.email ?? "",
        bio: source.bio ?? "",
        avatarObjectUrl: source.avatarObjectUrl ?? null,
      };
    }

    function revokeIfBlob(url) {
      if (url && String(url).startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    }

    /* =====================================================
       40. PROFILE LOAD
       ===================================================== */
    async function loadProfile() {
      profileLoadError.value = "";

      if (!isSignedIn.value) return;

      try {
        const user = await getCurrentUser();
        const ownerUserId = user.userId;

        const { data, errors } = await client.models.UserProfile.list({
          filter: {
            ownerUserId: { eq: ownerUserId },
          },
        });

        if (errors?.length) {
          throw new Error(errors[0].message || "Failed to load profile");
        }

        const existingProfile = data?.[0];

        if (existingProfile) {
          profile.value = {
            id: existingProfile.id,
            ownerUserId: existingProfile.ownerUserId ?? ownerUserId,
            displayName: existingProfile.displayName || displayName.value || "",
            email: email.value || "",
            bio: existingProfile.bio || "",
            avatarObjectUrl: null,
          };
        } else {
          profile.value = {
            id: null,
            ownerUserId,
            displayName: displayName.value || "",
            email: email.value || "",
            bio: "",
            avatarObjectUrl: null,
          };
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        profileLoadError.value = error?.message || "Failed to load profile";
      }
    }

    /* =====================================================
       41. IDENTITY EDITOR ACTIONS
       ===================================================== */
    function openIdentityEditor() {
      snapshotOnOpen = cloneProfileState(profile.value);
      draft.value = cloneProfileState(profile.value);
      profileSaveError.value = "";
      identityEditorOpen.value = true;
      window.addEventListener("keydown", onEscapeClose);
    }

    function cancelIdentityEditor() {
      if (draft.value && snapshotOnOpen && draft.value.avatarObjectUrl !== snapshotOnOpen.avatarObjectUrl) {
        revokeIfBlob(draft.value.avatarObjectUrl);
      }

      draft.value = null;
      snapshotOnOpen = null;
      identityEditorOpen.value = false;
      profileSaveError.value = "";
      window.removeEventListener("keydown", onEscapeClose);
    }

    async function saveIdentityEditor() {
      if (!draft.value || !isSignedIn.value) return;

      savingProfile.value = true;
      profileSaveError.value = "";

      try {
        const user = await getCurrentUser();
        const ownerUserId = user.userId;
        const nextDisplayName = draft.value.displayName.trim();
        const nextBio = draft.value.bio.trim();

        if (!nextDisplayName) {
          throw new Error("Display name is required.");
        }

        let savedRecord;

        if (profile.value.id) {
          const { data, errors } = await client.models.UserProfile.update({
            id: profile.value.id,
            ownerUserId,
            displayName: nextDisplayName,
            bio: nextBio,
          });

          if (errors?.length) {
            throw new Error(errors[0].message || "Failed to update profile");
          }

          savedRecord = data;
        } else {
          const { data, errors } = await client.models.UserProfile.create({
            ownerUserId,
            displayName: nextDisplayName,
            bio: nextBio,
          });

          if (errors?.length) {
            throw new Error(errors[0].message || "Failed to create profile");
          }

          savedRecord = data;
        }

        const previousAvatar = profile.value.avatarObjectUrl;

        profile.value = {
          id: savedRecord?.id ?? null,
          ownerUserId: savedRecord?.ownerUserId ?? ownerUserId,
          displayName: savedRecord?.displayName || nextDisplayName,
          email: email.value || "",
          bio: savedRecord?.bio || nextBio,
          avatarObjectUrl: draft.value.avatarObjectUrl || null,
        };

        if (previousAvatar !== profile.value.avatarObjectUrl) {
          revokeIfBlob(previousAvatar);
        }

        draft.value = null;
        snapshotOnOpen = null;
        identityEditorOpen.value = false;
        window.removeEventListener("keydown", onEscapeClose);
      } catch (error) {
        console.error("Failed to save profile:", error);
        profileSaveError.value = error?.message || "Failed to save profile";
      } finally {
        savingProfile.value = false;
      }
    }

    function onAvatarFile(event) {
      const input = event.target;
      const file = input.files?.[0];

      if (!file || !draft.value) return;

      revokeIfBlob(draft.value.avatarObjectUrl);
      draft.value.avatarObjectUrl = URL.createObjectURL(file);
      input.value = "";
    }

    /* =====================================================
       42. TEXT EDITOR ACTIONS
       ===================================================== */
    function openTextEditor(moduleId) {
      const module = modules.value.find((item) => item.id === moduleId);
      if (!module || !module.supportsText) return;

      activeTextModuleId.value = moduleId;
      activeTextDraftTitle.value = module.title || "";
      textDraft.value = module.textContent || "";
      textEditorOpen.value = true;
      window.addEventListener("keydown", onEscapeClose);
    }

    function cancelTextEditor() {
      activeTextModuleId.value = null;
      activeTextDraftTitle.value = "";
      textDraft.value = "";
      textEditorOpen.value = false;
      window.removeEventListener("keydown", onEscapeClose);
    }

    function saveTextEditor() {
      const module = modules.value.find((item) => item.id === activeTextModuleId.value);
      if (!module) return;

      module.title = activeTextDraftTitle.value.trim() || module.title;
      module.textContent = textDraft.value.trim();
      cancelTextEditor();
    }

    /* =====================================================
       43. ESCAPE KEY HANDLER
       ===================================================== */
    function onEscapeClose(event) {
      if (event.key !== "Escape") return;

      if (identityEditorOpen.value) cancelIdentityEditor();
      if (textEditorOpen.value) cancelTextEditor();
      if (addBoxModalOpen.value) cancelAddBoxModal();
    }

    /* =====================================================
       44. LIFECYCLE
       ===================================================== */
    onMounted(async () => {
      await refreshAuth();
      await loadProfile();
      repackModules();
    });

    onUnmounted(() => {
      window.removeEventListener("keydown", onEscapeClose);
    });

    /* =====================================================
       45. TEMPLATE EXPORTS
       Everything exposed to the template
       ===================================================== */
    return {
      activeTextDraftTitle,
      activeTextModule,
      addBoxModalOpen,
      boardCells,
      boardConfig,
      boardStyle,
      cancelAddBoxModal,
      cancelIdentityEditor,
      cancelTextEditor,
      draggedModuleId,
      draft,
      editMode,
      hoveredCellKey,
      identityEditorOpen,
      isSignedIn,
      moduleTypeOptions,
      modules,
      newBoxDraft,
      onAvatarFile,
      onCellDragLeave,
      onCellDragOver,
      onCellDrop,
      onDragEnd,
      onDragStart,
      openAddBoxModal,
      openIdentityEditor,
      openTextEditor,
      placedModules,
      profile,
      profileCompletion,
      profileInitials,
      profileLoadError,
      profileSaveError,
      removeModule,
      duplicateModule,
      saveIdentityEditor,
      saveTextEditor,
      savingProfile,
      textDraft,
      textEditorOpen,
      toggleEditMode,
      updateModuleHeight,
      updateModuleType,
      updateModuleVisibility,
      updateModuleWidth,
      addNewModule,
    };
  },
};