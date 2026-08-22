<!-- src/features/esports/views/LeagueOfLegendsTeam.vue -->

<script setup>
import { computed } from 'vue';

// ============================================================
// FRONTEND DEMO DATA
// ============================================================
//
// Temporary frontend-only data.
//
// Later this can be replaced by:
// - Admin-managed roster
// - Community objective progress
// - Fixtures / results backend
// - Player profiles
//
// ============================================================

const team = {
    game: 'League of Legends',
    season: 'Season Zero',
    year: 2026,
    status: 'Forming',
    region: 'United Kingdom',
    objective: {
        current: 0,
        target: 200,
        label: 'Community Members',
    },
};


// ============================================================
// ROSTER
// ============================================================
//
// We know the roster privately, but public identities remain
// locked until the community objective is completed.
//
// ============================================================

const roster = [
    {
        role: 'TOP',
        icon: '◆',
        playerName: null,
        locked: true,
    },
    {
        role: 'JUNGLE',
        icon: '◇',
        playerName: null,
        locked: true,
    },
    {
        role: 'MID',
        icon: '◆',
        playerName: null,
        locked: true,
    },
    {
        role: 'ADC',
        icon: '◇',
        playerName: null,
        locked: true,
    },
    {
        role: 'SUPPORT',
        icon: '◆',
        playerName: null,
        locked: true,
    },
];


// ============================================================
// COACH
// ============================================================

const coach = {
    name: null,
    locked: true,
};


// ============================================================
// FIXTURES
// ============================================================

const fixtures = [
    {
        opponent: 'To Be Announced',
        competition: 'Season Zero',
        date: 'Coming Soon',
        status: 'UPCOMING',
    },
];


// ============================================================
// OBJECTIVE PROGRESS
// ============================================================

const progress = computed(() => {
    if (!team.objective.target) {
        return 0;
    }

    return Math.min(
        (team.objective.current / team.objective.target) * 100,
        100
    );
});

const remaining = computed(() => {
    return Math.max(
        team.objective.target - team.objective.current,
        0
    );
});
</script>


