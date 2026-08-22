<!-- src/features/esports/views/TournamentDetail.vue -->

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const tournamentId = computed(() => {
    return route.params.tournamentId || '';
});

const tournamentName = computed(() => {
    switch (tournamentId.value) {
        case 'respawn-community-cup':
            return 'Respawn Community Cup';

        case 'community-choice':
            return 'Community Choice Tournament';

        default:
            return 'Project Respawn Tournament';
    }
});
</script>

<template>
    <main class="tournament-page">

        <!-- ====================================================
             BACKGROUND
        ===================================================== -->

        <div class="page-background"></div>

        <!-- ====================================================
             CONTENT
        ===================================================== -->

        <section class="placeholder">

            <RouterLink
                to="/esports"
                class="back-link"
            >
                ← Back to Esports
            </RouterLink>

            <div class="logo-wrapper">
                <img
                    src="@/assets/respawn-logo.png"
                    alt="Project Respawn"
                />
            </div>

            <span class="eyebrow">
                PROJECT RESPAWN ESPORTS
            </span>

            <h1>
                {{ tournamentName }}
            </h1>

            <div class="status">
                COMING SOON
            </div>

            <p>
                Tournament details, registration,
                rules, schedules and competition
                information will appear here soon.
            </p>

            <div class="divider"></div>

            <span class="season">
                SEASON ZERO • 2026
            </span>

            <RouterLink
                to="/esports"
                class="button"
            >
                Explore Project Respawn Esports
                <span>→</span>
            </RouterLink>

        </section>

    </main>
</template>

<style scoped>
/* ============================================================
   PAGE
============================================================ */

.tournament-page {
    min-height: 100vh;

    position: relative;

    display: flex;

    align-items: center;
    justify-content: center;

    overflow: hidden;

    padding: 80px 20px;

    color: #ffffff;

    background: #050607;
}


/* ============================================================
   BACKGROUND
============================================================ */

.page-background {
    position: absolute;

    inset: 0;

    background:
        linear-gradient(
            rgba(3, 4, 7, 0.82),
            rgba(3, 4, 7, 0.94)
        ),
        url("@/assets/esports/esports-background.png")
            center / cover;

    transform: scale(1.03);
}


.page-background::after {
    content: "";

    position: absolute;

    inset: 0;

    background:
        radial-gradient(
            circle at 50% 35%,
            rgba(139, 92, 246, 0.18),
            transparent 35%
        ),
        radial-gradient(
            circle at 70% 70%,
            rgba(97, 255, 24, 0.05),
            transparent 30%
        );
}


/* ============================================================
   PLACEHOLDER
============================================================ */

.placeholder {
    width: min(750px, 100%);

    position: relative;

    z-index: 2;

    padding: 55px 45px;

    text-align: center;

    border:
        1px solid
        rgba(139, 92, 246, 0.35);

    background:
        rgba(6, 7, 10, 0.88);

    backdrop-filter:
        blur(18px);

    box-shadow:
        0 30px 100px
        rgba(0, 0, 0, 0.55);
}


/* ============================================================
   BACK
============================================================ */

.back-link {
    position: absolute;

    top: 20px;
    left: 22px;

    color: #8f939d;

    font-size: 0.7rem;
    font-weight: 700;

    letter-spacing: 0.06em;

    text-decoration: none;

    text-transform: uppercase;

    transition:
        color 0.2s ease;
}


.back-link:hover {
    color: #61ff18;
}


/* ============================================================
   LOGO
============================================================ */

.logo-wrapper {
    width: 150px;
    height: 150px;

    margin:
        0 auto 20px;

    position: relative;

    display: grid;

    place-items: center;
}


.logo-wrapper::before {
    content: "";

    position: absolute;

    inset: 20%;

    border-radius: 50%;

    background:
        rgba(139, 92, 246, 0.25);

    filter: blur(30px);
}


.logo-wrapper img {
    width: 100%;
    height: 100%;

    position: relative;

    object-fit: contain;

    filter:
        drop-shadow(
            0 0 25px
            rgba(139, 92, 246, 0.3)
        );
}


/* ============================================================
   TEXT
============================================================ */

.eyebrow {
    display: block;

    margin-bottom: 10px;

    color: #8b5cf6;

    font-size: 0.68rem;
    font-weight: 800;

    letter-spacing: 0.18em;

    text-transform: uppercase;
}


h1 {
    margin:
        0 0 18px;

    font-size:
        clamp(
            2.3rem,
            6vw,
            4.5rem
        );

    line-height: 0.95;

    text-transform: uppercase;
}


.status {
    display: inline-block;

    margin-bottom: 22px;

    padding:
        7px 13px;

    border:
        1px solid
        rgba(97, 255, 24, 0.45);

    color: #61ff18;

    font-size: 0.66rem;
    font-weight: 800;

    letter-spacing: 0.12em;
}


.placeholder p {
    max-width: 520px;

    margin:
        0 auto;

    color: #999da7;

    font-size: 0.95rem;

    line-height: 1.7;
}


/* ============================================================
   DIVIDER
============================================================ */

.divider {
    width: 70px;
    height: 1px;

    margin:
        28px auto;

    background: #8b5cf6;
}


.season {
    display: block;

    margin-bottom: 25px;

    color: #696d77;

    font-size: 0.65rem;

    letter-spacing: 0.15em;
}


/* ============================================================
   BUTTON
============================================================ */

.button {
    display: inline-flex;

    align-items: center;

    gap: 10px;

    padding:
        14px 22px;

    border:
        1px solid #61ff18;

    background: #61ff18;

    color: #061000;

    font-size: 0.72rem;
    font-weight: 800;

    letter-spacing: 0.04em;

    text-decoration: none;

    text-transform: uppercase;

    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
}


.button:hover {
    transform:
        translateY(-2px);

    box-shadow:
        0 0 25px
        rgba(97, 255, 24, 0.2);
}


/* ============================================================
   MOBILE
============================================================ */

@media (max-width: 600px) {

    .placeholder {
        padding:
            65px 22px 40px;
    }


    .logo-wrapper {
        width: 115px;
        height: 115px;
    }

}
</style>