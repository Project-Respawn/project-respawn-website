// src/router/public.routes.js

import Home from '../views/Home/Home.vue';
import About from '../views/About/About.vue';
import Contact from '../views/Contact/Contact.vue';
import PrivacyPolicy from '../views/PrivacyPolicy/PrivacyPolicy.vue';
import TeamTryouts from '../views/TeamTryouts/TeamTryouts.vue';
import Merch from '../views/Merch/Merch.vue';
import Events from '../views/Events/Events.vue';
import Checkout from '../views/Checkout/Checkout.vue';
import Join from '../views/Join/Join.vue';
import Account from '../views/Account/Account.vue';
import Roles from '../views/About/Roles/Roles.vue';
import UserHomepage from '../views/UserHomepage/UserHomepage.vue';
import Applications from '../views/Applications/Applications.vue';
import Bookings from '../views/Bookings/Bookings.vue';
import Investors from '../views/Investors/Investors.vue';

export default [
    { path: '/bookings', name: 'Bookings', component: Bookings },
    { path: '/bookings/invite/:invitationToken', name: 'BookingsInvite', component: Bookings, props: true },
    { path: '/bookings/:bookingTypeSlug', name: 'BookingsType', component: Bookings, props: true },
    { path: '/induction/book/:invitationToken', redirect: (to) => ({ name: 'BookingsInvite', params: { invitationToken: to.params.invitationToken }, query: to.query, hash: to.hash }) },

    { path: '/', component: Home },

    { path: '/about', component: About },

    { path: '/investors', name: 'Investors', component: Investors },

    { path: '/about/roles', component: Roles },

    { path: '/contact', component: Contact },

    { path: '/privacy-policy', component: PrivacyPolicy },

    { path: '/join-us', name: 'JoinUs', component: TeamTryouts },

    { path: '/team-tryouts', redirect: (to) => ({ path: '/join-us', query: to.query, hash: to.hash }) },

    { path: '/merch', component: Merch },

    { path: '/checkout', component: Checkout },

    { path: '/events', component: Events },

    { path: '/join', component: Join },

    { path: '/account', component: Account },

    {
        path: '/apply-now',
        name: 'Applications',
        component: Applications
    },

    { path: '/applications', redirect: (to) => ({ path: '/apply-now', query: to.query, hash: to.hash }) },

    { path: '/apply', redirect: (to) => ({ path: '/apply-now', query: to.query, hash: to.hash }) },

    {
        path: '/home',
        name: 'UserHomepage',
        component: UserHomepage,
        meta: {
            requiresAuth: true
        }
    }

];