<template>
    <main class="lol-team-page">

        <!-- ====================================================
             PAGE BACKGROUND
        ===================================================== -->

        <div class="page-background"></div>


        <!-- ====================================================
             HERO
        ===================================================== -->

        <section class="team-hero">

            <div class="hero-overlay"></div>

            <img
                class="hero-art"
                src="@/assets/esports/league-of-legends-season-zero.png"
                alt="Project Respawn League of Legends Season Zero"
            />

            <div class="hero-content">

                <RouterLink
                    to="/esports"
                    class="back-link"
                >
                    ← Project Respawn Esports
                </RouterLink>


                <div class="hero-copy">

                    <span class="eyebrow">
                        PROJECT RESPAWN • {{ team.season }}
                    </span>

                    <h1>
                        League of
                        <strong>Legends</strong>
                    </h1>

                    <p>
                        The first competitive team in
                        Project Respawn history.
                    </p>


                    <div class="hero-tags">

                        <span>
                            {{ team.year }}
                        </span>

                        <span>
                            {{ team.region }}
                        </span>

                        <span class="active">
                            {{ team.status }}
                        </span>

                    </div>

                </div>


                <div class="hero-brand">

                    <img
                        src="@/assets/respawn-logo.png"
                        alt="Project Respawn"
                    />

                    <span>
                        SEASON ZERO
                    </span>

                </div>

            </div>

        </section>


        <!-- ====================================================
             TEAM NAVIGATION
        ===================================================== -->

        <nav class="team-nav">

            <div class="team-nav-inner">

                <a href="#roster">
                    Roster
                </a>

                <a href="#coach">
                    Coach
                </a>

                <a href="#fixtures">
                    Fixtures
                </a>

                <a href="#journey">
                    Journey
                </a>

            </div>

        </nav>


        <!-- ====================================================
             INTRODUCTION
        ===================================================== -->

        <section class="page-shell introduction">

            <div>

                <span class="section-eyebrow">
                    OUR FIRST TEAM
                </span>

                <h2>
                    This Is Where
                    <strong>It Begins.</strong>
                </h2>

            </div>


            <div class="introduction-copy">

                <p>
                    Season Zero marks the beginning of
                    Project Respawn's competitive journey.
                </p>

                <p>
                    Five players. One coach. One community
                    building the journey alongside them.
                </p>

            </div>

        </section>


        <!-- ====================================================
             COMMUNITY ROSTER OBJECTIVE
        ===================================================== -->

        <section class="page-shell">

            <div class="unlock-panel">

                <div class="unlock-copy">

                    <span class="section-eyebrow">
                        COMMUNITY OBJECTIVE
                    </span>

                    <h2>
                        Unlock The
                        <strong>Roster.</strong>
                    </h2>

                    <p>
                        Our Season Zero team is waiting.
                        Reach 200 Project Respawn members
                        and the full roster will be revealed.
                    </p>

                </div>


                <div class="objective-progress">

                    <div class="objective-numbers">

                        <div>
                            <strong>
                                {{ team.objective.current }}
                            </strong>

                            <span>
                                CURRENT
                            </span>
                        </div>


                        <div class="target">

                            <strong>
                                {{ team.objective.target }}
                            </strong>

                            <span>
                                TARGET
                            </span>

                        </div>

                    </div>


                    <div class="progress-track">

                        <div
                            class="progress-fill"
                            :style="{
                                width: `${progress}%`
                            }"
                        ></div>

                    </div>


                    <div class="progress-footer">

                        <span>
                            {{ Math.round(progress) }}% COMPLETE
                        </span>

                        <span>
                            {{ remaining }} MEMBERS TO GO
                        </span>

                    </div>

                </div>


                <RouterLink
                    to="/join"
                    class="join-button"
                >
                    Join The Community
                    <span>→</span>
                </RouterLink>

            </div>

        </section>


        <!-- ====================================================
             ROSTER
        ===================================================== -->

        <section
            id="roster"
            class="page-shell roster-section"
        >

            <div class="section-heading">

                <div>

                    <span class="section-eyebrow">
                        THE FIVE
                    </span>

                    <h2>
                        Season Zero
                        <strong>Roster.</strong>
                    </h2>

                </div>


                <p>
                    Every player will be introduced individually
                    once the community unlocks the roster.
                </p>

            </div>


            <div class="roster-grid">

                <article
                    v-for="(player, index) in roster"
                    :key="player.role"
                    class="player-card"
                >

                    <div class="player-number">
                        0{{ index + 1 }}
                    </div>


                    <div class="player-portrait">

                        <div class="portrait-glow"></div>

                        <img
                            src="@/assets/respawn-logo.png"
                            alt=""
                        />

                        <div
                            v-if="player.locked"
                            class="locked-overlay"
                        >

                            <div class="lock-icon">
                                ?
                            </div>

                            <span>
                                LOCKED
                            </span>

                        </div>

                    </div>


                    <div class="player-details">

                        <span class="role">
                            {{ player.role }}
                        </span>

                        <h3>
                            {{
                                player.playerName ||
                                'PLAYER LOCKED'
                            }}
                        </h3>

                        <p>
                            Reveal at 200 members
                        </p>

                    </div>

                </article>

            </div>

        </section>


        <!-- ====================================================
             COACH
        ===================================================== -->

        <section
            id="coach"
            class="page-shell coach-section"
        >

            <div class="coach-card">

                <div class="coach-art">

                    <div class="coach-logo">

                        <img
                            src="@/assets/respawn-logo.png"
                            alt=""
                        />

                    </div>


                    <div class="coach-lock">
                        ?
                    </div>

                </div>


                <div class="coach-copy">

                    <span class="section-eyebrow">
                        LEADING THE TEAM
                    </span>

                    <h2>
                        Meet The
                        <strong>Coach.</strong>
                    </h2>

                    <p>
                        The person guiding Project Respawn
                        through our first competitive season
                        will be introduced alongside the team.
                    </p>


                    <div class="coach-status">

                        <span></span>

                        COACH REVEAL LOCKED

                    </div>

                </div>

            </div>

        </section>


        <!-- ====================================================
             FIXTURES
        ===================================================== -->

        <section
            id="fixtures"
            class="page-shell fixtures-section"
        >

            <div class="section-heading">

                <div>

                    <span class="section-eyebrow">
                        MATCH CENTRE
                    </span>

                    <h2>
                        Fixtures &
                        <strong>Results.</strong>
                    </h2>

                </div>


                <p>
                    Follow every match from our first
                    competitive season.
                </p>

            </div>


            <div class="fixture-list">

                <article
                    v-for="fixture in fixtures"
                    :key="`${fixture.opponent}-${fixture.date}`"
                    class="fixture"
                >

                    <div class="fixture-date">

                        <span>
                            {{ fixture.date }}
                        </span>

                        <small>
                            {{ fixture.competition }}
                        </small>

                    </div>


                    <div class="fixture-team">

                        <img
                            src="@/assets/respawn-logo.png"
                            alt="Project Respawn"
                        />

                        <strong>
                            PROJECT RESPAWN
                        </strong>

                    </div>


                    <div class="versus">
                        VS
                    </div>


                    <div class="fixture-team opponent">

                        <div class="opponent-placeholder">
                            ?
                        </div>

                        <strong>
                            {{ fixture.opponent }}
                        </strong>

                    </div>


                    <div class="fixture-status">
                        {{ fixture.status }}
                    </div>

                </article>

            </div>

        </section>


        <!-- ====================================================
             JOURNEY
        ===================================================== -->

        <section
            id="journey"
            class="page-shell journey-section"
        >

            <div class="journey-card">

                <div class="journey-logo">

                    <img
                        src="@/assets/esports/esports-phoenix-art.png"
                        alt="Project Respawn Esports"
                    />

                </div>


                <div class="journey-copy">

                    <span class="section-eyebrow">
                        SEASON ZERO
                    </span>

                    <h2>
                        You're Here At
                        <strong>The Beginning.</strong>
                    </h2>

                    <p>
                        There are no old trophies to point at.
                        No years of history to look back on.
                        We're building that history now.
                    </p>

                    <p>
                        Every match, every tournament and every
                        milestone becomes part of the Project
                        Respawn story from here.
                    </p>


                    <RouterLink
                        to="/esports"
                        class="text-link"
                    >
                        Explore Our Esports Journey
                        <span>→</span>
                    </RouterLink>

                </div>

            </div>

        </section>


        <!-- ====================================================
             FINAL CTA
        ===================================================== -->

        <section class="page-shell final-cta">

            <span class="section-eyebrow">
                THE SIXTH PLAYER
            </span>

            <h2>
                The Team Has Five.
                <strong>We Need You.</strong>
            </h2>

            <p>
                Join Project Respawn and help unlock
                the first roster in our esports history.
            </p>

            <RouterLink
                to="/join"
                class="final-button"
            >
                Join Project Respawn
                <span>→</span>
            </RouterLink>

        </section>

    </main>
