<template>
  <nav class="browse-tabs" aria-label="Browse data by">
    <NuxtLink to="/projects" class="browse-tab" :class="{ active: active === 'projects' }">
      By Project
    </NuxtLink>
    <NuxtLink to="/data?type=dataset" class="browse-tab" :class="{ active: active === 'all' }">
      All Datasets
    </NuxtLink>
  </nav>
</template>

<script setup>
defineProps({
  active: { type: String, required: true },
})
</script>

<style scoped lang="scss">
.browse-tabs {
  display: inline-flex;
  background: #fff;
  border-radius: $es-radius-sm;
  overflow: hidden;
}

.browse-tab {
  padding: 10px 24px;
  border: 1px solid $es-primary;
  color: $es-primary;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;

  &:not(:first-child) { border-left: 0; }

  &:hover { background: #f0f6fc; }

  &.active {
    background: $es-primary;
    color: #fff;
  }
}
</style>
