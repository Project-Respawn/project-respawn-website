<template>
  <header class="site-header">
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container">

        <!-- Brand -->
        <router-link to="/" class="navbar-brand">
          <img
            src="../../assets/logo.png"
            alt="Project Respawn logo"
            width="44"
            height="44"
            class="me-2"
          />
          <span>Project Respawn</span>
        </router-link>

        <!-- Mobile toggle -->
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div
          class="collapse navbar-collapse"
          id="navbarNav"
        >
          <ul class="navbar-nav ms-auto align-items-lg-center">

            <!-- Home -->
            <li class="nav-item">
              <router-link
                to="/"
                class="nav-link"
                :class="{
                  active:
                    $route.path === '/' ||
                    $route.path === '/home'
                }"
              >
                Home
              </router-link>
            </li>

            <!-- About -->
            <li class="nav-item">
              <router-link
                to="/about"
                class="nav-link"
                :class="{
                  active: $route.path === '/about'
                }"
              >
                About
              </router-link>
            </li>

            <!-- Community -->
            <li class="nav-item dropdown community-nav-item">

              <button
                type="button"
                class="nav-link community-nav-trigger"
                :class="{
                  active: isCommunityRoute
                }"
                :aria-expanded="showCommunityDropdown"
                @click.stop="toggleCommunityDropdown"
              >
                <span>Community</span>

                <i
                  class="bi bi-chevron-down community-nav-arrow"
                  aria-hidden="true"
                ></i>
              </button>

              <ul
                class="dropdown-menu community-dropdown"
                :class="{
                  show: showCommunityDropdown
                }"
              >

                <!-- Events -->
                <li>
                  <router-link
                    to="/events"
                    class="dropdown-item community-dropdown-item"
                    @click="closeCommunityDropdown"
                  >
                    <span class="community-dropdown-title">
                      Events
                    </span>

                    <span class="community-dropdown-copy">
                      See what is happening across Project Respawn.
                    </span>
                  </router-link>
                </li>

                <!-- Creators -->
                <li>
                  <router-link
                    to="/creators"
                    class="dropdown-item community-dropdown-item"
                    @click="closeCommunityDropdown"
                  >
                    <span class="community-dropdown-title">
                      Creators
                    </span>

                    <span class="community-dropdown-copy">
                      Meet the creators building with Project Respawn.
                    </span>
                  </router-link>
                </li>

                <!-- Partners -->
                <li>
                  <router-link
                    to="/partners"
                    class="dropdown-item community-dropdown-item"
                    @click="closeCommunityDropdown"
                  >
                    <span class="community-dropdown-title">
                      Partners
                    </span>

                    <span class="community-dropdown-copy">
                      Discover organisations working with Project Respawn.
                    </span>
                  </router-link>
                </li>

              </ul>
            </li>

            <!-- For Creators -->
            <li class="nav-item">
              <router-link
                :to="{
                  path: '/join-us',
                  hash: '#how-it-works'
                }"
                class="nav-link"
                :class="{
                  active: $route.path === '/join-us'
                }"
              >
                For Creators
              </router-link>
            </li>

            <!-- Forum -->
            <li class="nav-item">
              <router-link
                to="/forum"
                class="nav-link"
                :class="{
                  active: $route.path === '/forum'
                }"
              >
                Forum
              </router-link>
            </li>

            <!-- Store -->
            <li class="nav-item">
              <router-link
                to="/merch"
                class="nav-link"
                :class="{
                  active: $route.path === '/merch'
                }"
              >
                Store
              </router-link>
            </li>

            <!-- Cart -->
            <li class="nav-item cart-nav-item">
              <router-link
                to="/checkout"
                class="nav-link cart-icon-link"
              >
                <i
                  class="bi bi-cart3"
                  aria-hidden="true"
                ></i>

                <span
                  v-if="cartCount > 0"
                  class="cart-badge"
                >
                  {{ cartCount }}
                </span>
              </router-link>
            </li>

            <!-- Authentication -->
            <li class="nav-item">

              <!-- Loading -->
              <span
                v-if="authStatus === 'loading'"
                class="btn btn-secondary ms-lg-3 disabled"
                aria-busy="true"
              >
                Checking session…
              </span>

              <!-- Logged out -->
              <router-link
                v-else-if="!isSignedIn"
                to="/join"
                class="btn btn-secondary ms-lg-3"
                :class="{
                  active: $route.path === '/join'
                }"
              >
                Join
              </router-link>

              <!-- Logged in -->
              <div
                v-else
                class="ms-lg-3 position-relative"
              >
                <button
                  type="button"
                  class="
                    btn
                    btn-secondary
                    header-account-btn
                    d-flex
                    align-items-center
                  "
                  :title="displayName"
                  :aria-expanded="showDropdown"
                  @click.stop="toggleDropdown"
                >
                  <span
                    class="profile-avatar me-2"
                    aria-hidden="true"
                  >
                    {{ initials }}
                  </span>

                  <span class="text-truncate">
                    {{ truncatedNavName }}
                  </span>

                  <i
                    class="bi bi-caret-down-fill ms-2"
                    aria-hidden="true"
                  ></i>
                </button>

                <ul
                  class="dropdown-menu dropdown-menu-end"
                  :class="{
                    show: showDropdown
                  }"
                  style="min-width: 12rem;"
                >
                  <li>
                    <router-link
                      to="/home"
                      class="dropdown-item"
                    >
                      Dashboard
                    </router-link>
                  </li>

                  <li>
                    <router-link
                      to="/account"
                      class="dropdown-item"
                    >
                      Profile Settings
                    </router-link>
                  </li>

                  <li>
                    <hr class="dropdown-divider">
                  </li>

                  <li>
                    <button
                      type="button"
                      class="dropdown-item text-danger"
                      @click="handleLogout"
                    >
                      Sign out
                    </button>
                  </li>
                </ul>
              </div>

            </li>

          </ul>
        </div>

      </div>
    </nav>
  </header>
</template>

<script src="./Header.js"></script>

<style
  scoped
  src="./Header.css"
></style>