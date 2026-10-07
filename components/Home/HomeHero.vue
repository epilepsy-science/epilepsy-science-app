<template>
  <section class="home-hero">
    <div class="hero-inner">
      <p class="es-label hero-label">Open data for epilepsy research</p>
      <h1>Help Us Accelerate Epilepsy Research</h1>
      <p class="lede">
        <span class="highlight-text">EPILEPSY.SCIENCE</span> is a cloud-based platform where research groups
        publish harmonized epilepsy datasets with interactive cohort dashboards — free to browse, and open to
        download for research.
      </p>
      <div class="hero-actions">
        <NuxtLink to="/projects" class="btn primary">Browse projects</NuxtLink>
        <NuxtLink to="/data?type=dataset" class="btn secondary">Search all datasets</NuxtLink>
      </div>

      <dl class="hero-stats">
        <div v-for="stat in stats" :key="stat.label">
          <dt>{{ stat.label }}</dt>
          <dd>{{ stat.value }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<script setup>
import { useMainStore } from '~/store/index'

const props = defineProps({
  projectCount: { type: Number, default: null },
})

const pageStore = useMainStore()
pageStore.fetchDatasetStats()

const stats = computed(() => [
  { label: 'Projects', value: props.projectCount ?? '–' },
  { label: 'Datasets', value: pageStore.pageStats.datasets },
  {
    label: 'Total data',
    value:
      typeof pageStore.pageStats.totalDatasetSize === 'number'
        ? useFormatMetric(pageStore.pageStats.totalDatasetSize)
        : pageStore.pageStats.totalDatasetSize,
  },
])
</script>

<style scoped lang="scss">
.home-hero {
  background-color: white;
  background-image: radial-gradient(#83CFAB 1px, transparent 1px);
  background-size: 20px 20px;
}

.hero-label { margin: 0 0 16px; }

.hero-inner {
  max-width: 1024px;
  margin: 0 auto;
  padding: 72px 20px 64px;
  text-align: center;
}

h1 {
  margin: 0 0 15px;
  font-size: 2.5rem;
  font-weight: 500;
  color: #000;
  text-transform: uppercase;
}

.lede {
  max-width: 720px;
  margin: 0 auto 32px;
  font-size: 1.2rem;
  line-height: 1.6;
  color: #333;

  .highlight-text {
    color: #3E7877;
    font-weight: 600;
  }
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 48px;
}

.btn {
  padding: 12px 28px;
  border: 1px solid $es-primary;
  border-radius: $es-radius-sm;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.9rem;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;

  &.primary {
    background: $es-cta;
    border-color: $es-cta;
    color: #fff;
    &:hover { background: $es-cta-hover; border-color: $es-cta-hover; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25); }
  }

  &.secondary {
    background: #fff;
    color: $es-primary;
    &:hover { background: $es-primary; color: #fff; }
  }
}

/* adjoining boxes sharing borders, same as StatsBanner */
.hero-stats {
  display: flex;
  max-width: 720px;
  margin: 0 auto;
  background: #fff;
  border-radius: $es-radius;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  div {
    position: relative;
    flex: 1;
    padding: 20px;
    border: 1px solid $es-border;
    &:not(:last-of-type) { border-right: 0; }

    /* the logo's tiny square, tucked in the corner */
    &::after {
      content: '';
      position: absolute;
      top: 6px;
      right: 6px;
      width: 6px;
      height: 6px;
      border: 1.5px solid $es-mint;
      box-sizing: border-box;
    }
  }

  dt {
    font-size: 1rem;
    color: #555;
  }

  dd {
    margin: 0 0 5px;
    font-size: 2rem;
    font-weight: bold;
    color: $es-teal;
  }
}

@media (max-width: 768px) {
  .hero-label { margin: 0 0 16px; }

.hero-inner { padding: 48px 16px 40px; }
  h1 { font-size: 1.75rem; }
  .hero-actions { flex-direction: column; align-items: stretch; }
  .hero-stats {
    flex-direction: column;
    div:not(:last-of-type) { border-right: 1px solid $es-border; border-bottom: 0; }
  }
}
</style>
