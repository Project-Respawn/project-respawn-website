<script setup>
defineProps({
  poster: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="jersey-fallback">

    <img
      :src="poster"
      alt="Project Respawn Season Zero esports jersey"
    />

  </div>
</template>

<style scoped>
.jersey-fallback {
  width: 100%;
  height: 100%;

  min-height: 420px;

  display: grid;

  place-items: center;
}

.jersey-fallback img {
  width:
    min(
      92%,
      520px
    );

  max-height: 500px;

  object-fit: contain;

  filter:
    drop-shadow(
      0 28px 42px
      rgba(0, 0, 0, 0.68)
    );
}
</style>