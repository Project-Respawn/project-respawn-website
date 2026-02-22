<template>
  <main class="container py-5">
    <section>
        <h1>Events</h1>
        <FullCalendar :options="calendarOptions" />
      </section>
  </main>
</template>


<script setup>

import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import { ref, watch } from 'vue'

const calendarOptions = ref({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  weekends: true,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth'
  },
  initialView: 'dayGridMonth',  
  events: [], // events will be populated from the reactive `calendarEvents`
})

let events = [
  { title: 'Event 1', start: new Date(), end: new Date(new Date().getTime() + 2 * 60 * 60 * 1000) },
  { title: 'Event 2', start: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), end: new Date(new Date().getTime() + 4 * 60 * 60 * 1000) }
]

// Initialize the reactive events array from `events`
const calendarEvents = ref([...events])

// Keep `calendarOptions.events` in sync by reassigning the options object when events change.
calendarOptions.value = { ...calendarOptions.value, events: calendarEvents.value }

watch(calendarEvents, (val) => {
  calendarOptions.value = { ...calendarOptions.value, events: val }
})

// small demo helpers to add events — reassign the array so the wrapper sees the change
const newTitle = ref('New event')
function addEvent(evt) {
  calendarEvents.value = [...calendarEvents.value, evt]
}
function handleAddEvent() {
  const now = new Date()
  addEvent({ title: newTitle.value || 'Untitled', start: now, end: new Date(now.getTime() + 60 * 60 * 1000) })
}
</script>

<style scoped src="./Events.css"></style>
