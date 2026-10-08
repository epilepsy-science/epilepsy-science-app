<template>
  <div class="collaborator-card">
    <div class="card-content">
      <h4 class="card-title">{{ title }}</h4>
      <p class="card-description">{{ description }}</p>
    </div>
    <div class="card-cta">
      <NuxtLink :to="link.url" :target="isExternal(link.url) ? '_blank' : '_self'">{{ link.text }}</NuxtLink>
    </div>
  </div>
</template>

<script setup>

function isExternal(url) {
  if (typeof window === 'undefined') {
    // If `window` is not available (e.g., during SSR), assume the URL is not external
    return false;
  }
  
  if(url) {
    const linkUrl = new URL(url, window.location.origin);
    return linkUrl.origin !== window.location.origin;
  } else {
    return false;
  }
}

defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  link: {
    type: Object,
    required: true
  },
});
</script>

<style scoped lang="scss">
.collaborator-card {
  background: #fff;
  border: 1px solid $es-border;
  border-radius: $es-radius;
  padding: 24px;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: $es-teal;
    box-shadow: 0 4px 16px rgba(62, 120, 119, 0.15);
  }

  .card-title {
    margin: 0 0 12px;
    font-size: 1.05rem;
    font-weight: 600;
    line-height: 1.4;
    color: $es-primary;
  }

  .card-description {
    margin: 0 0 16px;
    line-height: 1.6;
    color: #333;
  }

  .card-cta a {
    color: $es-primary;
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
}
</style>
