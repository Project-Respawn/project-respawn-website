import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import respawnLogo from './assets/project-respawn-mark.png';

import AboutProjectRespawn from './tabs/AboutProjectRespawn.vue';
import OurVision from './tabs/OurVision.vue';
import GameDevelopers from './tabs/GameDevelopers.vue';
import Partners from './tabs/Partners.vue';
import ResearchImpact from './tabs/ResearchImpact.vue';

const tabConfig = [
  {
    id: 'about',
    label: 'About Project Respawn',
    component: AboutProjectRespawn,
    kicker: 'About us',
    lead: 'Project Respawn is building a connected gaming, community and creator ecosystem designed to help people participate, pursue the things they care about and make connection feel easier.',
    cardLabel: 'THE MISSION',
    cardTitle: 'Gaming can be more than entertainment.',
    cardCopy: 'We believe shared interests can create lower-pressure reasons to take part, meet people and build momentum — online and beyond the screen.',
    path: ['Find your thing', 'Take part', 'Build momentum'],
    primary: { label: 'For creators', to: { path: '/join-us', hash: '#how-it-works' } },
    secondary: { label: 'Help build Project Respawn', to: '/careers' }
  },
  {
    id: 'vision',
    label: 'Our Vision',
    component: OurVision,
    kicker: 'Where we are going',
    lead: 'We are building towards one place that connects the games you play, the goals you choose, the people around you and the time you actually have.',
    cardLabel: 'THE WEEKLY QUESTION',
    cardTitle: 'What do you want to work on this week?',
    cardCopy: 'Fitness, Social or Gaming. You choose the focus. Your Companion helps turn that choice into realistic progress without deciding what your life should look like.',
    path: ['Choose', 'Plan', 'Experience'],
    primary: { label: 'Join Project Respawn', to: '/join-us' },
    secondary: { label: 'For game developers', to: { path: '/about', query: { tab: 'games' } } }
  },
  {
    id: 'games',
    label: 'Game Developers',
    component: GameDevelopers,
    kicker: 'For studios & publishers',
    lead: 'Your players already play more than one game. Project Respawn is being built to connect the journey between them.',
    cardLabel: 'GAMES COMPANION',
    cardTitle: 'Put your game inside the player’s wider gaming life.',
    cardCopy: 'Help players remember what they were doing, discover what fits their time, reconnect after a break and find people working towards the same goals.',
    path: ['Integrate', 'Re-engage', 'Grow'],
    primary: { label: 'Talk to us about your game', to: '/contact' },
    secondary: { label: 'See our vision', to: { path: '/about', query: { tab: 'vision' } } }
  },
  {
    id: 'partners',
    label: 'Partners',
    component: Partners,
    kicker: 'Build with us',
    lead: 'Creators, brands, trainers, community organisations and other partners can become part of the same connected Project Respawn ecosystem.',
    cardLabel: 'PARTNERSHIPS',
    cardTitle: 'Different partners. One connected experience.',
    cardCopy: 'We want partnerships to make Project Respawn more useful to the people using it — not turn the platform into a wall of disconnected sponsorships.',
    path: ['Contribute', 'Connect', 'Create value'],
    primary: { label: 'Work with Project Respawn', to: '/contact' },
    secondary: { label: 'For creators', to: { path: '/join-us', hash: '#how-it-works' } }
  },
  {
    id: 'research',
    label: 'Research & Impact',
    component: ResearchImpact,
    kicker: 'Evidence before claims',
    lead: 'We want Project Respawn to make a real difference. We also believe wellbeing claims should be tested properly, not assumed because an idea sounds promising.',
    cardLabel: 'CURRENT POSITION',
    cardTitle: 'We believe this is worth exploring. We have not proved it yet.',
    cardCopy: 'Project Respawn currently has no research demonstrating that the platform reduces social anxiety or improves mental-health outcomes. We want to investigate that transparently.',
    path: ['Build responsibly', 'Research', 'Learn'],
    primary: { label: 'Discuss research with us', to: '/contact' },
    secondary: { label: 'Read our vision', to: { path: '/about', query: { tab: 'vision' } } }
  }
];

export default {
  name: 'About',
  components: { AboutProjectRespawn, OurVision, GameDevelopers, Partners, ResearchImpact },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const validIds = new Set(tabConfig.map(tab => tab.id));

    const activeTab = computed(() => {
      const requested = String(route.query.tab || 'about').toLowerCase();
      return validIds.has(requested) ? requested : 'about';
    });

    const activeTabMeta = computed(
      () => tabConfig.find(tab => tab.id === activeTab.value) || tabConfig[0]
    );

    const activeComponent = computed(() => activeTabMeta.value.component);

    function selectTab(id) {
      const nextQuery = { ...route.query };
      if (id === 'about') delete nextQuery.tab;
      else nextQuery.tab = id;
      router.push({ path: route.path, query: nextQuery });
    }

    return { respawnLogo, tabs: tabConfig, activeTab, activeTabMeta, activeComponent, selectTab };
  }
};
