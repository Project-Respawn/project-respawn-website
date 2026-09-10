<script setup>
defineProps({
    season: {
        type: Object,
        required: true,
    },
});

function scrollToSection(id) {
    document
        .getElementById(id)
        ?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
}
</script>

<template>
    <section class="esports-hero">

        <div class="hero-purple-glow"></div>
        <div class="hero-green-glow"></div>

        <div class="hero-content">

            <div class="season-label">
                {{ season.name }} • {{ season.year }}
            </div>

            <h1 class="hero-title">

                <span class="purple">
                    COMPETE.
                </span>

                <span>
                    CONNECT.
                </span>

                <span class="green">
                    RESPAWN.
                </span>

            </h1>

            <p class="hero-copy">
                We’re building competitive teams differently.
                Our players compete — our community builds alongside them.
            </p>

            <div class="hero-actions">

                <button
                    type="button"
                    class="hero-button hero-button-primary"
                    @click="scrollToSection('teams')"
                >
                    Explore Our Teams
                </button>

                <button
                    type="button"
                    class="hero-button hero-button-secondary"
                    @click="scrollToSection('tournaments')"
                >
                    View Tournaments
                </button>

            </div>

            <div class="hero-identity">

                <div class="identity-mark">
                    PROJECT
                    <strong>RESPAWN</strong>
                    <span>ESPORTS</span>
                </div>

                <p>
                    Season Zero starts here.
                </p>

            </div>

        </div>

        <div class="hero-bottom-line"></div>

    </section>
</template>

<style scoped>
.esports-hero {
    min-height: 680px;

    position: relative;

    display: flex;

    align-items: center;
    justify-content: center;

    overflow: hidden;

    padding:
        110px 32px
        90px;

    background:
        radial-gradient(
            circle at 20% 45%,
            rgba(126, 40, 255, 0.15),
            transparent 34%
        ),
        radial-gradient(
            circle at 82% 48%,
            rgba(97, 255, 24, 0.07),
            transparent 32%
        ),
        rgba(5, 6, 9, 0.34);
}


.hero-purple-glow {
    width: 420px;
    height: 620px;

    position: absolute;

    left: -260px;
    top: 30px;

    background:
        rgba(126, 40, 255, 0.22);

    filter:
        blur(120px);

    pointer-events: none;
}


.hero-green-glow {
    width: 380px;
    height: 580px;

    position: absolute;

    right: -250px;
    top: 90px;

    background:
        rgba(97, 255, 24, 0.10);

    filter:
        blur(130px);

    pointer-events: none;
}


.hero-content {
    width: min(
        100%,
        980px
    );

    position: relative;

    z-index: 2;

    text-align: center;

    display: flex;

    flex-direction: column;

    align-items: center;
}


.season-label {
    margin-bottom: 20px;

    color: #8b5cf6;

    font-size: 0.72rem;
    font-weight: 800;

    letter-spacing: 0.18em;

    text-transform: uppercase;
}


.hero-title {
    margin: 0;

    display: flex;

    flex-direction: column;

    align-items: center;

    font-size:
        clamp(
            4rem,
            8vw,
            7.6rem
        );

    font-weight: 900;

    line-height: 0.82;

    letter-spacing: -0.055em;

    text-transform: uppercase;
}


.hero-title span {
    display: block;

    color: #ffffff;
}


.hero-title .purple {
    color: #8b5cf6;

    text-shadow:
        0 0 36px
        rgba(139, 92, 246, 0.22);
}


.hero-title .green {
    color: #61ff18;

    text-shadow:
        0 0 36px
        rgba(97, 255, 24, 0.15);
}


.hero-copy {
    max-width: 690px;

    margin:
        34px auto 0;

    color: #9a9ea8;

    font-size:
        clamp(
            0.95rem,
            1.6vw,
            1.1rem
        );

    line-height: 1.7;
}


.hero-actions {
    display: flex;

    justify-content: center;

    flex-wrap: wrap;

    gap: 12px;

    margin-top: 30px;
}


.hero-button {
    min-width: 190px;

    padding:
        14px 22px;

    border: 1px solid transparent;

    cursor: pointer;

    font: inherit;

    font-size: 0.72rem;
    font-weight: 800;

    letter-spacing: 0.09em;

    text-transform: uppercase;

    transition:
        transform 0.2s ease,
        background 0.2s ease,
        border-color 0.2s ease,
        box-shadow 0.2s ease;
}


.hero-button:hover {
    transform:
        translateY(-2px);
}


.hero-button-primary {
    background: #8b5cf6;

    border-color:
        #8b5cf6;

    color: #ffffff;

    box-shadow:
        0 0 28px
        rgba(139, 92, 246, 0.18);
}


.hero-button-primary:hover {
    background:
        #9a6cff;

    box-shadow:
        0 0 34px
        rgba(139, 92, 246, 0.28);
}


.hero-button-secondary {
    background:
        rgba(5, 6, 8, 0.68);

    border-color:
        rgba(97, 255, 24, 0.30);

    color: #d8dadf;
}


.hero-button-secondary:hover {
    border-color:
        rgba(97, 255, 24, 0.65);

    color: #ffffff;
}


.hero-identity {
    margin-top: 50px;

    padding-top: 28px;

    border-top:
        1px solid
        rgba(255, 255, 255, 0.08);
}


.identity-mark {
    color: #ffffff;

    font-size: 0.67rem;
    font-weight: 800;

    line-height: 1.05;

    letter-spacing: 0.14em;
}


.identity-mark strong {
    display: block;

    margin:
        4px 0 2px;

    font-size: 1.28rem;

    letter-spacing: 0.06em;
}


.identity-mark span {
    display: block;

    color: #61ff18;

    font-size: 0.72rem;
}


.hero-identity p {
    margin:
        10px 0 0;

    color: #656973;

    font-size: 0.68rem;

    letter-spacing: 0.08em;

    text-transform: uppercase;
}


.hero-bottom-line {
    width: min(
        78%,
        900px
    );

    height: 1px;

    position: absolute;

    bottom: 0;
    left: 50%;

    transform:
        translateX(-50%);

    background:
        linear-gradient(
            90deg,
            transparent,
            rgba(139, 92, 246, 0.55),
            rgba(97, 255, 24, 0.28),
            transparent
        );
}


@media (max-width: 750px) {

    .esports-hero {
        min-height: 610px;

        padding:
            90px 20px
            70px;
    }


    .hero-title {
        font-size:
            clamp(
                3.25rem,
                17vw,
                5.2rem
            );
    }


    .hero-copy {
        margin-top: 28px;
    }


    .hero-actions {
        width: 100%;
    }


    .hero-button {
        width: 100%;
        max-width: 310px;
    }


    .hero-identity {
        margin-top: 38px;
    }

}
</style>