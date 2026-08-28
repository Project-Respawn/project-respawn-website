<template>
  <section class="chat-sources">
    <!-- =========================================================
         HEADER
    ========================================================== -->
    <header class="chat-sources__header">
      <div>
        <h2>
          Chat Sources
        </h2>

        <p>
          Choose which connected platforms contribute to
          your unified chat.
        </p>
      </div>
    </header>

    <!-- =========================================================
         SOURCES
    ========================================================== -->
    <div class="chat-sources__list">
      <article
        v-for="source in sourceOptions"
        :key="source.id"
        class="source-card"
        :class="{
          'source-card--enabled':
            isSourceEnabled(source.id),
          'source-card--unavailable':
            !source.available,
        }"
      >
        <div
          class="source-card__icon"
          :class="
            `source-card__icon--${source.id}`
          "
        >
          {{ source.shortLabel }}
        </div>

        <div class="source-card__body">
          <div class="source-card__heading">
            <div class="source-card__identity">
              <strong>
                {{ source.label }}
              </strong>

              <span
                v-if="source.account"
                class="source-card__account"
              >
                {{ source.account }}
              </span>
            </div>

            <span
              class="source-status"
              :class="{
                'source-status--connected':
                  source.connected,
                'source-status--soon':
                  !source.connected,
              }"
            >
              {{
                source.connected
                  ? 'Connected'
                  : 'Soon'
              }}
            </span>
          </div>

          <div class="source-card__control">
            <span>
              Include in chat
            </span>

            <label
              class="toggle"
              :class="{
                'toggle--disabled':
                  !source.available,
              }"
            >
              <input
                type="checkbox"
                :checked="
                  isSourceEnabled(
                    source.id
                  )
                "
                :disabled="
                  !source.available
                "
                @change="
                  setSourceEnabled(
                    source.id,
                    $event.target.checked
                  )
                "
              />

              <span class="toggle__track">
                <span class="toggle__thumb"></span>
              </span>
            </label>
          </div>
        </div>
      </article>
    </div>

    <!-- =========================================================
         INFORMATION
    ========================================================== -->
    <div class="chat-sources__info">
      <span class="chat-sources__info-icon">
        i
      </span>

      <p>
        Enabled sources are combined into the same unified
        chat. Connect and manage accounts from
        <strong>Integrations</strong>.
      </p>
    </div>
  </section>
</template>

<script setup>
const model = defineModel({
  type: Object,
  required: true,
})

const emit = defineEmits([
  'change',
])

/* =========================================================
   SOURCE METADATA

   Connection/account state is visual only for now.
   This can later come from the selected Brand integrations.
========================================================= */

const sourceOptions = Object.freeze([
  {
    id: 'twitch',
    label: 'Twitch',
    shortLabel: 'T',
    account: 'Project Respawn',
    connected: true,
    available: true,
  },

  {
    id: 'youtube',
    label: 'YouTube',
    shortLabel: '▶',
    account: null,
    connected: false,
    available: false,
  },

  {
    id: 'tiktok',
    label: 'TikTok',
    shortLabel: '♪',
    account: null,
    connected: false,
    available: false,
  },

  {
    id: 'discord',
    label: 'Discord',
    shortLabel: 'D',
    account: null,
    connected: false,
    available: false,
  },

  {
    id: 'kick',
    label: 'Kick',
    shortLabel: 'K',
    account: null,
    connected: false,
    available: false,
  },
])

/* =========================================================
   SOURCE STATE
========================================================= */

function ensureSource(
  sourceId
) {
  if (
    !model.value[sourceId]
  ) {
    model.value[sourceId] = {
      enabled: false,
    }
  }

  return model.value[sourceId]
}

function isSourceEnabled(
  sourceId
) {
  return (
    model.value?.[sourceId]
      ?.enabled ??
    false
  )
}

function setSourceEnabled(
  sourceId,
  enabled
) {
  const source =
    ensureSource(
      sourceId
    )

  source.enabled =
    enabled

  emit('change')
}
</script>

<style scoped>
/* =========================================================
   PANEL
========================================================= */

.chat-sources {
  width: 100%;
  min-width: 0;

  overflow: hidden;

  border:
    1px solid #222a35;

  border-radius: 10px;

  background:
    linear-gradient(
      180deg,
      rgba(14, 20, 28, 0.98),
      rgba(9, 14, 21, 0.98)
    );
}

/* =========================================================
   HEADER
========================================================= */

.chat-sources__header {
  padding:
    17px
    18px
    15px;

  border-bottom:
    1px solid #1e2630;
}

.chat-sources__header h2 {
  margin: 0;

  color: #eef2f7;

  font-size: 15px;
  font-weight: 700;
}

.chat-sources__header p {
  margin:
    5px
    0
    0;

  color: #7f8a99;

  font-size: 10px;
  line-height: 1.45;
}

/* =========================================================
   LIST
========================================================= */

