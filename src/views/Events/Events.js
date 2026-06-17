const MOCK_EVENTS = [
  {
    id: "event-1",
    title: "Respawn Community Kickoff",
    description: "A relaxed community hangout to welcome new members, talk through the platform, and help people find where to start.",
    startAt: "2026-06-19T19:00:00Z",
    endAt: "2026-06-19T20:30:00Z",
    locationType: "online",
    platform: "discord",
    category: "community",
    featured: true,
    status: "upcoming",
    host: "Project Respawn Team",
    rewardText: "+50 XP · Community intro badge",
    recapText: "Highlights and member takeaways",
    ctaLabel: "Join event",
  },
  {
    id: "event-2",
    title: "Courage Quest Planning Session",
    description: "Plan your next challenge with others and get ideas for easy confidence-building wins.",
    startAt: "2026-06-20T18:30:00Z",
    endAt: "2026-06-20T19:30:00Z",
    locationType: "online",
    platform: "site",
    category: "quest",
    featured: false,
    status: "upcoming",
    host: "Quest Guides",
    rewardText: "+30 XP · Quest prep bonus",
    recapText: "Quest planning notes",
    ctaLabel: "RSVP",
  },
  {
    id: "event-3",
    title: "Twitch Challenge Night",
    description: "A live stream event with shared progress moments and community challenge prompts.",
    startAt: "2026-06-22T20:00:00Z",
    endAt: "2026-06-22T22:00:00Z",
    locationType: "online",
    platform: "twitch",
    category: "gaming",
    featured: false,
    status: "upcoming",
    host: "Ravens Community Gaming",
    rewardText: "+40 XP · Live participation",
    recapText: "Challenge clips and recap",
    ctaLabel: "Watch live",
  },
  {
    id: "event-4",
    title: "Beginner Support Meetup",
    description: "A low-pressure event for people who want help getting started with quests and community spaces.",
    startAt: "2026-06-24T17:00:00Z",
    endAt: "2026-06-24T18:00:00Z",
    locationType: "online",
    platform: "discord",
    category: "support",
    featured: false,
    status: "upcoming",
    host: "Community Helpers",
    rewardText: "+20 XP · Welcome support reward",
    recapText: "Tips shared during the meetup",
    ctaLabel: "Reserve spot",
  },
  {
    id: "event-5",
    title: "Project Respawn Dev Update Live",
    description: "A live look at platform progress, upcoming features, and what the community wants next.",
    startAt: "2026-06-27T19:30:00Z",
    endAt: "2026-06-27T20:30:00Z",
    locationType: "online",
    platform: "site",
    category: "development",
    featured: false,
    status: "upcoming",
    host: "Project Respawn Dev",
    rewardText: "+25 XP · Early feature insight",
    recapText: "Feature roadmap notes",
    ctaLabel: "View event",
  },
  {
    id: "event-6",
    title: "Community Achievement Showcase",
    description: "Members share recent wins, progress milestones, and moments they are proud of.",
    startAt: "2026-06-12T18:00:00Z",
    endAt: "2026-06-12T19:15:00Z",
    locationType: "online",
    platform: "discord",
    category: "community",
    featured: false,
    status: "past",
    host: "Community Team",
    rewardText: "+15 XP",
    recapText: "Achievement highlights from the session",
    ctaLabel: "View details",
  },
  {
    id: "event-7",
    title: "Quest Reflection Circle",
    description: "A slower session focused on reflection, encouragement, and building momentum after recent challenges.",
    startAt: "2026-06-10T19:00:00Z",
    endAt: "2026-06-10T20:00:00Z",
    locationType: "online",
    platform: "site",
    category: "quest",
    featured: false,
    status: "past",
    host: "Quest Support",
    rewardText: "+15 XP",
    recapText: "Reflection prompts and takeaways",
    ctaLabel: "View details",
  },
];

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

