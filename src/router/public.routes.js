const Home = () => import('../views/Home/Home.vue');
const About = () => import('../views/About/About.vue');
const Contact = () => import('../views/Contact/Contact.vue');
const PrivacyPolicy = () => import('../views/PrivacyPolicy/MainPrivacyPolicy.vue');
const TeamTryouts = () => import('../views/TeamTryouts/TeamTryouts.vue');
const Merch = () => import('../views/Merch/Merch.vue');
const Events = () => import('../views/Events/Events.vue');
const Checkout = () => import('../views/Checkout/Checkout.vue');
const Join = () => import('../views/Join/Join.vue');
const Account = () => import('../views/Account/Account.vue');
const UserHomepage = () => import('../views/UserHomepage/UserHomepage.vue');
const Applications = () => import('../views/Applications/Applications.vue');
const Bookings = () => import('../views/Bookings/Bookings.vue');
const Investors = () => import('../views/Investors/Investors.vue');
const InvestorDataRoom = () => import('../views/Investors/DataRoom/InvestorDataRoom.vue');
const Careers = () => import('../views/Careers/Careers.vue');
const Creators = () => import('../views/Creators/Creators.vue');
const Partners = () => import('../views/Partners/Partners.vue');

export default [
    // =========================================================
    // SWG TEST / TOOLS
    // =========================================================

    {
        path: '/SWG-EOF-test',
        name: 'SwgEofTest',
        meta: {
            requiresAuth: true,
            requiredGroups: ['BetaMember']
        },
        component: () =>
            import('../views/SwgEofTest/SwgEofTest.vue')
    },

    {
        path: '/swg-beyond-buff-builder',
        name: 'BeyondBuffBuilder',
        component: () =>
            import(
                '../views/SWG Beyond Buff Builder/SwgBeyondBuffBuilder.vue'
            )
    },

    // =========================================================
    // BOOKINGS
    // =========================================================

    {
        path: '/bookings',
        name: 'Bookings',
        component: Bookings
    },

    {
        path: '/bookings/invite/:invitationToken',
        name: 'BookingsInvite',
        component: Bookings,
        props: true
    },

    {
        path: '/bookings/:bookingTypeSlug',
        name: 'BookingsType',
        component: Bookings,
        props: true
    },

    {
        path: '/induction/book/:invitationToken',
        redirect: (to) => ({
            name: 'BookingsInvite',
            params: {
                invitationToken: to.params.invitationToken
            },
            query: to.query,
            hash: to.hash
        })
    },

    // =========================================================
    // PUBLIC PAGES
    // =========================================================

    {
        path: '/',
        name: 'Home',
        component: Home
    },

    {
        path: '/about',
        name: 'About',
        component: About
    },

    // =========================================================
    // INVESTORS
    // =========================================================

    {
        path: '/investors',
        name: 'Investors',
        component: Investors
    },

    {
        path: '/investors/data-room',
        name: 'InvestorDataRoom',
        component: InvestorDataRoom,
        meta: {
            requiresAuth: true,
            requiresInvestorAccess: true
        }
    },

    // =========================================================
    // CAREERS / CREATORS / PARTNERS
    // =========================================================

    {
        path: '/careers',
        name: 'Careers',
        component: Careers
    },

    {
        path: '/creators',
        name: 'Creators',
        component: Creators
    },

    {
        path: '/partners',
        name: 'Partners',
        component: Partners
    },

    // =========================================================
    // CONTACT / LEGAL
    // =========================================================

    {
        path: '/contact',
        name: 'Contact',
        component: Contact
    },

    {
        path: '/privacy-policy',
        name: 'LegalCentre',
        component: PrivacyPolicy
    },

    // =========================================================
    // JOIN / TEAM TRYOUTS
    // =========================================================

    {
        path: '/join-us',
        name: 'JoinUs',
        component: TeamTryouts
    },

    {
        path: '/team-tryouts',
        redirect: (to) => ({
            path: '/join-us',
            query: to.query,
            hash: to.hash
        })
    },

    // =========================================================
    // MERCH / CHECKOUT
    // =========================================================

    {
        path: '/merch',
        name: 'Merch',
        component: Merch
    },

    {
        path: '/checkout',
        name: 'Checkout',
        component: Checkout
    },

    // =========================================================
    // EVENTS
    // =========================================================

    {
        path: '/events',
        name: 'Events',
        component: Events
    },

    // =========================================================
    // ACCOUNT / MEMBERSHIP
    // =========================================================

    {
        path: '/join',
        name: 'Join',
        component: Join
    },

    {
        path: '/account',
        name: 'Account',
        component: Account
    },

    // =========================================================
    // APPLICATIONS
    // =========================================================

    {
        path: '/apply-now',
        name: 'Applications',
        component: Applications
    },

    {
        path: '/applications',
        redirect: (to) => ({
            path: '/apply-now',
            query: to.query,
            hash: to.hash
        })
    },

    {
        path: '/apply',
        redirect: (to) => ({
            path: '/apply-now',
            query: to.query,
            hash: to.hash
        })
    },

    // =========================================================
    // AUTHENTICATED USER HOME
    // =========================================================

    {
        path: '/home',
        name: 'UserHomepage',
        component: UserHomepage,
        meta: {
            requiresAuth: true
        }
    }
];