.chat-sources__list {
  display: flex;

  flex-direction: column;
}

.source-card {
  display: grid;

  grid-template-columns:
    38px
    minmax(0, 1fr);

  gap: 10px;

  padding:
    13px
    14px;

  box-sizing: border-box;

  border-bottom:
    1px solid #1d242e;

  transition:
    background 0.16s ease;
}

.source-card:last-child {
  border-bottom: 0;
}

.source-card:hover {
  background:
    rgba(
      255,
      255,
      255,
      0.018
    );
}

.source-card--enabled {
  background:
    linear-gradient(
      90deg,
      rgba(
        124,
        58,
        237,
        0.07
      ),
      transparent 70%
    );
}

.source-card--unavailable {
  opacity: 0.56;
}

/* =========================================================
   ICON
========================================================= */

.source-card__icon {
  display: flex;

  width: 34px;
  height: 34px;

  align-items: center;
  justify-content: center;

  border-radius: 7px;

  color: #fff;

  font-size: 11px;
  font-weight: 800;
}

.source-card__icon--twitch {
  background: #9146ff;
}

.source-card__icon--youtube {
  background: #ff0033;
}

.source-card__icon--tiktok {
  border:
    1px solid #343c48;

  background: #171e27;
}

.source-card__icon--discord {
  background: #5865f2;
}

.source-card__icon--kick {
  color: #101510;

  background: #53fc18;
}

/* =========================================================
   CONTENT
========================================================= */

.source-card__body {
  min-width: 0;
}

.source-card__heading {
  display: flex;

  align-items: flex-start;
  justify-content: space-between;

  gap: 6px;
}

.source-card__identity {
  display: flex;

  min-width: 0;

  flex-direction: column;

  gap: 3px;
}

.source-card__identity strong {
  overflow: hidden;

  color: #e5eaf0;

  font-size: 11px;
  font-weight: 700;

  text-overflow: ellipsis;

  white-space: nowrap;
}

.source-card__account {
  overflow: hidden;

  color: #7f8a99;

  font-size: 9px;

  text-overflow: ellipsis;

  white-space: nowrap;
}

/* =========================================================
   STATUS
========================================================= */

.source-status {
  flex: none;

  padding:
    2px
    5px;

  border-radius: 4px;

  font-size: 8px;
  font-weight: 700;
}

.source-status--connected {
  border:
    1px solid
    rgba(
      34,
      197,
      94,
      0.28
    );

  color: #72e996;

  background:
    rgba(
      34,
      197,
      94,
      0.09
    );
}

.source-status--soon {
  border:
    1px solid #303844;

  color: #8d97a5;

  background: #171d25;
}

/* =========================================================
   CONTROL
========================================================= */

.source-card__control {
  display: flex;

  min-height: 24px;

  align-items: center;
  justify-content: space-between;

  gap: 8px;

  margin-top: 9px;

  color: #697584;

  font-size: 9px;
}

/* =========================================================
   TOGGLE
========================================================= */

.toggle {
  position: relative;

  display: inline-flex;

  flex: none;

  cursor: pointer;
}

.toggle input {
  position: absolute;

  opacity: 0;

  pointer-events: none;
}

.toggle__track {
  display: inline-flex;

  width: 30px;
  height: 17px;

  align-items: center;

  padding: 2px;

  box-sizing: border-box;

  border:
    1px solid #414a56;

  border-radius: 999px;

  background: #2e3641;

  transition:
    background 0.16s ease,
    border-color 0.16s ease;
}

.toggle__thumb {
  width: 11px;
  height: 11px;

  border-radius: 50%;

  background: #d8dee6;

  transition:
    transform 0.16s ease;
}

.toggle input:checked +
.toggle__track {
  border-color: #8b5cf6;

  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #a855f7
    );
}

.toggle
input:checked +
.toggle__track
.toggle__thumb {
  transform:
    translateX(13px);
}

.toggle--disabled {
  cursor: not-allowed;
}

/* =========================================================
   INFO
========================================================= */

.chat-sources__info {
  display: flex;

  gap: 8px;

  align-items: flex-start;

  margin: 12px;

  padding: 10px;

  border:
    1px solid #282f3a;

  border-radius: 7px;

  background: #111821;
}

.chat-sources__info-icon {
  display: flex;

  width: 18px;
  height: 18px;

  flex: none;

  align-items: center;
  justify-content: center;

  border:
    1px solid #8b5cf6;

  border-radius: 50%;

  color: #c084fc;

  font-size: 9px;
  font-weight: 700;
}

.chat-sources__info p {
  margin: 0;

  color: #808b99;

  font-size: 9px;
  line-height: 1.5;
}

.chat-sources__info strong {
  color: #bda5fb;

  font-weight: 600;
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 600px) {
  .source-card {
    grid-template-columns:
      36px
      minmax(0, 1fr);

    padding:
      12px
      13px;
  }

  .chat-sources__header {
    padding:
      15px
      14px;
  }
}
</style>