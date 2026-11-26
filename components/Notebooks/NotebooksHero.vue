<template>
  <section class="nb-hero es-dots">
    <div class="nb-hero__inner">
      <p class="es-label">{{ label }}</p>
      <h1 class="nb-hero__title">{{ title }}</h1>
      <div class="es-heading-bar centered"><i></i></div>
      <p v-if="$slots.default" class="nb-hero__text"><slot /></p>
      <!-- Notebooks' sections, as the data pages' By Project / All Datasets. -->
      <nav v-if="tab" class="nb-tabs" aria-label="Notebooks">
        <NuxtLink to="/notebooks" class="nb-tab" :class="{ active: tab === 'notebooks' }">My notebooks</NuxtLink>
        <NuxtLink to="/notebooks/compute" class="nb-tab" :class="{ active: tab === 'compute' }">Compute</NuxtLink>
      </nav>
    </div>
  </section>
</template>

<script setup>
// The notebook pages' hero, in the site's style (pages/projects/index.vue):
// a label, a title, a line of text, and the sections' tabs.
defineProps({
  label: { type: String, default: 'Notebooks' },
  title: { type: String, required: true },
  // notebooks or compute: the section tabs, with that one active.
  tab: { type: String, default: '' },
})
</script>

<style scoped lang="scss">
.nb-hero {
  border-bottom: 1px solid $es-border;

  &__inner {
    max-width: 760px;
    margin: 0 auto;
    padding: 64px 20px 40px;
    text-align: center;
  }

  .es-label { margin: 0 0 12px; }

  &__title {
    margin: 0;
    font-size: 2.25rem;
    font-weight: 500;
    color: #000;
    text-transform: uppercase;
  }

  .es-heading-bar { margin-bottom: 16px; }

  &__text {
    margin: 0 auto 24px;
    font-size: 1.05rem;
    line-height: 1.6;
    color: #333;
  }
}

.nb-tabs {
  display: inline-flex;
  background: #fff;
  border-radius: $es-radius-sm;
  overflow: hidden;
}

.nb-tab {
  padding: 10px 24px;
  border: 1px solid $es-primary;
  color: $es-primary;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;

  &:not(:first-child) { border-left: 0; }

  &:hover { background: $es-primary-tint; }

  &.active {
    background: $es-primary;
    color: #fff;
  }
}
</style>