</template>


<style scoped>
/* ============================================================
   PAGE
============================================================ */

.lol-team-page {
    min-height: 100vh;

    position: relative;

    overflow: hidden;

    background: #050607;

    color: #ffffff;
}


.page-background {
    position: fixed;

    inset: 0;

    z-index: 0;

    pointer-events: none;

    background:
        linear-gradient(
            rgba(3, 4, 7, 0.91),
            rgba(3, 4, 7, 0.96)
        ),
        url("@/assets/esports/esports-background.png")
            center top / cover;

    opacity: 1;
}


.page-shell {
    width:
        min(
            1500px,
            calc(100% - 40px)
        );

    margin-left: auto;
    margin-right: auto;

    position: relative;

    z-index: 2;
}


/* ============================================================
   HERO
============================================================ */

.team-hero {
    min-height: 670px;

    position: relative;

    overflow: hidden;

    display: flex;

    align-items: flex-end;

    background: #050607;
}


.hero-art {
    position: absolute;

    inset: 0;

    width: 100%;
    height: 100%;

    object-fit: cover;

    opacity: 0.62;
}


.hero-overlay {
    position: absolute;

    inset: 0;

    z-index: 1;

    background:
        linear-gradient(
            90deg,
            rgba(3, 4, 7, 0.98) 0%,
            rgba(3, 4, 7, 0.77) 45%,
            rgba(3, 4, 7, 0.35) 75%
        ),
        linear-gradient(
            to top,
            #050607 0%,
            transparent 50%
        );
}