function isSameUtcDay(a, b) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function normaliseEvent(event) {
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);

  const locationLabelMap = {
    online: "Online",
    "in-person": "In person",
  };

  const platformLabelMap = {
    discord: "Discord",
    twitch: "Twitch",
    site: "Project Respawn",
  };

  const categoryLabelMap = {
    community: "Community",
    quest: "Quest",
    gaming: "Gaming",
    support: "Support",
    development: "Development",
  };

  const statusLabelMap = {
    upcoming: "Upcoming",
    live: "Live",
    past: "Past",
  };

  return {
    ...event,
    startDate: start,
    endDate: end,
    locationLabel: locationLabelMap[event.locationType] || event.locationType,
    platformLabel: platformLabelMap[event.platform] || event.platform,
    categoryLabel: categoryLabelMap[event.category] || event.category,
    statusLabel: statusLabelMap[event.status] || event.status,
  };
}

export default {
  name: "EventsPage",

  data() {
    return {
      activeView: "upcoming",
      selectedLocation: "all",
      selectedCategory: "all",
      showPastEvents: false,
      showSuggestModal: false,
      calendarBaseDate: new Date("2026-06-01T00:00:00Z"),
      events: MOCK_EVENTS.map(normaliseEvent),

      sectionStatus: {
        hero: { inProgress: true },

        summaryNext: { comingSoon: true },
        summaryUpcoming: { comingSoon: true },
        summaryThisWeek: { comingSoon: true },
        summaryPast: { comingSoon: true },

        upcoming: { comingSoon: true },
        filters: { comingSoon: true },
        featured: { comingSoon: true },
        thisWeek: { comingSoon: true },
        pastEvents: { comingSoon: true },
        suggestEvent: { comingSoon: true },
      },

      locationFilters: [
        { label: "All formats", value: "all" },
        { label: "Online", value: "online" },
        { label: "In person", value: "in-person" },
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

    filteredUpcomingEvents() {
      return this.filteredEvents
        .filter((event) => event.status === "upcoming" || event.status === "live")
        .sort((a, b) => a.startDate - b.startDate);
    },

    featuredEvent() {
      const featured = this.filteredUpcomingEvents.find((event) => event.featured);
      return featured || this.filteredUpcomingEvents[0] || null;
    },

    upcomingSoonEvents() {
      return this.filteredUpcomingEvents.slice(0, 3);
    },

    pastEvents() {
      return this.filteredEvents
        .filter((event) => event.status === "past")
        .sort((a, b) => b.startDate - a.startDate);
    },

    nextEventTitle() {
      return this.filteredUpcomingEvents[0]?.title || "No event planned";
    },

    nextEventDateText() {
      const nextEvent = this.filteredUpcomingEvents[0];
      if (!nextEvent) return "Nothing upcoming right now";
      return `${this.formatEventDate(nextEvent.startAt)} · ${this.formatEventTimeRange(nextEvent.startAt, nextEvent.endAt)}`;
    },

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
  },

  methods: {
    setActiveView(view) {
      this.activeView = view;
    },

    setLocationFilter(value) {
      this.selectedLocation = value;
    },

    setCategoryFilter(value) {
      this.selectedCategory = value;
    },

    toggleShowPast() {
      this.showPastEvents = !this.showPastEvents;
    },

    openSuggestEvent() {
      this.showSuggestModal = true;
    },

    closeSuggestEvent() {
      this.showSuggestModal = false;
    },

    markSectionDone(sectionKey) {
      if (!this.sectionStatus[sectionKey]) return;

      this.sectionStatus[sectionKey] = {
        ...this.sectionStatus[sectionKey],
        comingSoon: false,
        inProgress: false,
      };
    },

    markSectionComingSoon(sectionKey) {
      if (!this.sectionStatus[sectionKey]) return;

      this.sectionStatus[sectionKey] = {
        ...this.sectionStatus[sectionKey],
        comingSoon: true,
      };
    },

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
      };
    },
  },
};