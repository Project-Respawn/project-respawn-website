<template>
  <main class="container py-5">
    <section class="contact-section">
      <div class="row">
        <div class="col-lg-8 mx-auto">
          <h1 class="mb-4">Get In Touch</h1>
          <p class="lead mb-4">Have questions or want to join Ravens? We'd love to hear from you!</p>

          <form @submit.prevent="submitForm" class="contact-form">
            <div class="mb-3">
              <label for="name" class="form-label">Name</label>
              <input
                type="text"
                class="form-control"
                id="name"
                v-model="form.name"
                required
              />
            </div>

            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input
                type="email"
                class="form-control"
                id="email"
                v-model="form.email"
                required
              />
            </div>

            <div class="mb-3">
              <label for="subject" class="form-label">Subject</label>
              <input
                type="text"
                class="form-control"
                id="subject"
                v-model="form.subject"
                required
              />
            </div>

            <div class="mb-3">
              <label for="message" class="form-label">Message</label>
              <textarea
                class="form-control"
                id="message"
                rows="5"
                v-model="form.message"
                required
              ></textarea>
            </div>

            <button type="submit" class="btn btn-primary btn-lg">Send Message</button>
            <div v-if="successMessage" class="alert alert-success mt-3">
              {{ successMessage }}
            </div>
          </form>

          <div class="contact-info mt-5 pt-5 border-top">
            <h2 class="mb-4">Other Ways to Connect</h2>
            <div class="row">
              <div class="col-md-6 mb-4">
                <h5>Join Our Community</h5>
                <p>Discord or other social platforms link would go here.</p>
              </div>
              <div class="col-md-6 mb-4">
                <h5>Follow Us</h5>
                <p>Stay updated with the latest news and events.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const successMessage = ref('')

const submitForm = () => {
  // Simulate form submission
  console.log('Form submitted:', form.value)
  successMessage.value = `Thanks for your message, ${form.value.name}! We'll get back to you soon.`

  // Reset form
  setTimeout(() => {
    form.value = {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
    successMessage.value = ''
  }, 3000)
}
</script>

<style scoped>
h1 {
  font-weight: 700;
  margin-bottom: 1rem;
}

h2 {
  font-weight: 700;
}

.lead {
  font-size: 1.25rem;
  color: var(--text);
}

.form-label {
  color: var(--text);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-control {
  background: rgba(201, 180, 224, 0.05);
  border: 1px solid rgba(201, 180, 224, 0.1);
  color: var(--text);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 1rem;
}

.form-control:focus {
  background: rgba(201, 180, 224, 0.1);
  border-color: var(--accent);
  color: var(--text);
  box-shadow: 0 0 0 0.2rem rgba(57, 255, 20, 0.25);
}

.form-control::placeholder {
  color: var(--muted);
}

.btn-primary {
  background: linear-gradient(90deg, var(--accent), var(--accent-2)) !important;
  color: #2a1b3d !important;
  border: none !important;
  font-weight: 600 !important;
  padding: 12px 28px !important;
  border-radius: 10px !important;
}

.btn-primary:hover {
  opacity: 0.9;
  color: #2a1b3d !important;
}

.contact-info h5 {
  color: var(--text);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.contact-info p {
  color: var(--muted);
}
</style>
