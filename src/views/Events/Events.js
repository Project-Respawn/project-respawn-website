import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";

const client = generateClient();

/* =========================
   SHARED HELPERS
========================= */
function startOfMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function endOfMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function addDays(date, amount) {
  const clone = new Date(date);
  clone.setUTCDate(clone.getUTCDate() + amount);
  return clone;
}

function startOfUtcWeek(dateInput) {
  const date = new Date(dateInput);
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = addDays(date, diff);
  return new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate()));
}

function endOfUtcWeek(dateInput) {
  const start = startOfUtcWeek(dateInput);
  return new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 6, 23, 59, 59, 999)
  );
}

function isSameUtcDay(a, b) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function toDisplayLocationLabel(value) {
  const map = {
    online: "Online",
    in_person: "In person",
    "in-person": "In person",
  };
  return map[value] || value || "Unknown";
}

function toDisplayPlatformLabel(value) {
  const map = {
    discord: "Discord",
    twitch: "Twitch",
    site: "Project Respawn",
    other: "Other",
  };
  return map[value] || value || "Platform";
}

function toDisplayCategoryLabel(value) {
  const map = {
    community: "Community",
    quest: "Quest",
    gaming: "Gaming",
    support: "Support",
    development: "Development",
  };
  return map[value] || value || "General";
}

function toDisplayStatusLabel(value) {
  const map = {
    upcoming: "Upcoming",
    live: "Live",
    past: "Past",
    cancelled: "Cancelled",
  };
  return map[value] || value || "Planned";
}

function deriveEventStatus(startAt, endAt, persistedStatus) {
  if (persistedStatus === "cancelled") return "cancelled";

  const now = new Date();
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "live";
  return "past";
}

function normaliseEvent(event) {
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);
  const status = deriveEventStatus(event.startAt, event.endAt, event.status);

  return {
    ...event,
    startDate: start,
    endDate: end,
    status,
    statusLabel: toDisplayStatusLabel(status),
    locationLabel: toDisplayLocationLabel(event.locationType),
    platformLabel: toDisplayPlatformLabel(event.platform),
    categoryLabel: toDisplayCategoryLabel(event.category),
    featured: Boolean(event.featured),
    rewardText: event.rewardText || "",
    recapText: event.recapText || "",
    ctaLabel: event.ctaLabel || "View event",
  };
}

function emptySuggestForm() {
  return {
    title: "",
    description: "",
    startAt: "",
    endAt: "",
    locationType: "online",
    platform: "discord",
    category: "community",
    host: "",
    rewardText: "",
    notes: "",
  };
}

function getErrorMessage(error, fallback) {
  if (error?.message) return error.message;

  if (Array.isArray(error?.errors) && error.errors.length) {
    return error.errors.map((item) => item.message).join(", ");
  }

  return fallback;
}

