<script setup>
defineProps({
    jersey: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <section class="panel jersey-panel">

        <div class="heading">
            <span>OUR COLOURS</span>

            <h2>
                {{ jersey.name }}
            </h2>

            <p>
                {{ jersey.description }}
            </p>
        </div>

        <div class="jersey-showcase">

            <div class="jersey-purple-glow"></div>
            <div class="jersey-green-glow"></div>

            <div class="jersey-image-wrap">
                <img
                    :src="jersey.poster"
                    :alt="`${jersey.name} ${jersey.year}`"
                    class="jersey-image"
                />
            </div>

            <div class="season-badge">
                SEASON ZERO

                <strong>
                    {{ jersey.year }}
                </strong>
            </div>

        </div>

        <div class="jersey-details">

            <div
                v-for="detail in jersey.details"
                :key="detail"
                class="jersey-detail"
            >
                <span>◆</span>

                <p>
                    {{ detail }}
                </p>
            </div>

        </div>

        <div class="jersey-message">

            <span>
                COLLAR DETAIL
            </span>

            <strong>
                YOUR PAST WAS THE TUTORIAL.
            </strong>

        </div>

        <div class="jersey-footer">
            PROJECT RESPAWN • SEASON ZERO
        </div>

    </section>
</template>

<style scoped>
.panel {
    padding: 26px;

    overflow: hidden;

    position: relative;

    border:
        1px solid
        rgba(139, 92, 246, 0.28);

    background:
        radial-gradient(
            circle at 50% 38%,
            rgba(126, 40, 255, 0.10),
            transparent 42%
        ),
        rgba(8, 9, 12, 0.93);

    backdrop-filter:
        blur(12px);
}


.heading span {
    color: #8b5cf6;

    font-size: 0.68rem;
    font-weight: 800;

    letter-spacing: 0.14em;
}


.heading h2 {
    margin: 5px 0;

    font-size: 2rem;

    text-transform: uppercase;
}


.heading p {
    margin: 0;

    color: #8c909b;

    line-height: 1.55;
}


.jersey-showcase {
    min-height: 560px;

    margin:
        22px 0 28px;

    position: relative;

    display: flex;

    align-items: center;
    justify-content: center;

    overflow: hidden;

    border:
        1px solid
        rgba(139, 92, 246, 0.18);

    background:
        radial-gradient(
            circle at 35% 45%,
            rgba(139, 92, 246, 0.13),
            transparent 35%
        ),
        radial-gradient(
            circle at 68% 48%,
            rgba(97, 255, 24, 0.06),
            transparent 34%
        ),
        rgba(4, 5, 8, 0.72);
}


.jersey-purple-glow {
    width: 340px;
    height: 420px;

    position: absolute;

    left: 10%;
    top: 12%;

    border-radius: 50%;

    background:
        rgba(139, 92, 246, 0.14);

    filter:
        blur(95px);

    pointer-events: none;
}


.jersey-green-glow {
    width: 300px;
    height: 380px;

    position: absolute;

    right: 10%;
    bottom: 12%;

    border-radius: 50%;

    background:
        rgba(97, 255, 24, 0.06);

    filter:
        blur(100px);

    pointer-events: none;
}


.jersey-image-wrap {
    width: 100%;

    position: relative;

    z-index: 2;

    display: flex;

    align-items: center;
    justify-content: center;

    padding: 28px;
}


.jersey-image {
    display: block;

    width: min(
        100%,
        650px
    );

    max-height: 500px;

    object-fit: contain;

    filter:
        drop-shadow(
            0 24px 40px
            rgba(0, 0, 0, 0.55)
        );

    transition:
        transform 0.3s ease,
        filter 0.3s ease;
}


.jersey-showcase:hover .jersey-image {
    transform:
        scale(1.015);

    filter:
        drop-shadow(
            0 28px 46px
            rgba(0, 0, 0, 0.64)
        );
}


.season-badge {
    position: absolute;

    right: 16px;
    bottom: 16px;

    z-index: 3;

    padding: 10px 13px;

    border:
        1px solid
        rgba(139, 92, 246, 0.42);

    background:
        rgba(5, 6, 8, 0.9);

    color: #8b5cf6;

    font-size: 0.6rem;

    letter-spacing: 0.1em;
}


.season-badge strong {
    display: block;

    margin-top: 3px;

    color: #ffffff;

    font-size: 0.82rem;
}


.jersey-details {
    display: grid;

    grid-template-columns:
        repeat(2, 1fr);

    gap:
        11px 24px;
}


.jersey-detail {
    display: grid;

    grid-template-columns:
        18px 1fr;

    gap: 7px;

    align-items: start;
}


.jersey-detail span {
    color: #61ff18;

    font-size: 0.65rem;
}


.jersey-detail p {
    margin: 0;

    color: #979ba5;

    font-size: 0.74rem;

    line-height: 1.45;
}


.jersey-message {
    margin-top: 22px;

    padding-top: 18px;

    border-top:
        1px solid
        rgba(255, 255, 255, 0.08);
}


.jersey-message span,
.jersey-message strong {
    display: block;
}


.jersey-message span {
    margin-bottom: 5px;

    color: #626670;

    font-size: 0.6rem;

    letter-spacing: 0.12em;
}


.jersey-message strong {
    color: #8b5cf6;

    font-size: 0.83rem;
}


.jersey-footer {
    margin-top: 20px;

    color: #50535c;

    font-size: 0.58rem;

    letter-spacing: 0.14em;

    text-align: right;
}


@media (max-width: 760px) {

    .jersey-showcase {
        min-height: 470px;
    }


    .jersey-image {
        max-height: 410px;
    }

}


@media (max-width: 500px) {

    .panel {
        padding: 18px;
    }


    .jersey-showcase {
        min-height: 390px;
    }


    .jersey-image-wrap {
        padding: 18px;
    }


    .jersey-image {
        max-height: 340px;
    }


    .jersey-details {
        grid-template-columns:
            1fr;
    }


    .season-badge {
        right: 10px;
        bottom: 10px;
    }

}
</style>