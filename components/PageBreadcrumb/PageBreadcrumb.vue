<template>
  <nav class="page-breadcrumb" aria-label="Breadcrumb">
    <ol>
      <li>
        <NuxtLink to="/" class="crumb">Home</NuxtLink>
      </li>
      <li v-for="(item, i) in items" :key="i">
        <span class="sep" aria-hidden="true">›</span>
        <NuxtLink v-if="item.to && i < items.length - 1" :to="item.to" class="crumb">{{ item.label }}</NuxtLink>
        <span v-else class="crumb current" aria-current="page">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
// items: [{ label, to? }] — the last item is the current page and renders as text
defineProps({
  items: { type: Array, default: () => [] },
})
</script>

<style scoped lang="scss">
.page-breadcrumb {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  line-height: 1;

  ol {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  /* the logo's hollow square leads the trail */
  li:first-child::before {
    content: '';
    width: 8px;
    height: 8px;
    border: 1.5px solid $es-teal;
    border-radius: 2px;
    box-sizing: border-box;
  }

  .sep { color: #b5bdc9; font-weight: 400; }

  .crumb {
    color: $es-teal;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }

  .current {
    color: #555;
    text-transform: none;
    letter-spacing: 0;
    font-weight: 600;
    font-size: 0.8rem;
    max-width: 48ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &:hover { text-decoration: none; }
  }
}
</style>