.hero-content {
    width:
        min(
            1500px,
            calc(100% - 40px)
        );

    margin: 0 auto;

    padding:
        100px 0 70px;

    position: relative;

    z-index: 3;

    display: grid;

    grid-template-columns:
        1fr auto;

    align-items: end;

    gap: 40px;
}


.back-link {
    position: absolute;

    top: 0;
    left: 0;

    color: #969aa5;

    font-size: 0.72rem;
    font-weight: 800;

    letter-spacing: 0.08em;

    text-decoration: none;

    text-transform: uppercase;
}


.back-link:hover {
    color: #61ff18;
}


.eyebrow {
    color: #8b5cf6;

    font-size: 0.72rem;
    font-weight: 800;

    letter-spacing: 0.18em;

    text-transform: uppercase;
}


.hero-copy h1 {
    margin:
        12px 0 18px;

    font-size:
        clamp(
            4rem,
            8vw,
            8rem
        );

    line-height: 0.82;

    letter-spacing: -0.05em;

    text-transform: uppercase;
}


.hero-copy h1 strong {
    display: block;

    color: #61ff18;
}


.hero-copy p {
    max-width: 520px;

    color: #afb2bb;

    font-size: 1.05rem;

    line-height: 1.6;
}


.hero-tags {
    display: flex;

    flex-wrap: wrap;

    gap: 8px;

    margin-top: 25px;
}


.hero-tags span {
    padding:
        7px 11px;

    border:
        1px solid
        rgba(255, 255, 255, 0.14);

    background:
        rgba(5, 6, 8, 0.65);

    color: #a0a4ae;

    font-size: 0.62rem;
    font-weight: 800;

    letter-spacing: 0.08em;
}


.hero-tags .active {
    border-color:
        rgba(97, 255, 24, 0.4);

    color: #61ff18;
}


.hero-brand {
    text-align: center;
}


.hero-brand img {
    width: 180px;
    height: 180px;

    object-fit: contain;

    filter:
        drop-shadow(
            0 0 30px
            rgba(139, 92, 246, 0.4)
        );
}


.hero-brand span {
    display: block;

    margin-top: 10px;

    color: #8b5cf6;

    font-size: 0.65rem;
    font-weight: 800;

    letter-spacing: 0.2em;
}


/* ============================================================
   NAVIGATION
============================================================ */

.team-nav {
    position: sticky;

    top: 0;

    z-index: 20;

    border-top:
        1px solid
        rgba(255, 255, 255, 0.06);

    border-bottom:
        1px solid
        rgba(255, 255, 255, 0.08);

    background:
        rgba(5, 6, 8, 0.92);

    backdrop-filter:
        blur(18px);
}


.team-nav-inner {
    width:
        min(
            1500px,
            calc(100% - 40px)
        );

    margin: auto;

    display: flex;

    gap: 32px;
}


.team-nav a {
    padding:
        17px 0;

    color: #777b85;

    font-size: 0.68rem;
    font-weight: 800;

    letter-spacing: 0.1em;

    text-decoration: none;

    transition:
        color 0.2s ease;
}


.team-nav a:hover {
    color: #61ff18;
}


/* ============================================================
   SHARED SECTION STYLES
============================================================ */

.section-eyebrow {
    color: #8b5cf6;

    font-size: 0.66rem;
    font-weight: 800;

    letter-spacing: 0.16em;

    text-transform: uppercase;
}


