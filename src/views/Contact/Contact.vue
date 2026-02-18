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

<style scoped src="./Contact.css"></style>