export default {
  name: "EventsPage",

  /* =========================
     DATA SECTION
  ========================= */
  data() {
    return {
      events: [],
      isLoadingEvents: false,
      eventsError: "",

      currentUser: null,
      currentUserRole: "guest",

      activeView: "upcoming",
      selectedLocation: "all",
      selectedCategory: "all",
      showPastEvents: false,
      showSuggestModal: false,
      calendarBaseDate: new Date(),

      isSubmittingSuggestion: false,
      suggestionError: "",
      suggestionSuccess: false,
      suggestEventForm: emptySuggestForm(),

      locationFilters: [
        { label: "All formats", value: "all" },
        { label: "Online", value: "online" },
        { label: "In person", value: "in_person" },
      ],

      categoryFilters: [
        { label: "All types", value: "all" },
        { label: "Community", value: "community" },
        { label: "Quest", value: "quest" },
        { label: "Gaming", value: "gaming" },
        { label: "Support", value: "support" },
        { label: "Development", value: "development" },
      ],
    };
  },

  /* =========================
     COMPUTED: FILTER SECTION
  ========================= */
  computed: {
    filteredEvents() {
      return this.events.filter((event) => {
        const locationMatch =
          this.selectedLocation === "all" || event.locationType === this.selectedLocation;

        const categoryMatch =
          this.selectedCategory === "all" || event.category === this.selectedCategory;

        return locationMatch && categoryMatch;
      });
    },

    /* =========================
       COMPUTED: UPCOMING SECTION
    ========================= */
    filteredUpcomingEvents() {
      return this.filteredEvents
        .filter((event) => event.status === "upcoming" || event.status === "live")
        .sort((a, b) => a.startDate - b.startDate);
    },

    /* =========================
       COMPUTED: FEATURED SECTION
    ========================= */
    featuredEvent() {
      const featured = this.filteredUpcomingEvents.find((event) => event.featured);
      return featured || this.filteredUpcomingEvents[0] || null;
    },

    /* =========================
       COMPUTED: THIS WEEK SECTION
    ========================= */
    thisWeekEvents() {
      const now = new Date();
      const weekStart = startOfUtcWeek(now);
      const weekEnd = endOfUtcWeek(now);

      return this.filteredUpcomingEvents.filter((event) => {
        return event.startDate >= weekStart && event.startDate <= weekEnd;
      });
    },

    upcomingSoonEvents() {
      return this.thisWeekEvents.slice(0, 3);
    },

    /* =========================
       COMPUTED: PAST EVENTS SECTION
    ========================= */
    pastEvents() {
      return this.filteredEvents
        .filter((event) => event.status === "past")
        .sort((a, b) => b.startDate - a.startDate);
    },

    /* =========================
       COMPUTED: SUMMARY SECTION
    ========================= */
    nextEventTitle() {
      return this.filteredUpcomingEvents[0]?.title || "No event planned";
    },

    nextEventDateText() {
      const nextEvent = this.filteredUpcomingEvents[0];
      if (!nextEvent) return "Nothing upcoming right now";
      return `${this.formatEventDate(nextEvent.startAt)} · ${this.formatEventTimeRange(nextEvent.startAt, nextEvent.endAt)}`;
    },

    /* =========================
       COMPUTED: CALENDAR SECTION
    ========================= */
    currentCalendarLabel() {
      return this.calendarBaseDate.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
    },

    calendarDays() {
      const start = startOfMonth(this.calendarBaseDate);
      const end = endOfMonth(this.calendarBaseDate);
      const startWeekday = start.getUTCDay();
      const startOffset = startWeekday === 0 ? 6 : startWeekday - 1;
      const gridStart = addDays(start, -startOffset);
      const days = [];

      for (let index = 0; index < 35; index += 1) {
        const date = addDays(gridStart, index);

        const dayEvents = this.filteredUpcomingEvents.filter((event) =>
          isSameUtcDay(event.startDate, date)
        );

        days.push({
          key: date.toISOString(),
          date,
          dayNumber: date.getUTCDate(),
          inCurrentMonth: date >= start && date <= end,
          events: dayEvents,
        });
      }

      return days;
    },

    /* =========================
       COMPUTED: ACCESS SECTION
    ========================= */
    canSuggestEvents() {
      return this.currentUserRole !== "guest";
    },

    canManageEvents() {
      return this.currentUserRole === "admin" || this.currentUserRole === "staff";
    },
  },

  /* =========================
     LIFECYCLE SECTION
  ========================= */
  async mounted() {
    await Promise.all([this.loadCurrentUser(), this.loadEvents()]);
  },

  methods: {
    /* =========================
       METHODS: DATA ACCESS SECTION
    ========================= */
    async loadCurrentUser() {
      try {
        const user = await getCurrentUser();
        const session = await fetchAuthSession();

        this.currentUser = user;

        const groups = session?.tokens?.accessToken?.payload?.["cognito:groups"] || [];

        if (groups.includes("SuperAdmin") || groups.includes("Admin")) {
          this.currentUserRole = "admin";
          return;
        }

        if (groups.includes("Staff")) {
          this.currentUserRole = "staff";
          return;
        }

        this.currentUserRole = "member";
      } catch (error) {
        this.currentUser = null;
        this.currentUserRole = "guest";
      }
    },

    async loadEvents() {
      this.isLoadingEvents = true;
      this.eventsError = "";

      try {
        const response = await client.models.Event.list({
          limit: 200,
        });

        if (response?.errors?.length) {
          throw new Error(response.errors.map((item) => item.message).join(", "));
        }

        this.events = (response?.data || [])
          .filter(Boolean)
          .map(normaliseEvent)
          .sort((a, b) => a.startDate - b.startDate);
      } catch (error) {
        this.events = [];
        this.eventsError = getErrorMessage(error, "Unable to load events right now.");
      } finally {
        this.isLoadingEvents = false;
      }
    },

    /* =========================
       METHODS: HERO SECTION
    ========================= */
    setActiveView(view) {
      this.activeView = view;
    },

    /* =========================
       METHODS: FILTER SECTION
    ========================= */
    setLocationFilter(value) {
      this.selectedLocation = value;
    },

    setCategoryFilter(value) {
      this.selectedCategory = value;
    },

    /* =========================
       METHODS: PAST EVENTS SECTION
    ========================= */
    toggleShowPast() {
      this.showPastEvents = !this.showPastEvents;
    },

    /* =========================
       METHODS: SUGGEST EVENT SECTION
    ========================= */
    openSuggestEvent() {
      this.suggestionError = "";
      this.suggestionSuccess = false;
      this.showSuggestModal = true;
    },

    closeSuggestEvent() {
      if (this.isSubmittingSuggestion) return;
      this.showSuggestModal = false;
      this.suggestionError = "";
    },

    resetSuggestEventForm() {
      this.suggestEventForm = emptySuggestForm();
    },

    validateSuggestEventForm() {
      if (!this.currentUser) {
        return "You need to sign in before suggesting an event.";
      }

      if (!this.suggestEventForm.title.trim()) {
        return "Please add an event title.";
      }

      if (!this.suggestEventForm.description.trim()) {
        return "Please add an event description.";
      }

      if (
        this.suggestEventForm.startAt &&
        this.suggestEventForm.endAt &&
        new Date(this.suggestEventForm.endAt) < new Date(this.suggestEventForm.startAt)
      ) {
        return "The end time must be after the start time.";
      }

      return "";
    },

    async submitSuggestEvent() {
      this.suggestionError = "";
      this.suggestionSuccess = false;

      const validationError = this.validateSuggestEventForm();
      if (validationError) {
        this.suggestionError = validationError;
        return;
      }

      this.isSubmittingSuggestion = true;

      try {
        const input = {
          title: this.suggestEventForm.title.trim(),
          description: this.suggestEventForm.description.trim(),
          startAt: this.suggestEventForm.startAt || null,
          endAt: this.suggestEventForm.endAt || null,
          locationType: this.suggestEventForm.locationType || null,
          platform: this.suggestEventForm.platform || null,
          category: this.suggestEventForm.category || null,
          host: this.suggestEventForm.host?.trim() || null,
          rewardText: this.suggestEventForm.rewardText?.trim() || null,
          notes: this.suggestEventForm.notes?.trim() || null,
          status: "pending",
          owner: this.currentUser?.userId || null,
          ownerUserId: this.currentUser?.userId || null,
          ownerDisplayName: this.currentUser?.signInDetails?.loginId || this.currentUser?.username || null,
        };

        const response = await client.models.EventSuggestion.create(input);

        if (response?.errors?.length) {
          throw new Error(response.errors.map((item) => item.message).join(", "));
        }

        this.suggestionSuccess = true;
        this.resetSuggestEventForm();
      } catch (error) {
        this.suggestionError = getErrorMessage(
          error,
          "We could not submit your suggestion right now."
        );
      } finally {
        this.isSubmittingSuggestion = false;
      }
    },

    /* =========================
       METHODS: UPCOMING SECTION
    ========================= */
    handleEventCta(event) {
      if (event?.ctaUrl) {
        window.open(event.ctaUrl, "_blank", "noopener");
        return;
      }

      if (event?.slug) {
        this.$router.push({ name: "event-details", params: { slug: event.slug } });
        return;
      }

      this.$router.push({ name: "events" });
    },

    /* =========================
       METHODS: FORMATTER SECTION
    ========================= */
    formatEventDate(dateInput) {
      const date = new Date(dateInput);
      return date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    },

    formatEventDay(dateInput) {
      const date = new Date(dateInput);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
      });
    },

    formatEventMonth(dateInput) {
      const date = new Date(dateInput);
      return date.toLocaleDateString("en-GB", {
        month: "short",
      });
    },

    formatCalendarTime(dateInput) {
      const date = new Date(dateInput);
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    formatEventTimeRange(startInput, endInput) {
      const start = new Date(startInput);
      const end = new Date(endInput);

      const startText = start.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const endText = end.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return `${startText} - ${endText}`;
    },

    statusClass(status) {
      return {
        "is-upcoming": status === "upcoming",
        "is-live": status === "live",
        "is-past": status === "past",
        "is-cancelled": status === "cancelled",
      };
    },
  },
};