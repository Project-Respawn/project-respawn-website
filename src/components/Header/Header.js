import { computed, onMounted, ref, nextTick, onBeforeUnmount, watch } from "vue";
import { useAuth } from "../../composables/useAuth.js";
import { useRouter } from "vue-router";

const { isSignedIn, displayName, truncatedDisplayName, refreshAuth, initials, logout } = useAuth();
const truncatedNavName = computed(() => truncatedDisplayName(10));
const router = useRouter();

const cartCount = ref(0);
const showDropdown = ref(false);

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cartCount.value = cart.reduce((acc, item) => acc + (item.qty || 1), 0);
}

function closeNavbar() {
  const navbarCollapse = document.getElementById("navbarNav");
  const toggler = document.querySelector(".navbar-toggler");
  if (navbarCollapse && navbarCollapse.classList.contains("show")) {
    toggler.click();
  }
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

async function handleLogout() {
  try {
    await logout();
    showDropdown.value = false;
    // refresh auth state in case useAuth needs it
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
  refreshAuth();
  updateCartCount();
  window.addEventListener("storage", updateCartCount);
  document.addEventListener('click', onDocClick);

  // Close navbar when a link is clicked
  const navLinks = document.querySelectorAll(".navbar-collapse .nav-link, .navbar-collapse .btn");
  navLinks.forEach(link => {
    link.addEventListener("click", closeNavbar);
  });

  // Close navbar when clicking the backdrop
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

// Close dropdown when route changes
watch(() => window.location.pathname, () => {
  showDropdown.value = false;
});


export default {
  name: 'Header',
  setup() {
    return {
      isSignedIn,
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