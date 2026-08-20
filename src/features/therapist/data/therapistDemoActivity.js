export const therapistDemoActivity = [
  /* =========================================================
     ALEX MORGAN
  ========================================================= */

  {
    id: "alex-activity-1",
    clientId: "alex-morgan",
    date: "2026-08-16",
    dayLabel: "Saturday",
    dateLabel: "16 Aug",
    time: "18:42",

    type: "quest",
    typeLabel: "Quest completed",
    tone: "green",
    icon: "✓",

    title: 'Completed "Join a community activity"',
    detail:
      "Alex completed the assigned social activity and remained for the full session.",

    quest: "Join a community activity",
    points: 250,

    confidenceBefore: 4,
    confidenceAfter: 7,

    reflection:
      "I nearly cancelled, but once I joined I actually enjoyed it.",

    source: "Therapist assigned quest",
    status: "Completed",
    statusTone: "green",

    locked: false,
  },

  {
    id: "alex-activity-2",
    clientId: "alex-morgan",
    date: "2026-08-16",
    dayLabel: "Saturday",
    dateLabel: "16 Aug",
    time: "18:51",

    type: "reflection",
    typeLabel: "Reflection added",
    tone: "purple",
    icon: "“",

    title: "Added a reflection after completing a quest",

    detail:
      "Alex reflected on how the activity felt compared with their expectations.",

    quest: "Join a community activity",

    reflection:
      "I was expecting to feel uncomfortable the whole time, but after the first few minutes it became much easier.",

    source: "Client reflection",
    status: "Shared",
    statusTone: "purple",

    locked: false,
  },

  {
    id: "alex-activity-3",
    clientId: "alex-morgan",
    date: "2026-08-16",
    dayLabel: "Saturday",
    dateLabel: "16 Aug",
    time: "18:55",

    type: "discussion",
    typeLabel: "Discussion point added",
    tone: "blue",
    icon: "💬",

    title: "Added something to discuss next session",

    detail:
      "Alex added a topic they would like to talk about during their next therapy session.",

    discussionPoint:
      "I left the community event early and I'm not really sure why.",

    source: "Client discussion point",
    status: "3 discussion points",
    statusTone: "blue",

    locked: false,
  },

  {
    id: "alex-activity-4",
    clientId: "alex-morgan",
    date: "2026-08-14",
    dayLabel: "Thursday",
    dateLabel: "14 Aug",
    time: "20:12",

    type: "quest",
    typeLabel: "Quest completed",
    tone: "green",
    icon: "✓",

    title: 'Completed "Start one conversation"',

    detail:
      "Alex completed the assigned conversation quest.",

    quest: "Start one conversation",
    points: 150,

    confidenceBefore: 3,
    confidenceAfter: 5,

    reflection:
      "Starting it was harder than I expected, but the conversation itself was okay.",

    source: "Therapist assigned quest",
    status: "Completed",
    statusTone: "green",

    locked: false,
  },

  {
    id: "alex-activity-5",
    clientId: "alex-morgan",
    date: "2026-08-14",
    dayLabel: "Thursday",
    dateLabel: "14 Aug",
    time: "20:15",

    type: "confidence",
    typeLabel: "Confidence check-in",
    tone: "orange",
    icon: "◇",

    title: "Confidence changed after completing an activity",

    detail:
      "Alex recorded confidence before and after the social interaction.",

    confidenceBefore: 3,
    confidenceAfter: 5,

    source: "Confidence check-in",
    status: "Improved",
    statusTone: "green",

    locked: false,
  },

  {
    id: "alex-activity-6",
    clientId: "alex-morgan",
    date: "2026-08-12",
    dayLabel: "Tuesday",
    dateLabel: "12 Aug",
    time: "19:06",

    type: "quest",
    typeLabel: "Quest update",
    tone: "orange",
    icon: "!",

    title: 'Skipped "Attend a larger group activity"',

    detail:
      "The activity was not completed on this attempt.",

    quest: "Attend a larger group activity",

    reflection:
      "I didn't feel ready and decided not to go.",

    source: "Therapist assigned quest",
    status: "Skipped",
    statusTone: "orange",

    locked: false,
  },

  {
    id: "alex-activity-7",
    clientId: "alex-morgan",
    date: "2026-08-11",
    dayLabel: "Monday",
    dateLabel: "11 Aug",
    time: "21:03",

    type: "confidence",
    typeLabel: "Confidence check-in",
    tone: "orange",
    icon: "◇",

    title: "Weekly confidence check-in",

    detail:
      "Alex recorded how confident they felt about social activities that week.",

    confidenceBefore: 4,
    confidenceAfter: null,

    source: "Confidence check-in",
    status: "Recorded",
    statusTone: "blue",

    locked: false,
  },

  {
    id: "alex-activity-8",
    clientId: "alex-morgan",
    date: "2026-08-11",
    dayLabel: "Monday",
    dateLabel: "11 Aug",
    time: "21:10",

    type: "reflection",
    typeLabel: "Reflection added",
    tone: "purple",
    icon: "“",

    title: "Added a weekly reflection",

    detail:
      "Alex reflected on the previous week's progress.",

    reflection:
      "I felt less nervous than last week and stayed longer than I normally would.",

    source: "Client reflection",
    status: "Shared",
    statusTone: "purple",

    locked: false,
  },

  {
    id: "alex-activity-9",
    clientId: "alex-morgan",
    date: "2026-08-10",
    dayLabel: "Sunday",
    dateLabel: "10 Aug",
    time: "17:40",

    type: "community",
    typeLabel: "Community activity",
    tone: "blue",
    icon: "⌁",

    title: "Project Respawn community activity",

    detail:
      "Community and gaming participation data is not currently shared with this therapist.",

    permission: "community-activity",

    source: "Project Respawn activity",

    locked: true,
  },

  /* =========================================================
     SARAH CHEN
  ========================================================= */

  {
    id: "sarah-activity-1",
    clientId: "sarah-chen",
    date: "2026-08-18",
    dayLabel: "Monday",
    dateLabel: "18 Aug",
    time: "19:15",

    type: "quest",
    typeLabel: "Quest completed",
    tone: "green",
    icon: "✓",

    title: 'Completed "Complete one planned activity"',

    detail:
      "Sarah completed one planned activity before her next session.",

    quest: "Complete one planned activity",
    points: 200,

    confidenceBefore: 5,
    confidenceAfter: 6,

    reflection:
      "It felt more manageable once I had a plan.",

    source: "Therapist assigned quest",
    status: "Completed",
    statusTone: "green",

    locked: false,
  },

  {
    id: "sarah-activity-2",
    clientId: "sarah-chen",
    date: "2026-08-18",
    dayLabel: "Monday",
    dateLabel: "18 Aug",
    time: "19:20",

    type: "reflection",
    typeLabel: "Reflection added",
    tone: "purple",
    icon: "“",

    title: "Weekly reflection added",

    reflection:
      "I noticed I felt calmer because I knew what I wanted to do before I arrived.",

    source: "Client reflection",
    status: "Shared",
    statusTone: "purple",

    locked: false,
  },

  {
    id: "sarah-activity-3",
    clientId: "sarah-chen",
    date: "2026-08-17",
    dayLabel: "Sunday",
    dateLabel: "17 Aug",
    time: "14:05",

    type: "discussion",
    typeLabel: "Discussion point added",
    tone: "blue",
    icon: "💬",

    title: "Added something to discuss next session",

    discussionPoint:
      "Why does planning ahead make some situations easier but others more stressful?",

    source: "Client discussion point",
    status: "1 discussion point",
    statusTone: "blue",

    locked: false,
  },

  /* =========================================================
     JAMIE WILSON
  ========================================================= */

  {
    id: "jamie-activity-1",
    clientId: "jamie-wilson",
    date: "2026-08-18",
    dayLabel: "Monday",
    dateLabel: "18 Aug",
    time: "09:10",

    type: "quest",
    typeLabel: "Quest overdue",
    tone: "red",
    icon: "!",

    title: '"Add a weekly reflection" became overdue',

    detail:
      "No completion or reflection has been recorded yet.",

    quest: "Add a weekly reflection",

    source: "Therapist assigned quest",
    status: "Overdue",
    statusTone: "red",

    locked: false,
  },

  {
    id: "jamie-activity-2",
    clientId: "jamie-wilson",
    date: "2026-08-16",
    dayLabel: "Saturday",
    dateLabel: "16 Aug",
    time: "16:30",

    type: "confidence",
    typeLabel: "Confidence check-in",
    tone: "orange",
    icon: "◇",

    title: "Confidence check-in recorded",

    confidenceBefore: 4,
    confidenceAfter: null,

    source: "Confidence check-in",
    status: "Recorded",
    statusTone: "blue",

    locked: false,
  },

  {
    id: "jamie-activity-3",
    clientId: "jamie-wilson",
    date: "2026-08-15",
    dayLabel: "Friday",
    dateLabel: "15 Aug",
    time: "20:08",

    type: "community",
    typeLabel: "Community activity",
    tone: "blue",
    icon: "⌁",

    title: "Community participation",

    detail:
      "Community and gaming participation data is not currently shared with this therapist.",

    permission: "community-activity",

    source: "Project Respawn activity",

    locked: true,
  },

  /* =========================================================
     CHRIS TAYLOR
  ========================================================= */

  {
    id: "chris-activity-1",
    clientId: "chris-taylor",
    date: "2026-08-13",
    dayLabel: "Wednesday",
    dateLabel: "13 Aug",
    time: "18:00",

    type: "quest",
    typeLabel: "Quest assigned",
    tone: "blue",
    icon: "+",

    title: 'Assigned "Complete one planned activity"',

    detail:
      "The quest has been assigned but no client activity has been recorded yet.",

    quest: "Complete one planned activity",
    points: 200,

    source: "Therapist assigned quest",
    status: "Awaiting activity",
    statusTone: "neutral",

    locked: false,
  },

  {
    id: "chris-activity-2",
    clientId: "chris-taylor",
    date: "2026-08-12",
    dayLabel: "Tuesday",
    dateLabel: "12 Aug",
    time: "17:42",

    type: "reflection",
    typeLabel: "Reflection",
    tone: "purple",
    icon: "“",

    title: "No new reflections submitted",

    detail:
      "Chris has not submitted a new reflection since the previous session.",

    source: "Client activity",
    status: "No recent activity",
    statusTone: "red",

    locked: false,
  },
];