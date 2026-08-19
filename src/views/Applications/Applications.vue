<template>
  <main class="applications-page">
    <section class="applications-shell">
      <!-- HEADER -->
      <header class="applications-header">
        <div class="applications-header-copy">
          <p class="applications-eyebrow">Project Respawn</p>
          <h1>Apply to join the mission.</h1>
          <p class="applications-subtitle">
            One application system with a pathway tailored to your role.
            Start with what you’re applying to do, then answer a few focused questions about your role and fit.
          </p>
        </div>

        <div class="applications-step-indicator">
          <span class="step-label">Step {{ currentStep }} of 4 · {{ stepState(currentStep) }}</span>
          <div class="step-bar">
            <span
              v-for="step in 4"
              :key="step"
              class="step-bar-segment"
              :class="{ 'is-active': step <= currentStep }"
              :title="`Step ${step}: ${stepState(step)}`"
            ></span>
          </div>
        </div>
      </header>

      <!-- FORM BODY -->
      <form class="applications-form" novalidate @submit.prevent="submitApplication" @focusout="handleFieldBlur">
        <section v-if="summaryVisible && [...validationIssues, ...serverIssues].length" id="application-error-summary" class="validation-summary" tabindex="-1" role="alert" aria-labelledby="validation-summary-title">
          <h2 id="validation-summary-title">Some information needs attention</h2><p>We have kept all your answers. Select an item below to go directly to the field that needs to be corrected.</p>
          <ul><li v-for="(issue,index) in [...serverIssues,...validationIssues]" :key="`${issue.field}-${index}`"><button type="button" @click="goToIssue(issue)">{{ issue.message }}</button></li></ul>
        </section>
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
              :class="{ 'is-selected': applicationType === 'creator' }"
              @click="setApplicationType('creator')"
            >
              <h3>Project Respawn Creator Programme</h3>
              <p>For casual, community-focused, entertainment, competitive, or blended creators.</p>
            </button>

            <button
              type="button"
              class="role-card role-card--closed"
              :class="{ 'is-selected': applicationType === 'competitive-streamer' }"
              aria-label="Competitive streamer — applications currently closed"
              @click="setApplicationType('competitive-streamer')"
            >
              <h3>Competitive streamer <span class="pathway-status">Closed</span></h3>
              <p>For creators whose content focuses on ranked play, tournaments, or performance.</p>
            </button>

            <button
              type="button"
              class="role-card role-card--closed"
              :class="{ 'is-selected': applicationType === 'competitive-player' }"
              aria-label="Competitive player or esports roster — applications currently closed"
              @click="setApplicationType('competitive-player')"
            >
              <h3>Competitive player or esports roster <span class="pathway-status">Closed</span></h3>
              <p>For players seeking a team trial, roster place, or org representation.</p>
            </button>

            <button type="button" class="role-card role-card--closed" :class="{ 'is-selected': applicationType === 'competitive-coaching' }" aria-label="Competitive coaching — applications currently closed" @click="setApplicationType('competitive-coaching')">
              <h3>Competitive coaching <span class="pathway-status">Closed</span></h3>
              <p>For coaches who help players or teams improve through structured practice and feedback.</p>
            </button>

            <button type="button" class="role-card role-card--closed" :class="{ 'is-selected': applicationType === 'competitive-analysis' }" aria-label="Competitive analysis or support staff — applications currently closed" @click="setApplicationType('competitive-analysis')">
              <h3>Competitive analysis or support staff <span class="pathway-status">Closed</span></h3>
              <p>For analysts, managers, and specialist competitive support roles.</p>
            </button>

            <button
              type="button"
              class="role-card role-card--coming-soon"
              :class="{ 'is-selected': applicationType === 'therapist' }"
              @click="setApplicationType('therapist')"
            >
              <FeatureTeaser
                title="Therapist"
                description="For mental health professionals who want to connect their practice to quests and progression."
                variant="card"
                heading-tag="h3"
              />
            </button>

            <button
              type="button"
              class="role-card role-card--coming-soon"
              :class="{ 'is-selected': applicationType === 'trainer' }"
              @click="setApplicationType('trainer')"
            >
              <FeatureTeaser
                title="Personal trainer"
                description="For trainers who want to tie physical training to confidence-building challenges."
                variant="card"
                heading-tag="h3"
              />
            </button>

          </div>

          <div v-if="isComingSoon" class="coming-soon-panel" role="region" aria-live="polite">
            <FeatureTeaser
              title="Applications for Project Respawn professional partners are coming soon."
              :description="comingSoonCopy"
              cta-label="Return to application choices"
              variant="card"
              heading-tag="h2"
              @cta="returnToChoices"
            />
          </div>

          <section v-if="isClosed" class="closed-recruitment-panel" role="region" aria-live="polite" :aria-label="`${selectedPathwayLabel} availability`">
            <p class="applications-eyebrow">{{ selectedPathwayLabel }} · Closed</p>
            <h2 tabindex="-1">Competitive applications are currently closed</h2>
            <p>We are not currently recruiting for our competitive teams. If you are a streamer or content creator interested in working with Project Respawn, you can still apply to our Creator Programme for consideration.</p>
            <div class="closed-recruitment-actions">
              <button type="button" class="btn btn-primary" @click="startCreatorApplication">Apply to the Creator Programme</button>
              <button type="button" class="btn btn-outline" @click="returnToChoices">Return to application pathways</button>
            </div>
          </section>

          <div v-if="isActivePathway" class="step-nav">
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
                :aria-invalid="fieldStatus('name') === 'invalid'" aria-describedby="name-feedback"
                required
              />
              <FieldValidation id="name-feedback" :feedback="feedback('name')" />
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
              <label class="field-label" for="creatorName">Creator / channel name</label>
              <input id="creatorName" v-model="profile.creatorName" type="text" class="field-input" required :aria-invalid="fieldStatus('creatorName') === 'invalid'" aria-describedby="creatorName-feedback" /><FieldValidation id="creatorName-feedback" :feedback="feedback('creatorName')" />
            </div>

            <div class="field">
              <label class="field-label" for="discord">Discord tag</label>
              <input
                id="discord"
                v-model="profile.discord"
                type="text"
                class="field-input"
                :aria-invalid="fieldStatus('discord') === 'invalid'" aria-describedby="discord-feedback"
                required
              />
              <FieldValidation id="discord-feedback" :feedback="feedback('discord')" />
            </div>

            <div class="field">
              <label class="field-label" for="email">Email</label>
              <input
                id="email"
                v-model="profile.email"
                type="email"
                class="field-input"
                :aria-invalid="fieldStatus('email') === 'invalid'" aria-describedby="email-feedback"
                required
              />
              <FieldValidation id="email-feedback" :feedback="feedback('email', 'Valid email address')" />
            </div>

            <div class="field">
              <label class="field-label" for="confirmEmail">Confirm contact email</label>
              <input id="confirmEmail" v-model="profile.confirmEmail" type="email" class="field-input" required :aria-invalid="fieldStatus('confirmEmail') === 'invalid'" aria-describedby="confirmEmail-feedback confirmEmail-help" />
              <FieldValidation id="confirmEmail-feedback" :feedback="feedback('confirmEmail', 'Email addresses match')" />
              <p id="confirmEmail-help" class="field-help">Please check your email address carefully. We will use it to send the outcome of your application and, if successful, your induction invitation.</p>
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

            <TimezoneSelector v-model="profile.timezone" />

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
                <label class="field-label" for="creatorPlatform">Primary platform</label>
                <select id="creatorPlatform" v-model="streamerProfile.platform" class="field-input" required :aria-invalid="fieldStatus('creatorPlatform') === 'invalid'" aria-describedby="creatorPlatform-feedback">
                  <option value="Twitch">Twitch</option><option value="YouTube">YouTube</option>
                  <option value="TikTok">TikTok</option><option value="Kick">Kick</option><option value="Other">Other</option>
                </select><FieldValidation id="creatorPlatform-feedback" :feedback="feedback('creatorPlatform')" />
              </div>
              <div v-if="streamerProfile.platform === 'Other'" class="field">
                <label class="field-label" for="customPlatformLabel">Platform name</label>
                <input id="customPlatformLabel" v-model="streamerProfile.customPlatformLabel" class="field-input" required :aria-invalid="fieldStatus('customPlatformLabel') === 'invalid'" aria-describedby="customPlatformLabel-feedback" /><FieldValidation id="customPlatformLabel-feedback" :feedback="feedback('customPlatformLabel')" />
              </div>
              <div class="field">
                <label class="field-label" for="creatorHandle">Public handle</label>
                <input id="creatorHandle" v-model="streamerProfile.handle" class="field-input" required :aria-invalid="fieldStatus('creatorHandle') === 'invalid'" aria-describedby="creatorHandle-feedback" /><FieldValidation id="creatorHandle-feedback" :feedback="feedback('creatorHandle')" />
              </div>
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
                  required
                  :aria-invalid="fieldStatus('channelLink') === 'invalid'" aria-describedby="channelLink-feedback"
                />
                <FieldValidation id="channelLink-feedback" :feedback="feedback('channelLink', 'Profile link accepted')" />
              </div>

              <div class="field">
                <label class="field-label" for="otherProfiles">Other public profile links (one per line)</label>
                <textarea id="otherProfiles" v-model="streamerProfile.otherProfiles" class="field-textarea" rows="3" :aria-invalid="fieldStatus('otherProfiles') === 'invalid'" aria-describedby="otherProfiles-feedback"></textarea><FieldValidation id="otherProfiles-feedback" :feedback="feedback('otherProfiles', 'Profile links accepted', true)" />
              </div>

              <div class="field">
                <label class="field-label" for="discordInvite">Public Discord invite (optional)</label>
                <input id="discordInvite" v-model="streamerProfile.discordInvite" type="url" class="field-input" :aria-invalid="fieldStatus('discordInvite') === 'invalid'" aria-describedby="discordInvite-feedback" /><FieldValidation id="discordInvite-feedback" :feedback="feedback('discordInvite', 'Discord link accepted', true)" />
              </div>
              <div class="field">
                <label class="field-label" for="discordRelationship">Your relationship to that Discord community (optional)</label>
                <input id="discordRelationship" v-model="streamerProfile.discordRelationship" class="field-input" />
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

              <div class="field" data-field="streamerRole" tabindex="-1" :aria-invalid="fieldStatus('streamerRole') === 'invalid'" aria-describedby="streamerRole-feedback">
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
                <FieldValidation id="streamerRole-feedback" :feedback="feedback('streamerRole')" />
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
                  :aria-invalid="fieldStatus('whyApplyStreamer') === 'invalid'" aria-describedby="whyApplyStreamer-feedback"
                ></textarea>
                <FieldValidation id="whyApplyStreamer-feedback" :feedback="feedback('whyApplyStreamer')" />
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
                  :aria-invalid="fieldStatus('confidenceFit') === 'invalid'" aria-describedby="confidenceFit-feedback"
                ></textarea>
                <FieldValidation id="confidenceFit-feedback" :feedback="feedback('confidenceFit')" />
              </div>

              <fieldset class="field genre-fieldset" data-field="genres" tabindex="-1" :aria-invalid="fieldStatus('genres') === 'invalid'" aria-describedby="genres-feedback">
                <legend class="field-label">
                  Choose up to five genres
                  <span class="selection-counter">{{ streamerProfile.genres.length }} / 5</span>
                </legend>
                <div class="chip-row">
                  <button
                    v-for="genre in genres"
                    :key="genre"
                    type="button"
                    class="chip"
                    :class="{ 'is-selected': streamerProfile.genres.includes(genre) }"
                    :aria-pressed="streamerProfile.genres.includes(genre)"
                    :disabled="streamerProfile.genres.length >= 5 && !streamerProfile.genres.includes(genre)"
                    @click="toggleGenre(genre)"
                  >
                    {{ genre }}
                  </button>
                </div>
                <FieldValidation id="genres-feedback" :feedback="feedback('genres')" />
              </fieldset>

              <div class="field planned-game-field">
                <label class="field-label" for="favouriteGames">Choose up to three favourite games</label>
                <input id="favouriteGames" v-model="streamerProfile.games" class="field-input" placeholder="Game one, Game two, Game three" :aria-invalid="fieldStatus('favouriteGames') === 'invalid'" aria-describedby="favouriteGames-feedback" /><FieldValidation id="favouriteGames-feedback" :feedback="feedback('favouriteGames', 'Games accepted', true)" />
              </div>

              <div class="field field-inline">
                <input id="hasRegularSchedule" v-model="schedule.hasRegularSchedule" type="checkbox" class="field-checkbox" />
                <label class="field-label-inline" for="hasRegularSchedule">I have a regular public content schedule</label>
              </div>
              <div class="field field-inline">
                <input id="scheduleVaries" v-model="schedule.scheduleVaries" type="checkbox" class="field-checkbox" />
                <label class="field-label-inline" for="scheduleVaries">My schedule varies</label>
              </div>
              <template v-if="!schedule.scheduleVaries">
                <div class="field"><label class="field-label" for="scheduleDay">Usual day</label><select id="scheduleDay" v-model="schedule.dayOfWeek" class="field-input" :aria-invalid="fieldStatus('scheduleDay') === 'invalid'" aria-describedby="scheduleDay-feedback"><option value="">Select day</option><option v-for="day in ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']" :key="day">{{ day }}</option></select><FieldValidation id="scheduleDay-feedback" :feedback="feedback('scheduleDay', 'Schedule day accepted')" /></div>
                <div class="field"><label class="field-label" for="scheduleStart">Start time</label><input id="scheduleStart" v-model="schedule.startLocalTime" type="time" class="field-input" :aria-invalid="fieldStatus('scheduleStart') === 'invalid'" aria-describedby="scheduleStart-feedback" /><FieldValidation id="scheduleStart-feedback" :feedback="feedback('scheduleStart', 'Schedule time accepted')" /></div>
                <div class="field"><label class="field-label" for="scheduleEnd">End time</label><input id="scheduleEnd" v-model="schedule.endLocalTime" type="time" class="field-input" :aria-invalid="fieldStatus('scheduleEnd') === 'invalid'" aria-describedby="scheduleEnd-feedback" /><FieldValidation id="scheduleEnd-feedback" :feedback="feedback('scheduleEnd', 'Schedule time accepted')" /></div>
              </template>
              <div class="field"><label class="field-label" for="contentType">Content type</label><input id="contentType" v-model="schedule.contentType" class="field-input" /></div>
              <div class="field"><label class="field-label" for="nextStream">Next planned public stream (optional)</label><input id="nextStream" v-model="schedule.nextPlannedPublicStream" type="datetime-local" class="field-input" /></div>
              <div class="field"><label class="field-label" for="scheduleNotes">Schedule notes (optional)</label><textarea id="scheduleNotes" v-model="schedule.notes" class="field-textarea" rows="2"></textarea></div>
            </div>
          </template>

          <template v-else-if="isCompetitive">
            <h2 class="step-title">Competitive details</h2>
            <p class="step-intro">Rank provides context but does not decide an application by itself.</p>
            <div class="fields-grid">
              <div class="field">
                <label class="field-label" for="gameSelection">Primary competitive game</label>
                <select id="gameSelection" v-model="competitiveProfile.game" class="field-input" @change="resetCompetitiveSelections">
                  <option v-for="(game, key) in competitiveGames" :key="key" :value="key">{{ game.label }}</option>
                </select>
              </div>
              <div class="field"><label class="field-label" for="platform">Platform</label><input id="platform" v-model="competitiveProfile.platform" class="field-input" type="text" /></div>
              <div class="field"><label class="field-label" for="region">Region</label><input id="region" v-model="competitiveProfile.region" class="field-input" type="text" /></div>
              <div class="field"><label class="field-label" for="currentRank">Current rank</label><select id="currentRank" v-model="competitiveProfile.currentRank" class="field-input"><option value="">Select rank</option><option v-for="rank in rankOptions" :key="rank">{{ rank }}</option></select></div>
              <div class="field"><label class="field-label" for="peakRank">Peak rank</label><select id="peakRank" v-model="competitiveProfile.peakRank" class="field-input"><option value="">Select rank</option><option v-for="rank in rankOptions" :key="rank">{{ rank }}</option></select></div>
              <div class="field"><label class="field-label" for="primaryPosition">Primary position</label><select id="primaryPosition" v-model="competitiveProfile.primaryPosition" class="field-input"><option value="">Select position</option><option v-for="position in positionOptions" :key="position">{{ position }}</option></select></div>
              <div class="field"><label class="field-label" for="secondaryPosition">Secondary position</label><select id="secondaryPosition" v-model="competitiveProfile.secondaryPosition" class="field-input"><option value="">None</option><option v-for="position in positionOptions" :key="position">{{ position }}</option></select></div>
              <div class="field field-inline"><input id="flexiblePosition" v-model="competitiveProfile.flexiblePosition" class="field-checkbox" type="checkbox" /><label class="field-label-inline" for="flexiblePosition">I am willing to trial for another position if needed.</label></div>
              <div class="field"><label class="field-label" for="competitiveExperience">Competitive experience</label><textarea id="competitiveExperience" v-model="competitiveProfile.about" class="field-textarea" rows="4"></textarea></div>
              <template v-if="isCompetitiveSupport">
                <div class="field"><label class="field-label" for="coachingExperience">Coaching, analysis, or support experience</label><textarea id="coachingExperience" v-model="competitiveProfile.coachingExperience" class="field-textarea" rows="4"></textarea></div>
                <div class="field"><label class="field-label" for="coachingMethod">How do you help players or teams improve?</label><textarea id="coachingMethod" v-model="competitiveProfile.coachingMethod" class="field-textarea" rows="4"></textarea></div>
              </template>
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
                :aria-invalid="fieldStatus('fitReason') === 'invalid'" aria-describedby="fitReason-feedback"
              ></textarea>
              <FieldValidation id="fitReason-feedback" :feedback="feedback('fitReason')" />
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
                :aria-invalid="fieldStatus('termsAccepted') === 'invalid'" aria-describedby="termsAccepted-feedback"
              />
              <label class="field-label-inline" for="termsAccepted">
                I agree to follow the Project Respawn code of conduct and understand this is a beta program.
              </label>
              <FieldValidation id="termsAccepted-feedback" :feedback="feedback('termsAccepted')" />
            </div>
            <div class="field field-inline">
              <input id="publicContentConsent" v-model="alignment.publicContentConsent" type="checkbox" class="field-checkbox" :aria-invalid="fieldStatus('publicContentConsent') === 'invalid'" aria-describedby="publicContentConsent-feedback" />
              <label class="field-label-inline" for="publicContentConsent">I give Project Respawn permission to review the public profiles and content links supplied in this application.</label>
              <FieldValidation id="publicContentConsent-feedback" :feedback="feedback('publicContentConsent')" />
            </div>
            <div class="honeypot-field" aria-hidden="true">
              <label for="website">Website</label><input id="website" v-model="website" type="text" tabindex="-1" autocomplete="off" />
            </div>
          </div>

          <section class="application-review" aria-labelledby="application-review-title"><h3 id="application-review-title">Review your application</h3><p>Check each section before submitting. Selecting a section takes you back without clearing any answers.</p><ul><li v-for="item in stepReviews" :key="item.step"><button type="button" @click="currentStep = item.step"><strong>{{ item.label }}</strong><span :class="{ 'needs-attention': item.issues.length }">{{ item.status }}</span></button></li></ul></section>

          <p v-if="submission.state === 'submitting'" class="submission-message" role="status">Saving your application securely…</p>
          <div v-else-if="submission.state === 'success'" class="submission-message is-success" role="status">
            Application submitted. Your reference is <strong>{{ submission.reference }}</strong>. Please retain this reference.
          </div>
          <p v-else-if="submission.state === 'error'" class="submission-message is-error" role="alert">{{ submission.error }}</p>

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
              :disabled="!alignment.termsAccepted || !alignment.publicContentConsent || submission.state === 'submitting' || submission.state === 'success'"
            >
              {{ submission.state === 'submitting' ? 'Submitting…' : 'Submit application' }}
            </button>
          </div>
        </section>
      </form>
    </section>
  </main>
</template>

<script src="./Applications.js"></script>
<style scoped src="./Applications.css"></style>
