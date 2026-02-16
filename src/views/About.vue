<template>
  <main class="container py-5">
    <section>
      <h1 class="mb-4">About Ravens</h1>
      <p>
        We turn social interaction into a game you can win at your own pace.
      </p>
      <p>
        <strong>Themed Roles:</strong> Earn unique titles that celebrate your personality and milestones.
      </p>
      <p>
        <strong>Real Progression:</strong> Gain XP not just for gaming skills, but for being a helpful friend and active member.
      </p>
      <p>
        <strong>Quests & Events:</strong> Participate in low-pressure challenges designed to break the ice and spark conversation.
      </p>

      <h2 class="mt-5 mb-4">The Future: Ravens Rewards</h2>
      <p>
        We are building a unique economy of kindness. Soon, our custom token system will reward members who support others, mentor newcomers, and host events. You'll be able to redeem these earned tokens for exclusive perks and partner gear—proving that in our community, being a good person pays off.
      </p>

      <div class="mt-5">
        <router-link to="/contact" class="btn btn-primary btn-lg">Join the Community</router-link>
      </div>
    </section>
  </main>
</template>

<script setup>
</script>

<style scoped>
h1 {
  font-weight: 700;
  margin-bottom: 2rem;
}

h2 {
  font-weight: 700;
}

p {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--text);
  margin-bottom: 1.5rem;
}

.btn-primary {
  background: linear-gradient(90deg, var(--accent), var(--accent-2)) !important;
  color: #2a1b3d !important;
  border: none !important;
  font-weight: 600 !important;
  padding: 12px 24px !important;
  border-radius: 10px !important;
}

.btn-primary:hover {
  opacity: 0.9;
  color: #2a1b3d !important;
}
</style>
