import { computed } from 'vue';
import ConnectedDemoHeader from '../../connected-demo/ConnectedDemoHeader.vue';
import {
  connectedDemo as demo,
  previewAnnouncements,
  rsvpNova,
  setEventPlatform
} from '../../connected-demo/connectedDemoState.js';

import '../../connected-demo/connectedDemo.css';
import respawnLogo from './project-respawn-mark.png';

export default {
  name: 'CreatorEvents',

  components: {
    ConnectedDemoHeader
  },

  setup() {
    const going = computed(() => 42 + (demo.event.rsvp ? 1 : 0));

    const platforms = [
      { id: 'twitch', label: 'Twitch', icon: '▣' },
      { id: 'discord', label: 'Discord', icon: '☁' },
      { id: 'respawn', label: 'Project Respawn', icon: 'R' }
    ];

    const calendarDays = [
      {
        key: 'mon',
        label: 'MON 12',
        events: [
          { title: 'Monday Moments', time: '19:00', platform: '▣ Twitch', tone: 'cyan', top: '57%', height: '20%' }
        ]
      },
      { key: 'tue', label: 'TUE 13', events: [] },
      { key: 'wed', label: 'WED 14', events: [] },
      { key: 'thu', label: 'THU 15', events: [] },
      {
        key: 'fri',
        label: 'FRI 16',
        events: [
          { title: 'Friday Game Night', time: '19:30', platform: 'All Platforms', tone: 'purple', top: '50%', height: '20%' },
          { title: 'Community Tournament', time: '21:00', platform: 'All Platforms', tone: 'gold', top: '70%', height: '18%' }
        ]
      },
      { key: 'sat', label: 'SAT 17', events: [] },
      {
        key: 'sun',
        label: 'SUN 18',
        events: [
          { title: 'Creator Q&A', time: '18:00', platform: '☁ Discord', tone: 'blue', top: '56%', height: '20%' }
        ]
      }
    ];

    return {
      demo,
      going,
      platforms,
      respawnLogo,
      calendarDays,
      previewAnnouncements,
      rsvpNova,
      setEventPlatform
    };
  }
};
