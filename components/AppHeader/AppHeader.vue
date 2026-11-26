<template>
  <header class="app-header">
    <div class="header-container">
      <div class="header-logo">
        <nuxt-link to="/"><img src="/logos/epilepsy-science-short-logo.svg" alt="epilepsy-science-logo" class="logo-img"/></nuxt-link>
        <img src="/logos/epilepsy-science-descriptive-logo.svg" alt="epilepsy-science-descriptive-logo"/>
      </div>

      <button class="hamburger-menu" @click="toggleMenu">
        <svgo-icon-hamburger height="25" width="25" />
      </button>

      <nav class="header-nav" :class="{ 'is-mobile-menu': menuOpen }">
        <ul>
          <li><nuxt-link to="/projects" :class="{ 'router-link-active': isDataSection }">Data</nuxt-link></li>
          <li><nuxt-link to="/notebooks">Notebooks</nuxt-link></li>
          <li>
            <a
              class="external-link"
              href="https://cde.epilepsy.science"
              target="_blank"
              rel="noopener"
              title="Common Data Elements"
            >CDEs <el-icon :size="12" class="external-icon"><TopRight /></el-icon></a>
          </li>
          <li><nuxt-link to="/about">About</nuxt-link></li>
          <li v-if="IS_DATASET_PROPOSAL_ENABLED" class="nav-dropdown">
            <button class="nav-dropdown-trigger" type="button" aria-haspopup="true">
              More <el-icon :size="12" class="nav-dropdown-arrow"><ArrowDown /></el-icon>
            </button>
            <ul class="nav-dropdown-menu">
              <li><nuxt-link to="/dataset-proposal" @click="closeDropdown">Propose a dataset</nuxt-link></li>
            </ul>
          </li>
          <ClientOnly>
            <li v-if="visitor.signedIn" class="nav-dropdown">
              <button class="nav-dropdown-trigger" type="button" aria-haspopup="true">
                {{ visitor.profile.firstName || visitor.profile.email }}
                <el-icon :size="12" class="nav-dropdown-arrow"><ArrowDown /></el-icon>
              </button>
              <ul class="nav-dropdown-menu">
                <li><nuxt-link to="/notebooks" @click="closeDropdown">My notebooks</nuxt-link></li>
                <li><a href="#" @click.prevent="signOut">Sign out</a></li>
              </ul>
            </li>
            <li v-else>
              <nuxt-link :to="{ path: '/sign-in', query: { redirectTo: route.fullPath } }" class="sign-in">Sign in</nuxt-link>
            </li>
          </ClientOnly>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { TopRight, ArrowDown } from "@element-plus/icons-vue";
import { IS_DATASET_PROPOSAL_ENABLED } from "~/utils/constants.js";
import { useVisitorStore } from "@/store/visitor";

const route = useRoute();
const router = useRouter();

// The visitor's own Pennsieve sign-in (notebooks), read in the browser.
const visitor = useVisitorStore();
onMounted(() => visitor.load());
async function signOut(clickEvent) {
  closeDropdown(clickEvent);
  await visitor.signOut();
  if (route.path.startsWith("/notebooks")) router.push("/");
}
const isDataSection = computed(() => /^\/(projects|data|datasets)(\/|$)/.test(route.path));

const menuOpen = ref(false);
const windowWidth = ref(typeof window !== "undefined" ? window.innerWidth : 0);

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

// Blur the clicked link so :focus-within no longer keeps the dropdown open
const closeDropdown = (clickEvent) => {
  clickEvent.currentTarget?.blur();
  menuOpen.value = false;
};

const updateWindowWidth = () => {
  if (typeof window !== "undefined") {
    windowWidth.value = window.innerWidth;
  }
};

// Watch for changes in windowWidth and close the menu if switching to larger screens
watch(windowWidth, (newWidth) => {
  if (newWidth >= 768 && menuOpen.value) {
    menuOpen.value = false;
  }
});

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("resize", updateWindowWidth);
    updateWindowWidth(); // Set initial width on mount
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateWindowWidth);
  }
});
</script>

<style scoped lang="scss">
.app-header {
  background-color: #ffffff;
  border-bottom: 1px solid $es-border;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 100;
}

.header-container {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
}

.header-logo {
  display: flex;
  align-items: center;
}

.logo-img {
  margin-right: 10px;
}

.logo-text, .logo-text-bold {
  font-size: 1.2rem;
}

.logo-text-bold {
  font-weight: bold;
  margin-right: 8px;
}

.header-nav a {
  color: $es-primary;
  text-decoration: none;
  text-transform: uppercase;
  display: inline-block;
  position: relative;
  overflow: hidden;
  padding: 5px 10px;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    width: 0;
    background-color: $es-primary;
    transition: width 0.4s ease;
  }
}

// An external site: the arrow says so; the acronym's words are its title.
.header-nav a.external-link {
  text-transform: none;
}

.external-icon {
  margin-left: 2px;
  vertical-align: middle;
}

// Signed out: the way in, outlined, at the end of the nav.
.header-nav a.sign-in {
  border: 1px solid $es-primary;
  border-radius: $es-radius-sm;

  &::after {
    display: none;
  }

  &:hover,
  &:focus-visible {
    background: $es-primary;
    color: #fff;
  }
}

.header-nav a.router-link-active {
  color: black;
  font-weight: bold;
  &::after {
    width: 100%;
  }
}


.header-nav a:hover,
.header-nav a:focus-visible {
  color: black;
  &::after {
    width: 100%;
  }
}

.header-nav ul li a:focus-visible {
  outline: 2px solid $es-primary;
  outline-offset: 2px;
}

.nav-dropdown {
  position: relative;
}

.nav-dropdown-trigger {
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
  color: $es-primary;
  text-transform: uppercase;
  padding: 5px 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &:focus-visible {
    outline: 2px solid $es-primary;
    outline-offset: 2px;
  }
}

.nav-dropdown-arrow {
  transition: transform 0.2s ease;
}

.header-nav .nav-dropdown-menu {
  list-style: none;
  padding: 0 0 0 10px;
  margin: 0;
  gap: 0;

  a {
    text-transform: none;
    white-space: nowrap;
  }

  // Dropdown items don't show the active-route underline/bold
  a.router-link-active:not(:hover):not(:focus-visible) {
    color: $es-primary;
    font-weight: normal;

    &::after {
      width: 0;
    }
  }
}

.hamburger-menu {
  display: inline-flex;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
}

.header-nav {
  display: none;
}

.header-nav.is-mobile-menu {
  display: block;
  position: absolute;
  top: 60px;
  left: 0;
  width: 100%;
  background-color: white;
  padding: 10px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-nav ul {
  display: flex;
  flex-direction: column;
  list-style: none;
  gap: 10px;
}

@media (min-width: 768px) {
  .hamburger-menu {
    display: none;
  }

  .header-nav {
    display: flex;
    position: static;
    box-shadow: none;
    padding: 0;
  }

  .header-nav ul {
    flex-direction: row;
    gap: 15px;
  }

  .header-nav .nav-dropdown-menu {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    min-width: 180px;
    padding: 8px 0;
    background-color: #ffffff;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 110;

    a {
      display: block;
      padding: 8px 16px;
    }
  }

  .nav-dropdown:hover,
  .nav-dropdown:focus-within {
    .nav-dropdown-menu {
      display: flex;
    }

    .nav-dropdown-trigger {
      color: black;
    }

    .nav-dropdown-arrow {
      transform: rotate(180deg);
    }
  }
}
</style>