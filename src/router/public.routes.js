// src/router/public.routes.js

import Home from '../views/Home/Home.vue';
import About from '../views/About/About.vue';
import Contact from '../views/Contact/Contact.vue';
import PrivacyPolicy from '../views/PrivacyPolicy/MainPrivacyPolicy.vue';
import TeamTryouts from '../views/TeamTryouts/TeamTryouts.vue';
import Merch from '../views/Merch/Merch.vue';
import Events from '../views/Events/Events.vue';
import Checkout from '../views/Checkout/Checkout.vue';
import Join from '../views/Join/Join.vue';
import Account from '../views/Account/Account.vue';
import UserHomepage from '../views/UserHomepage/UserHomepage.vue';
import Applications from '../views/Applications/Applications.vue';
import Bookings from '../views/Bookings/Bookings.vue';
import Investors from '../views/Investors/Investors.vue';
import InvestorDataRoom from '../views/Investors/DataRoom/InvestorDataRoom.vue';
import Careers from '../views/Careers/Careers.vue';
import Creators from '../views/Creators/Creators.vue';
import Partners from '../views/Partners/Partners.vue';

export default [
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