.section-heading {
    display: flex;

    justify-content: space-between;

    align-items: flex-end;

    gap: 40px;

    margin-bottom: 25px;
}


.section-heading h2,
.introduction h2,
.unlock-copy h2,
.coach-copy h2,
.journey-copy h2,
.final-cta h2 {
    margin:
        7px 0;

    font-size:
        clamp(
            2rem,
            4vw,
            4rem
        );

    line-height: 0.95;

    text-transform: uppercase;
}


.section-heading h2 strong,
.introduction h2 strong,
.unlock-copy h2 strong,
.coach-copy h2 strong,
.journey-copy h2 strong,
.final-cta h2 strong {
    color: #61ff18;
}


.section-heading p {
    max-width: 430px;

    color: #858994;

    line-height: 1.6;
}


/* ============================================================
   INTRODUCTION
============================================================ */

.introduction {
    padding:
        80px 0;

    display: grid;

    grid-template-columns:
        1fr 1fr;

    gap: 60px;

    align-items: center;
}


.introduction-copy {
    color: #9da1aa;

    font-size: 1rem;

    line-height: 1.7;
}


/* ============================================================
   UNLOCK OBJECTIVE
============================================================ */

.unlock-panel {
    padding: 35px;

    display: grid;

    grid-template-columns:
        1fr 1.1fr auto;

    gap: 40px;

    align-items: center;

    border:
        1px solid
        rgba(139, 92, 246, 0.35);

    background:
        radial-gradient(
            circle at 20% 50%,
            rgba(139, 92, 246, 0.11),
            transparent 35%
        ),
        rgba(7, 8, 11, 0.92);

    backdrop-filter:
        blur(16px);
}


.unlock-copy p {
    max-width: 480px;

    margin-bottom: 0;

    color: #8f939d;

    line-height: 1.6;
}


.objective-numbers {
    display: flex;

    justify-content: space-between;

    margin-bottom: 15px;
}


.objective-numbers div {
    display: flex;

    flex-direction: column;
}


.objective-numbers strong {
    font-size: 1.8rem;
}


.objective-numbers span {
    color: #696d77;

    font-size: 0.58rem;

    letter-spacing: 0.1em;
}


.target {
    text-align: right;
}


.target strong {
    color: #61ff18;
}


.progress-track {
    height: 9px;

    overflow: hidden;

    background: #181a1f;
}


.progress-fill {
    height: 100%;

    background:
        linear-gradient(
            90deg,
            #8b5cf6,
            #61ff18
        );

    box-shadow:
        0 0 18px
        rgba(97, 255, 24, 0.35);
}


.progress-footer {
    display: flex;

    justify-content: space-between;

    margin-top: 9px;

    color: #6d717b;

    font-size: 0.58rem;

    letter-spacing: 0.08em;
}


.join-button,
.final-button {
    display: inline-flex;

    align-items: center;

    gap: 10px;

    padding:
        14px 20px;

    border:
        1px solid #61ff18;

    background: #61ff18;

    color: #071000;

    font-size: 0.68rem;
    font-weight: 800;

    white-space: nowrap;

    text-decoration: none;

    text-transform: uppercase;
}


/* ============================================================
   ROSTER
============================================================ */

.roster-section {
    padding:
        100px 0;
}


.roster-grid {
    display: grid;

    grid-template-columns:
        repeat(5, 1fr);

    gap: 12px;
}


.player-card {
    min-width: 0;

    position: relative;

    overflow: hidden;

    border:
        1px solid
        rgba(255, 255, 255, 0.09);

    background:
        rgba(7, 8, 11, 0.94);

    transition:
        transform 0.2s ease,
        border-color 0.2s ease;
}


.player-card:hover {
    transform:
        translateY(-4px);

    border-color:
        rgba(139, 92, 246, 0.55);
}


.player-number {
    position: absolute;

    top: 9px;
    left: 10px;

    z-index: 5;

    color: #555963;

    font-size: 0.6rem;
}


