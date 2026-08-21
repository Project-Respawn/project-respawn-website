import { computed, onMounted, ref, onBeforeUnmount, watch } from "vue";
import { useAuth } from "../../composables/useAuth.js";
import { useRoute, useRouter } from "vue-router";

export default {
  name: 'Header',

  setup() {
    const {
      isSignedIn,
      authStatus,
      displayName,
      truncatedDisplayName,
      ensureAuthReady,
      refreshAuth,
      initials,
      logout
    } = useAuth();

    const router = useRouter();
    const route = useRoute();

    const truncatedNavName = computed(() => truncatedDisplayName(10));

    const cartCount = ref(0);
    const showDropdown = ref(false);
    const showCommunityDropdown = ref(false);

    const isCommunityRoute = computed(() => {
      return [
        '/events',
        '/creators',
        '/partners'
      ].includes(route.path);
    });

    function updateCartCount() {
      try {
        const parsedCart = JSON.parse(
          localStorage.getItem("cart") || "[]"
        );

        const cartItems = Array.isArray(parsedCart)
          ? parsedCart
          : [];

        cartCount.value = cartItems.reduce(
          (acc, item) => acc + (item?.qty || 1),
          0
        );
      } catch {
        cartCount.value = 0;
      }
    }

    function closeNavbar() {
      const navbarCollapse = document.getElementById("navbarNav");
      const toggler = document.querySelector(".navbar-toggler");

      if (
        navbarCollapse &&
        navbarCollapse.classList.contains("show")
      ) {
        toggler?.click();
      }
    }

    function toggleDropdown() {
      showDropdown.value = !showDropdown.value;
      showCommunityDropdown.value = false;
    }

    function toggleCommunityDropdown() {
      showCommunityDropdown.value = !showCommunityDropdown.value;
      showDropdown.value = false;
    }

    function closeCommunityDropdown() {
      showCommunityDropdown.value = false;
    }

    async function handleLogout() {
      try {
        await logout();

        showDropdown.value = false;
        showCommunityDropdown.value = false;

        await refreshAuth();

        router.push('/');
      } catch (err) {
        console.error('Logout failed', err);
      }
    }

    function onDocClick(e) {
      const accountBtn = document.querySelector(
        '.header-account-btn'
      );

      const accountMenu = accountBtn
        ?.parentElement
        ?.querySelector('.dropdown-menu');

      const communityItem = document.querySelector(
        '.community-nav-item'
      );

      if (
        accountBtn?.contains(e.target) ||
        accountMenu?.contains(e.target)
      ) {
        return;
      }

      showDropdown.value = false;

      if (communityItem?.contains(e.target)) {
        return;
      }

      showCommunityDropdown.value = false;
    }

    onMounted(() => {
      ensureAuthReady();
      updateCartCount();

      window.addEventListener(
        "storage",
        updateCartCount
      );

      document.addEventListener(
        'click',
        onDocClick
      );

      const navbarCollapse =
        document.getElementById("navbarNav");

      navbarCollapse?.addEventListener(
        "click",
        (e) => {
          if (e.target === navbarCollapse) {
            closeNavbar();
          }
        }
      );
    });

    onBeforeUnmount(() => {
      window.removeEventListener(
        "storage",
        updateCartCount
      );

      document.removeEventListener(
        'click',
        onDocClick
      );
    });

    watch(
      () => route.fullPath,
      () => {
        showDropdown.value = false;
        showCommunityDropdown.value = false;
      }
    );

    return {
      isSignedIn,
      authStatus,
      displayName,
      truncatedNavName,
      initials,

      cartCount,

      showDropdown,
      showCommunityDropdown,
      isCommunityRoute,

      toggleDropdown,
      toggleCommunityDropdown,
      closeCommunityDropdown,

      handleLogout,
      updateCartCount,
      closeNavbar
    };
  }
};