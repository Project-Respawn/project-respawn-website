import respawnLogo from './assets/project-respawn-mark.png';

export default {
  name: 'About',

  setup() {
    const journey = [
      {
        number: '01',
        title: 'Discover',
        copy: 'Find people, creators, games and communities that already feel relevant to you.'
      },
      {
        number: '02',
        title: 'Join safely',
        copy: 'Enter through familiar interests instead of being pushed straight into high-pressure social situations.'
      },
      {
        number: '03',
        title: 'Participate',
        copy: 'Take part in events, quests, streams and community activity at a level that feels manageable.'
      },
      {
        number: '04',
        title: 'Build confidence',
        copy: 'Repeat small wins, see your progress and gradually make participation feel more normal.'
      },
      {
        number: '05',
        title: 'Progress',
        copy: 'Use achievements, streaks and community milestones to make improvement visible over time.'
      }
    ];

    const creatorTools = [
      { icon: '◉', title: 'Twitch + Discord', copy: 'Connected creator and community management.' },
      { icon: '▣', title: 'Overlays', copy: 'One flexible visual system for stream experiences.' },
      { icon: '▤', title: 'Events', copy: 'Coordinate community activity across platforms.' },
      { icon: '✦', title: 'Rewards', copy: 'Give participation visible value and progression.' },
      { icon: '⌁', title: 'Analytics', copy: 'Understand what is actually happening in the community.' },
      { icon: '↻', title: 'Automation', copy: 'Reduce repetitive creator work and keep communities moving.' }
    ];

    const feedbackLoop = [
      'Observe',
      'Understand',
      'Recommend',
      'Act',
      'Measure',
      'Learn'
    ];

    return {
      respawnLogo,
      journey,
      creatorTools,
      feedbackLoop
    };
  }
};
