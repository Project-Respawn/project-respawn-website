<template>
  <div class="timezone-selector">
    <label class="timezone-selector__label" :for="id">{{ label }}</label>
    <select :id="id" class="timezone-selector__select" :value="modelValue" @change="onChange">
      <option value="">Select a time zone</option>
      <optgroup v-for="group in selectableGroups" :key="group.label" :label="group.label">
        <option v-for="zone in group.zones" :key="zone.id" :value="zone.id">
          {{ zone.label }} — {{ zone.offset }} currently
        </option>
      </optgroup>
    </select>
    <p v-if="modelValue" class="timezone-selector__help">Stored as {{ modelValue }} so daylight-saving changes update automatically.</p>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { detectBrowserTimezone, formatCurrentUtcOffset, KNOWN_TIMEZONE_IDS, TIMEZONE_GROUPS } from './timezones.js';

const props = defineProps({
  modelValue: { type: String, default: '' },
  id: { type: String, default: 'timezone' },
  label: { type: String, default: 'Time zone' },
});
const emit = defineEmits(['update:modelValue']);
const detectedTimezone = detectBrowserTimezone();

const selectableGroups = computed(() => {
  const groups = TIMEZONE_GROUPS.map((group) => ({
    ...group,
    zones: group.zones.map(([id, label]) => ({ id, label, offset: formatCurrentUtcOffset(id) })),
  }));
  if (detectedTimezone && !KNOWN_TIMEZONE_IDS.has(detectedTimezone)) {
    groups.unshift({ label: 'Detected', zones: [{ id: detectedTimezone, label: 'Your browser time zone', offset: formatCurrentUtcOffset(detectedTimezone) }] });
  }
  return groups;
});

const onChange = (event) => emit('update:modelValue', event.target.value);
onMounted(() => { if (!props.modelValue && detectedTimezone) emit('update:modelValue', detectedTimezone); });
</script>

<style scoped>
.timezone-selector { display:flex; flex-direction:column; gap:.3rem; }
.timezone-selector__label { font-size:.9rem; color:#dbe2ff; }
.timezone-selector__select { width:100%; padding:.55rem .7rem; border:1px solid rgba(122,101,220,.7); border-radius:.6rem; color:#f3f7ff; background:rgba(10,7,30,.95); font:inherit; }
.timezone-selector__select:focus { outline:none; border-color:rgba(196,151,255,.95); box-shadow:0 0 0 1px rgba(196,151,255,.6); }
.timezone-selector__help { margin:0; color:#aeb8db; font-size:.8rem; line-height:1.4; }
</style>
