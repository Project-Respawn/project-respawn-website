import { ref, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'TeamTryouts',
  setup() {
    // Hero CTA: scroll to "How it works"
    const scrollToHowItWorks = () => {
      const el = document.getElementById('how-it-works');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    // TOC items
    const tocItems = ref([
      {
        id: 'toc-why',
        label: 'Why we’re building this',
        summary: 'Mission and confidence focus',
        targetId: 'why',
      },
      {
        id: 'toc-quests',
        label: 'Quest & progression system',
        summary: 'How quests and levels work',
        targetId: 'quests',
      },
      {
        id: 'toc-therapists-trainers',
        label: 'Therapists & trainers',
        summary: 'Professional partnerships',
        targetId: 'therapists-trainers',
      },
      {
        id: 'toc-dashboard',
        label: 'Creator dashboard',
        summary: 'Twitch + Discord tools',
        targetId: 'dashboard',
      },
      {
        id: 'toc-tracks',
        label: 'Two ways to partner',
        summary: 'Competitive vs community',
        targetId: 'tracks',
      },
      {
        id: 'toc-faq',
        label: 'FAQ',
        summary: 'Common questions',
        targetId: 'faq',
      },
    ]);

    const scrollToSection = (targetId) => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    // Steps data (for "How it works")
    const steps = ref([
      {
        number: '01',
        title: 'Apply',
        copy: 'Apply to join as a streamer partner through our application process.',
      },
      {
        number: '02',
        title: 'Get onboarded',
        copy: 'If accepted, we help connect your Twitch and Discord setup and onboard you into Project Respawn.',
      },
      {
        number: '03',
        title: 'Access the dashboard and system',
        copy: 'You get access to the creator dashboard and begin testing the tools, quests, and community systems that fit your content.',
      },
      {
        number: '04',
        title: 'Run the experience',
        copy: 'Your viewers take part through quests, prompts, progression, and cross-platform engagement designed to encourage participation and confidence-building.',
      },
    ]);

    // IntersectionObserver to animate steps
    const visibleSteps = ref([]);
    const stepRefs = [];
    let observer = null;

    const setStepRefs = (el) => {
      if (el && !stepRefs.includes(el)) {
        stepRefs.push(el);
      }
    };

    const observeSteps = () => {
      if (typeof IntersectionObserver === 'undefined') return;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const stepNumber = entry.target.dataset.step;
            if (!stepNumber) return;

            if (entry.isIntersecting) {
              if (!visibleSteps.value.includes(stepNumber)) {
                visibleSteps.value.push(stepNumber);
              }
            }
          });
        },
        {
          threshold: 0.3,
        },
      );

      stepRefs.forEach((el) => observer.observe(el));
    };

    // Tabs for "Two ways to partner"
    const activeTrack = ref('community'); // default to community / social confidence

    const setTrack = (trackKey) => {
      activeTrack.value = trackKey;
    };

    // FAQ accordion
    const openFaqId = ref(null);

    const faqItems = ref([
      {
        id: 'bot',
        question: 'Is this just a bot?',
        answer:
          'No. Bot tools are only one part of the system. Project Respawn also includes a wider viewer experience, creator dashboard, quests, progression, and community participation systems designed to continue beyond the stream itself.',
      },
      {
        id: 'viewer-side',
        question: 'What does the viewer side actually do?',
        answer:
          'Viewers join Project Respawn, take part in quests and participation-based activities, gain progression over time, and become part of a system meant to encourage stronger engagement and confidence-building.',
      },
      {
        id: 'dashboard-free',
        question: 'Is the dashboard free?',
        answer:
          'Yes. Accepted streamers in beta get access to the Project Respawn Twitch + Discord tools and dashboard at no cost. We don’t plan to charge creators for these tools.',
      },
      {
        id: 'discord-required',
        question: 'Do I need a Discord server to apply?',
        answer:
          'No — but a Discord community will help you get the most out of the platform, especially as we develop more cross-platform tools.',
      },
      {
        id: 'only-gaming',
        question: 'Is this only for gaming creators?',
        answer:
          'Gaming and community-focused creators are the most natural fit right now, but anyone can apply if they feel aligned with the mission and format.',
      },
      {
        id: 'only-community',
        question: 'Is this only for community-focused creators?',
        answer:
          'No. Project Respawn is built for both competitive creators and community-first streamers. You do not need to be known for support-focused content to be a fit if your audience would benefit from stronger engagement, continuity, and shared progression.',
      },
      {
        id: 'finished',
        question: 'Is Project Respawn finished?',
        answer:
          'Not yet. We’re in active development and beta. Features may change as we learn from our founding streamer partners.',
      },
      {
        id: 'tracks',
        question: 'Can I apply for both competitive and social confidence tracks?',
        answer:
          'Yes. You can explain that in your application and we’ll work out the best fit together.',
      },
      {
        id: 'payments',
        question: 'Will I get paid as a partner?',
        answer:
          'There are no guaranteed payments at this stage. Our long-term goal is to build an engagement-based model where, if campaigns and partnerships generate value through Project Respawn, that value can be shared with the creators and communities who drive it.',
      },
    ]);

    const toggleFaq = (id) => {
      openFaqId.value = openFaqId.value === id ? null : id;
    };

    onMounted(() => {
      observeSteps();
    });

    onBeforeUnmount(() => {
      if (observer) {
        observer.disconnect();
      }
    });

    return {
      // hero
      scrollToHowItWorks,
      // TOC
      tocItems,
      scrollToSection,
      // steps
      steps,
      setStepRefs,
      visibleSteps,
      // tabs
      activeTrack,
      setTrack,
      // faq
      faqItems,
      openFaqId,
      toggleFaq,
    };
  },
};