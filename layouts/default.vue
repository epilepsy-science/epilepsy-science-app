<template>
  <div id="epilepsy-science-app" >
    <!-- Use this to show any custom announcements on the homepage -->
    <!-- <AnnouncementBanner /> -->
    <AppHeader />
    <div v-if="breadcrumb.length" class="breadcrumb-strip">
      <PageBreadcrumb :items="breadcrumb" class="breadcrumb-strip__inner" />
    </div>
    <slot />
    <AppFooter/>
    <cookie-notice v-if="!hasAcceptedGDPR" />
  </div>
</template>

<script>
import CookieNotice from '@/components/CookieNotice/CookieNotice.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
export default {
  components: {
    CookieNotice,
  },
  setup() {
    const breadcrumb = useBreadcrumb()
    return { breadcrumb }
  },
  computed: {
    hasAcceptedGDPR() {
      return useCookie('GDPR:accepted').value
    }
  },
}
</script>

<style lang="scss">
@use '~/node_modules/flexboxgrid/css/flexboxgrid.min.css';

/* Transparent: overlays the top of each page's own hero (dots or white).
   Pages leave >= 56px of top padding so content clears it. */
.breadcrumb-strip {
  position: relative;
  z-index: 1;
  height: 0;

  /* flush with the header logo, not the page container */
  &__inner {
    padding: 18px 20px 0;
  }
}

.discover-content {
  box-sizing: border-box;
  max-width: calc(936px + 4rem);
}

.dataset-body.discover-content,
.dataset-header-band .discover-content {
  max-width: 1240px;
}
</style>