.player-portrait {
    height: 300px;

    position: relative;

    display: grid;

    place-items: center;

    overflow: hidden;

    background:
        radial-gradient(
            circle,
            rgba(139, 92, 246, 0.12),
            transparent 55%
        ),
        #090a0e;
}


.portrait-glow {
    position: absolute;

    width: 150px;
    height: 150px;

    border-radius: 50%;

    background:
        rgba(139, 92, 246, 0.14);

    filter: blur(30px);
}


.player-portrait > img {
    width: 130px;
    height: 130px;

    object-fit: contain;

    opacity: 0.16;

    filter: grayscale(1);
}


.locked-overlay {
    position: absolute;

    inset: 0;

    display: flex;

    flex-direction: column;

    align-items: center;
    justify-content: center;

    gap: 8px;

    background:
        rgba(5, 6, 8, 0.25);
}


.lock-icon {
    width: 54px;
    height: 54px;

    display: grid;

    place-items: center;

    transform:
        rotate(45deg);

    border:
        1px solid
        rgba(139, 92, 246, 0.6);

    color: #8b5cf6;

    font-size: 1.3rem;
    font-weight: 800;
}


.lock-icon::first-letter {
    transform:
        rotate(-45deg);
}


.locked-overlay span {
    margin-top: 9px;

    color: #737781;

    font-size: 0.6rem;

    letter-spacing: 0.16em;
}


.player-details {
    padding: 17px;
}


.role {
    color: #61ff18;

    font-size: 0.62rem;
    font-weight: 800;

    letter-spacing: 0.12em;
}


.player-details h3 {
    margin:
        5px 0;

    font-size: 1rem;

    text-transform: uppercase;
}


.player-details p {
    margin: 0;

    color: #626670;

    font-size: 0.66rem;
}


/* ============================================================
   COACH
============================================================ */

.coach-section {
    padding-bottom: 100px;
}


.coach-card {
    display: grid;

    grid-template-columns:
        0.75fr 1fr;

    min-height: 420px;

    border:
        1px solid
        rgba(139, 92, 246, 0.28);

    background:
        rgba(7, 8, 11, 0.94);
}


.coach-art {
    position: relative;

    display: grid;

    place-items: center;

    overflow: hidden;

    background:
        radial-gradient(
            circle,
            rgba(139, 92, 246, 0.17),
            transparent 50%
        ),
        #090a0e;
}


.coach-logo img {
    width: 230px;

    opacity: 0.14;

    filter:
        grayscale(1);
}


.coach-lock {
    position: absolute;

    width: 75px;
    height: 75px;

    display: grid;

    place-items: center;

    border:
        1px solid #8b5cf6;

    color: #8b5cf6;

    font-size: 2rem;
}


.coach-copy {
    padding:
        55px;

    display: flex;

    flex-direction: column;

    justify-content: center;
}


.coach-copy p {
    max-width: 550px;

    color: #9296a0;

    line-height: 1.7;
}


.coach-status {
    margin-top: 20px;

    display: flex;

    align-items: center;

    gap: 8px;

    color: #777b85;

    font-size: 0.63rem;

    letter-spacing: 0.1em;
}


.coach-status span {
    width: 7px;
    height: 7px;

    border-radius: 50%;

    background: #8b5cf6;

    box-shadow:
        0 0 10px #8b5cf6;
}


/* ============================================================
   FIXTURES
============================================================ */

.fixtures-section {
    padding-bottom: 100px;
}


.fixture-list {
    border:
        1px solid
        rgba(255, 255, 255, 0.09);

    background:
        rgba(7, 8, 11, 0.94);
}


.fixture {
    min-height: 110px;

    padding:
        20px 25px;

    display: grid;

    grid-template-columns:
        170px
        1fr
        60px
        1fr
        100px;

    align-items: center;

    gap: 20px;
}


.fixture-date span,
.fixture-date small {
    display: block;
}


.fixture-date span {
    font-weight: 800;

    text-transform: uppercase;
}


.fixture-date small {
    margin-top: 4px;

    color: #696d77;
}


.fixture-team {
    display: flex;

    align-items: center;

    gap: 12px;
}


