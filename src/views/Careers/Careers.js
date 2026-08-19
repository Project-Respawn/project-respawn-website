import { reactive, ref } from 'vue';
import respawnLogo from './assets/project-respawn-mark.png';

export default {
  name: 'Careers',

  setup() {
    const opportunityPaths = [
      {
        key: 'team',
        icon: '⌘',
        title: 'Join the team',
        copy: 'Engineering, product, design, data, community, operations, marketing and partnerships.'
      },
      {
        key: 'creator',
        icon: '◉',
        title: 'Creator & content collaboration',
        copy: 'Creators, presenters, editors, designers and people who can help tell the Project Respawn story.'
      },
      {
        key: 'research',
        icon: '⌁',
        title: 'Research & social confidence',
        copy: 'Researchers, academics, therapists and organisations interested in social confidence and community.'
      },
      {
        key: 'esports',
        icon: '✦',
        title: 'Esports',
        copy: 'Players, coaches, analysts, team operations and other competitive gaming specialists.'
      },
      {
        key: 'commercial',
        icon: '↗',
        title: 'Commercial partnerships',
        copy: 'Brands, publishers, agencies and businesses interested in collaborating with Project Respawn.'
      },
      {
        key: 'other',
        icon: '+',
        title: 'Something else',
        copy: 'You think you can help build something here, but none of the categories above quite fits.'
      }
    ];

    const selectedArea = ref('');

    const form = reactive({
      name: '',
      email: '',
      profile: '',
      contribution: '',
      whyRespawn: ''
    });

    function selectArea(key) {
      selectedArea.value = key;
      document.getElementById('introduce-yourself')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }

    function sendIntroduction() {
      const selected = opportunityPaths.find((item) => item.key === selectedArea.value);
      const area = selected?.title || 'General interest';

      const subject = encodeURIComponent(`Project Respawn | Get Involved | ${area}`);
      const body = encodeURIComponent(
`Hello Project Respawn,

I would like to introduce myself and express an interest in getting involved.

ABOUT ME

Name: ${form.name}
Email: ${form.email}
LinkedIn / Portfolio: ${form.profile || 'Not provided'}

AREA OF INTEREST

${area}

WHAT I WOULD LIKE TO CONTRIBUTE

${form.contribution}

WHY PROJECT RESPAWN?

${form.whyRespawn || 'Not provided'}

I understand that this is an expression of interest and is not an application for a currently advertised vacancy unless stated otherwise.

Kind regards,

${form.name}
`
      );

      window.location.href =
        `mailto:n.grefsheim@projectrespawn.com?subject=${subject}&body=${body}`;
    }

    return {
      respawnLogo,
      opportunityPaths,
      selectedArea,
      form,
      selectArea,
      sendIntroduction
    };
  }
};
