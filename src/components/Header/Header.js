import { computed, onMounted, ref, onBeforeUnmount, watch } from "vue";
import { useAuth } from "../../composables/useAuth.js";
import { useRouter } from "vue-router";

export default {
  name: 'Header',
  setup() {
    const { isSignedIn, authStatus, displayName, truncatedDisplayName, ensureAuthReady, refreshAuth, initials, logout } = useAuth();
    const truncatedNavName = computed(() => truncatedDisplayName(10));
    const router = useRouter();

    const cartCount = ref(0);
    const showDropdown = ref(false);

    function updateCartCount() {
      try {
        const parsedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const cartItems = Array.isArray(parsedCart) ? parsedCart : [];
        cartCount.value = cartItems.reduce((acc, item) => acc + (item?.qty || 1), 0);
      } catch {
        cartCount.value = 0;
      }
    }

    function closeNavbar() {
      const navbarCollapse = document.getElementById("navbarNav");
      const toggler = document.querySelector(".navbar-toggler");
      if (navbarCollapse && navbarCollapse.classList.contains("show")) {
        toggler?.click();
      }
    }

    function toggleDropdown() {
      showDropdown.value = !showDropdown.value;
    }

    async function handleLogout() {
      try {
        await logout();
        showDropdown.value = false;
        await refreshAuth();
        router.push('/');
      } catch (err) {
        console.error('Logout failed', err);
      }
    }

    function onDocClick(e) {
      const btn = document.querySelector('.header-account-btn');
      const menu = document.querySelector('.dropdown-menu');
      if (!btn) return;
      if (btn.contains(e.target) || (menu && menu.contains(e.target))) return;
      showDropdown.value = false;
    }

    onMounted(() => {
      ensureAuthReady();
      updateCartCount();
      window.addEventListener("storage", updateCartCount);
      document.addEventListener('click', onDocClick);

      const navLinks = document.querySelectorAll(".navbar-collapse .nav-link, .navbar-collapse .btn");
      navLinks.forEach((link) => {
        link.addEventListener("click", closeNavbar);
      });

      const navbarCollapse = document.getElementById("navbarNav");
      navbarCollapse?.addEventListener("click", (e) => {
        if (e.target === navbarCollapse) {
          closeNavbar();
        }
      });
    });

    onBeforeUnmount(() => {
      window.removeEventListener("storage", updateCartCount);
      document.removeEventListener('click', onDocClick);
    });

    watch(() => window.location.pathname, () => {
      showDropdown.value = false;
    });

    return {
      isSignedIn,
      authStatus,
      displayName,
      truncatedDisplayName,
      truncatedNavName,
      initials,
      cartCount,
      showDropdown,
      toggleDropdown,
      handleLogout,
      updateCartCount,
      closeNavbar
    };
  }
};