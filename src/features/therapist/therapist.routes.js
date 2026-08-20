import TherapistLayout from './layouts/TherapistLayout/TherapistLayout.vue';
import TherapistDashboard from './views/TherapistDashboard/TherapistDashboard.vue';
import TherapistClients from './views/Clients/TherapistClients.vue';
import TherapistClientDetail from './views/ClientDetail/TherapistClientDetail.vue';
import TherapistQuests from './views/Quests/TherapistQuests.vue';
import TherapistQuestBuilder from './views/QuestBuilder/TherapistQuestBuilder.vue';
import TherapistInsights from './views/Insights/TherapistInsights.vue';
import TherapistReports from './views/Reports/TherapistReports.vue';
import TherapistSettings from './views/Settings/TherapistSettings.vue';

const therapistRoutes = [
  {
    path: '/therapist',
    component: TherapistLayout,
    children: [
      { path: '', name: 'TherapistDashboard', component: TherapistDashboard },
      { path: 'clients', name: 'TherapistClients', component: TherapistClients },
      { path: 'clients/:clientId', name: 'TherapistClientDetail', component: TherapistClientDetail },
      { path: 'clients/:clientId/quests', name: 'TherapistClientQuests', component: TherapistQuests },
      { path: 'clients/:clientId/insights', name: 'TherapistClientInsights', component: TherapistInsights },
      { path: 'clients/:clientId/reports', name: 'TherapistClientReports', component: TherapistReports },
      { path: 'quests', name: 'TherapistQuests', component: TherapistQuests },
      { path: 'quests/new', name: 'TherapistQuestBuilder', component: TherapistQuestBuilder },
      { path: 'insights', name: 'TherapistInsights', component: TherapistInsights },
      { path: 'reports', name: 'TherapistReports', component: TherapistReports },
      { path: 'settings', name: 'TherapistSettings', component: TherapistSettings },
    ],
  },
];

export default therapistRoutes;
