<template>
  <main class="applications-page">
    <section class="applications-shell">
      <!-- HEADER -->
      <header class="applications-header">
        <div class="applications-header-copy">
          <p class="applications-eyebrow">Project Respawn</p>
          <h1>Apply to join the mission.</h1>
          <p class="applications-subtitle">
            One application for streamers, therapists, trainers, and competitive players. 
            Start with what you’re applying to do, then answer a few focused questions about your role and fit.
          </p>
        </div>

        <div class="applications-step-indicator">
          <span class="step-label">Step {{ currentStep }} of 4</span>
          <div class="step-bar">
            <span
              v-for="step in 4"
              :key="step"
              class="step-bar-segment"
              :class="{ 'is-active': step <= currentStep }"
            ></span>
          </div>
        </div>
      </header>

      <!-- FORM BODY -->
      <form class="applications-form" @submit.prevent="submitApplication">
        <!-- STEP 1: APPLICATION TYPE -->
        <section
          v-if="currentStep === 1"
          class="application-step"
        >
          <h2 class="step-title">What are you applying to do?</h2>
          <p class="step-intro">
            Choose the option that best describes how you want to work with Project Respawn.
          </p>

          <div class="role-grid">
            <button
              type="button"
              class="role-card"
              :class="{ 'is-selected': applicationType === 'streamer-community' }"
              @click="setApplicationType('streamer-community')"
            >
              <h3>Streamer – Social confidence & community</h3>
              <p>For channels focused on conversation, support, and helping viewers grow over time.</p>
            </button>

            <button
              type="button"
              class="role-card"
              :class="{ 'is-selected': applicationType === 'streamer-competitive' }"
              @click="setApplicationType('streamer-competitive')"
            >
              <h3>Streamer – Competitive</h3>
              <p>For players focused on ranked grind, tournaments, and performance-driven content.</p>
            </button>

            <button
              type="button"
              class="role-card"
              :class="{ 'is-selected': applicationType === 'streamer-both' }"
              @click="setApplicationType('streamer-both')"
            >
              <h3>Streamer – Both</h3>
              <p>If you blend competitive play with a strong community / confidence focus.</p>
            </button>

            <button
              type="button"
              class="role-card"
              :class="{ 'is-selected': applicationType === 'therapist' }"
              @click="setApplicationType('therapist')"
            >
              <h3>Therapist</h3>
              <p>For mental health professionals who want to connect their practice to quests and progression.</p>
            </button>

            <button
              type="button"
              class="role-card"
              :class="{ 'is-selected': applicationType === 'trainer' }"
              @click="setApplicationType('trainer')"
            >
              <h3>Personal trainer</h3>
              <p>For trainers who want to tie physical training to confidence-building challenges.</p>
            </button>

            <button
              type="button"
              class="role-card"
              :class="{ 'is-selected': applicationType === 'competitive-only' }"
              @click="setApplicationType('competitive-only')"
            >
              <h3>Competitive player only</h3>
              <p>For players who want to try out for teams or org representation without streaming.</p>
            </button>
          </div>

          <div class="step-nav">
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!applicationType"
              @click="goToNextStep"
            >
              Next
            </button>
          </div>
        </section>

        <!-- STEP 2: SHARED BASICS -->
        <section
          v-if="currentStep === 2"
          class="application-step"
        >
          <h2 class="step-title">Basic details</h2>
          <p class="step-intro">
            These details help us contact you and understand where you are in the world.
          </p>

          <div class="fields-grid">
            <div class="field">
              <label class="field-label" for="name">Display / professional name</label>
              <input
                id="name"
                v-model="profile.name"
                type="text"
                class="field-input"
                required
              />
            </div>

            <div class="field">
              <label class="field-label" for="pronouns">Pronouns (optional)</label>
              <input
                id="pronouns"
                v-model="profile.pronouns"
                type="text"
                class="field-input"
                placeholder="she/her, he/him, they/them..."
              />
            </div>

            <div class="field">
              <label class="field-label" for="discord">Discord tag</label>
              <input
                id="discord"
                v-model="profile.discord"
                type="text"
                class="field-input"
                required
              />
            </div>

            <div class="field">
              <label class="field-label" for="email">Email</label>
              <input
                id="email"
                v-model="profile.email"
                type="email"
                class="field-input"
                required
              />
            </div>

            <div class="field">
              <label class="field-label" for="country">Country / region</label>
              <input
                id="country"
                v-model="profile.country"
                type="text"
                class="field-input"
              />
            </div>

            <div class="field">
              <label class="field-label" for="timezone">Time zone</label>
              <input
                id="timezone"
                v-model="profile.timezone"
                type="text"
                class="field-input"
                placeholder="e.g. GMT, CET, EST..."
              />
            </div>

            <div class="field">
              <label class="field-label" for="ageRange">Age range</label>
              <select
                id="ageRange"
                v-model="profile.ageRange"
                class="field-input"
              >
                <option value="">Select an option</option>
                <option value="16-17">16–17</option>
                <option value="18-24">18–24</option>
                <option value="25-34">25–34</option>
                <option value="35-44">35–44</option>
                <option value="45+">45+</option>
              </select>
            </div>
          </div>

          <div class="step-nav">
            <button
              type="button"
              class="btn btn-outline"
              @click="goToPreviousStep"
            >
              Back
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="goToNextStep"
            >
              Next
            </button>
          </div>
        </section>

        <!-- STEP 3: ROLE-SPECIFIC -->
        <section
          v-if="currentStep === 3"
          class="application-step"
        >
          <!-- STREAMERS -->
          <template v-if="isStreamer">
            <h2 class="step-title">Your channel and role</h2>

            <div class="fields-grid">
              <div class="field">
                <label class="field-label" for="channelLink">
                  Main channel link (Twitch or other)
                </label>
                <input
                  id="channelLink"
                  v-model="streamerProfile.channelLink"
                  type="url"
                  class="field-input"
                  placeholder="https://twitch.tv/yourname"
                />
              </div>

              <div class="field">
                <label class="field-label" for="streamSchedule">
                  When do you stream and how often?
                </label>
                <textarea
                  id="streamSchedule"
                  v-model="streamerProfile.schedule"
                  class="field-textarea"
                  rows="3"
                ></textarea>
              </div>

              <div class="field">
                <label class="field-label">Mental health experience</label>
                <div class="chip-row">
                  <button
                    type="button"
                    class="chip"
                    :class="{ 'is-selected': streamerProfile.mentalHealth === 'lived-experience' }"
                    @click="setStreamerMentalHealth('lived-experience')"
                  >
                    Lived experience
                  </button>
                  <button
                    type="button"
                    class="chip"
                    :class="{ 'is-selected': streamerProfile.mentalHealth === 'training' }"
                    @click="setStreamerMentalHealth('training')"
                  >
                    Professional training
                  </button>
                  <button
                    type="button"
                    class="chip"
                    :class="{ 'is-selected': streamerProfile.mentalHealth === 'some-experience' }"
                    @click="setStreamerMentalHealth('some-experience')"
                  >
                    Some experience
                  </button>
                  <button
                    type="button"
                    class="chip"
                    :class="{ 'is-selected': streamerProfile.mentalHealth === 'none' }"
                    @click="setStreamerMentalHealth('none')"
                  >
                    None
                  </button>
                </div>
              </div>

              <div class="field">
                <label class="field-label">What role do you want to fill?</label>
                <div class="chip-row">
                  <button
                    type="button"
                    class="chip"
                    :class="{ 'is-selected': streamerRole === 'org-player' }"
                    @click="setStreamerRole('org-player')"
                  >
                    Org player
                  </button>
                  <button
                    type="button"
                    class="chip"
                    :class="{ 'is-selected': streamerRole === 'community-streamer' }"
                    @click="setStreamerRole('community-streamer')"
                  >
                    Community streamer
                  </button>
                  <button
                    type="button"
                    class="chip"
                    :class="{ 'is-selected': streamerRole === 'event-host' }"
                    @click="setStreamerRole('event-host')"
                  >
                    Event host / organiser
                  </button>
                  <button
                    type="button"
                    class="chip"
                    :class="{ 'is-selected': streamerRole === 'hybrid' }"
                    @click="setStreamerRole('hybrid')"
                  >
                    Hybrid / not sure yet
                  </button>
                </div>
              </div>

              <div class="field">
                <label class="field-label" for="whyApplyStreamer">
                  Why do you want to apply?
                </label>
                <textarea
                  id="whyApplyStreamer"
                  v-model="streamerProfile.whyApply"
                  class="field-textarea"
                  rows="3"
                ></textarea>
              </div>

              <div class="field">
                <label class="field-label" for="confidenceFit">
                  How do you see Project Respawn fitting your content?
                </label>
                <textarea
                  id="confidenceFit"
                  v-model="streamerProfile.confidenceFit"
                  class="field-textarea"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </template>

          <!-- THERAPISTS -->
          <template v-else-if="applicationType === 'therapist'">
            <h2 class="step-title">Your practice</h2>

            <div class="fields-grid">
              <div class="field">
                <label class="field-label" for="practiceType">
                  Type of practice
                </label>
                <input
                  id="practiceType"
                  v-model="therapistProfile.practiceType"
                  type="text"
                  class="field-input"
                  placeholder="Private practice, charity, NHS..."
                />
              </div>

              <div class="field">
                <label class="field-label" for="qualifications">
                  Qualifications / registration
                </label>
                <input
                  id="qualifications"
                  v-model="therapistProfile.qualifications"
                  type="text"
                  class="field-input"
                />
              </div>

              <div class="field">
                <label class="field-label" for="clientFocus">
                  Primary client groups
                </label>
                <textarea
                  id="clientFocus"
                  v-model="therapistProfile.clientFocus"
                  class="field-textarea"
                  rows="3"
                ></textarea>
              </div>

              <div class="field">
                <label class="field-label" for="questsUsageTherapist">
                  How do you imagine using quests and progression with clients?
                </label>
                <textarea
                  id="questsUsageTherapist"
                  v-model="therapistProfile.questsUsage"
                  class="field-textarea"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </template>

          <!-- TRAINERS -->
          <template v-else-if="applicationType === 'trainer'">
            <h2 class="step-title">Your training focus</h2>

            <div class="fields-grid">
              <div class="field">
                <label class="field-label" for="trainingFocus">
                  Training focus
                </label>
                <input
                  id="trainingFocus"
                  v-model="trainerProfile.trainingFocus"
                  type="text"
                  class="field-input"
                  placeholder="Strength, cardio, esports performance..."
                />
              </div>

              <div class="field">
                <label class="field-label" for="deliveryMode">
                  Delivery mode
                </label>
                <select
                  id="deliveryMode"
                  v-model="trainerProfile.deliveryMode"
                  class="field-input"
                >
                  <option value="">Select an option</option>
                  <option value="in-person">In-person</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div class="field">
                <label class="field-label" for="questsUsageTrainer">
                  How do you imagine using quests and progression with clients?
                </label>
                <textarea
                  id="questsUsageTrainer"
                  v-model="trainerProfile.questsUsage"
                  class="field-textarea"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </template>

          <!-- COMPETITIVE ONLY -->
          <template v-else-if="applicationType === 'competitive-only'">
            <h2 class="step-title">Competitive tryout details</h2>

            <div class="field">
              <label class="field-label" for="gameSelection">
                What game are you applying for?
              </label>
              <select
                id="gameSelection"
                v-model="competitiveProfile.game"
                class="field-input"
              >
                <option value="">Select a game</option>
                <option value="lol">League of Legends</option>
                <option value="valorant">Valorant</option>
                <option value="fortnite">Fortnite</option>
                <option value="eafc">EA FC</option>
                <option value="cs2">CS2</option>
                <option value="apex">Apex Legends</option>
                <option value="rocket-league">Rocket League</option>
                <option value="overwatch">Overwatch 2</option>
                <option value="cod">Call of Duty</option>
                <option value="sim-grid">Sim Grid / Racing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <!-- Example: generic rank/role block, you can later branch per game -->
            <div class="fields-grid">
              <div class="field">
                <label class="field-label" for="platform">
                  Platform
                </label>
                <input
                  id="platform"
                  v-model="competitiveProfile.platform"
                  type="text"
                  class="field-input"
                  placeholder="PC, Xbox, PlayStation..."
                />
              </div>

              <div class="field">
                <label class="field-label" for="peakRank">
                  Peak rank
                </label>
                <input
                  id="peakRank"
                  v-model="competitiveProfile.peakRank"
                  type="text"
                  class="field-input"
                />
              </div>

              <div class="field">
                <label class="field-label" for="currentRank">
                  Current rank
                </label>
                <input
                  id="currentRank"
                  v-model="competitiveProfile.currentRank"
                  type="text"
                  class="field-input"
                />
              </div>

              <div class="field">
                <label class="field-label" for="roles">
                  Roles / positions
                </label>
                <input
                  id="roles"
                  v-model="competitiveProfile.roles"
                  type="text"
                  class="field-input"
                />
              </div>

              <div class="field">
                <label class="field-label" for="yearsCompetitive">
                  Years playing competitively
                </label>
                <input
                  id="yearsCompetitive"
                  v-model.number="competitiveProfile.years"
                  type="number"
                  min="0"
                  class="field-input"
                />
              </div>
            </div>

            <div class="field">
              <label class="field-label" for="aboutCompetitive">
                Tell us about yourself as a player and why you’re a good fit.
              </label>
              <textarea
                id="aboutCompetitive"
                v-model="competitiveProfile.about"
                class="field-textarea"
                rows="3"
              ></textarea>
            </div>
          </template>

          <div class="step-nav">
            <button
              type="button"
              class="btn btn-outline"
              @click="goToPreviousStep"
            >
              Back
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="goToNextStep"
            >
              Next
            </button>
          </div>
        </section>

        <!-- STEP 4: ALIGNMENT & CONSENT -->
        <section
          v-if="currentStep === 4"
          class="application-step"
        >
          <h2 class="step-title">Alignment and final details</h2>

          <div class="fields-grid">
            <div class="field">
              <label class="field-label" for="fitReason">
                Why do you think you’re a good fit for our mission?
              </label>
              <textarea
                id="fitReason"
                v-model="alignment.fitReason"
                class="field-textarea"
                rows="3"
              ></textarea>
            </div>

            <div class="field">
              <label class="field-label" for="questions">
                Anything else we should know? (optional)
              </label>
              <textarea
                id="questions"
                v-model="alignment.questions"
                class="field-textarea"
                rows="3"
              ></textarea>
            </div>

            <div class="field field-inline">
              <input
                id="termsAccepted"
                v-model="alignment.termsAccepted"
                type="checkbox"
                class="field-checkbox"
              />
              <label class="field-label-inline" for="termsAccepted">
                I agree to follow the Project Respawn code of conduct and understand this is a beta program.
              </label>
            </div>
          </div>

          <div class="step-nav">
            <button
              type="button"
              class="btn btn-outline"
              @click="goToPreviousStep"
            >
              Back
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!alignment.termsAccepted"
            >
              Submit application
            </button>
          </div>
        </section>
      </form>
    </section>
  </main>
</template>

<script src="./Applications.js"></script>
<style scoped src="./Applications.css"></style>