.fixture-team img,
.opponent-placeholder {
    width: 48px;
    height: 48px;

    object-fit: contain;
}


.opponent-placeholder {
    display: grid;

    place-items: center;

    border:
        1px solid
        rgba(255, 255, 255, 0.12);

    color: #5d616a;
}


.versus {
    color: #8b5cf6;

    font-weight: 900;

    text-align: center;
}


.fixture-status {
    color: #61ff18;

    font-size: 0.62rem;
    font-weight: 800;

    text-align: right;
}


/* ============================================================
   JOURNEY
============================================================ */

.journey-section {
    padding-bottom: 100px;
}


.journey-card {
    min-height: 500px;

    display: grid;

    grid-template-columns:
        1fr 1fr;

    overflow: hidden;

    border:
        1px solid
        rgba(139, 92, 246, 0.25);

    background:
        rgba(7, 8, 11, 0.94);
}


.journey-logo {
    position: relative;

    overflow: hidden;
}


.journey-logo::after {
    content: "";

    position: absolute;

    inset: 0;

    background:
        linear-gradient(
            90deg,
            transparent,
            rgba(7, 8, 11, 0.9)
        );
}


.journey-logo img {
    width: 100%;
    height: 100%;

    object-fit: cover;
}


.journey-copy {
    padding:
        60px;

    display: flex;

    flex-direction: column;

    justify-content: center;
}


.journey-copy p {
    color: #9296a0;

    line-height: 1.7;
}


.text-link {
    margin-top: 15px;

    color: #61ff18;

    font-size: 0.68rem;
    font-weight: 800;

    text-decoration: none;

    text-transform: uppercase;
}


/* ============================================================
   FINAL CTA
============================================================ */

.final-cta {
    margin-bottom: 50px;

    padding:
        70px 30px;

    text-align: center;

    border:
        1px solid
        rgba(139, 92, 246, 0.35);

    background:
        radial-gradient(
            circle,
            rgba(139, 92, 246, 0.14),
            transparent 55%
        ),
        rgba(7, 8, 11, 0.94);
}


.final-cta p {
    max-width: 600px;

    margin:
        15px auto 25px;

    color: #9296a0;
}


/* ============================================================
   RESPONSIVE
============================================================ */

@media (max-width: 1200px) {

    .roster-grid {
        grid-template-columns:
            repeat(3, 1fr);
    }


    .unlock-panel {
        grid-template-columns:
            1fr 1fr;
    }


    .join-button {
        grid-column:
            1 / -1;

        justify-self: start;
    }

}


@media (max-width: 900px) {

    .hero-content {
        grid-template-columns:
            1fr;
    }


    .hero-brand {
        display: none;
    }


    .introduction {
        grid-template-columns:
            1fr;
    }


    .coach-card,
    .journey-card {
        grid-template-columns:
            1fr;
    }


    .coach-art,
    .journey-logo {
        min-height: 320px;
    }


    .fixture {
        grid-template-columns:
            1fr;
    }


    .versus {
        text-align: left;
    }


    .fixture-status {
        text-align: left;
    }

}


@media (max-width: 700px) {

    .page-shell,
    .hero-content,
    .team-nav-inner {
        width:
            calc(100% - 24px);
    }


    .team-hero {
        min-height: 600px;
    }


    .hero-copy h1 {
        font-size:
            clamp(
                3.4rem,
                17vw,
                5.5rem
            );
    }


    .team-nav-inner {
        overflow-x: auto;
    }


    .team-nav a {
        white-space: nowrap;
    }


    .unlock-panel {
        grid-template-columns:
            1fr;

        padding:
            25px;
    }


    .join-button {
        grid-column: auto;
    }


    .roster-grid {
        grid-template-columns:
            1fr;
    }


    .player-portrait {
        height: 260px;
    }


    .section-heading {
        flex-direction: column;

        align-items: flex-start;
    }


    .coach-copy,
    .journey-copy {
        padding:
            35px 25px;
    }


    .final-cta {
        padding:
            55px 20px;
    }

}
</style>