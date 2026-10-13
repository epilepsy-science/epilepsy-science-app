<template>
  <NuxtLink :to="projectLink" class="project-card" :class="[`layout-${layout}`, { featured: hasDashboard }]">
    <div class="project-top">
        <div class="project-thumb">
          <img v-if="imageUrl" :src="imageUrl" alt="" />
          <span v-else class="thumb-fallback">{{ initials }}</span>
        </div>
        <div class="project-heading">
          <span v-if="hasDashboard" class="dashboard-badge">
            <el-icon :size="13"><DataAnalysis /></el-icon> Interactive dashboard
          </span>
          <h3 class="project-title">{{ projectName }}</h3>
        </div>
    </div>

    <div class="project-info">
      <p v-if="projectSummary" class="project-summary">{{ projectSummary }}</p>

      <ul v-if="hasData" class="stat-row">
        <li v-if="stats.patients != null" class="stat">
          <strong>{{ formatCount(stats.patients) }}</strong><span>Patients</span>
        </li>
        <li v-if="stats.recordings != null" class="stat">
          <strong>{{ formatCount(stats.recordings) }}</strong><span>Recordings</span>
        </li>
        <li class="stat">
          <strong>{{ stats.loaded ? stats.datasets : '…' }}</strong><span>Datasets</span>
        </li>
        <li v-if="!stats.loaded || stats.size" class="stat">
          <strong>{{ stats.loaded ? useFormatMetric(stats.size) : '…' }}</strong><span>Data</span>
        </li>
      </ul>

      <p v-else-if="stats.loaded" class="no-data">No datasets published yet</p>

      <div v-if="stats.modalities.length" class="modality-tags">
        <span v-for="m in stats.modalities" :key="m" class="modality-tag">{{ m }}</span>
      </div>

      <div class="project-footer">
        <span v-if="investigators" class="investigators">{{ investigators }}</span>
        <span class="cta">{{ hasDashboard ? 'Explore dashboard' : 'View project' }} →</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
import { computed, toRef } from 'vue'
import { DataAnalysis } from '@element-plus/icons-vue'

const props = defineProps({
  project: { type: Object, required: true },
  imageUrl: { type: String, default: null },
  layout: { type: String, default: 'cards' },
})

const { stats, hasDashboard } = useProjectCardStats(toRef(props, 'project'))

// Hide the stat row entirely until there is something to show
const hasData = computed(
  () => !stats.value.loaded || stats.value.datasets > 0 || stats.value.patients != null,
)

const projectLink = computed(() => ({ name: 'projects-id', params: { id: props.project.sys?.id } }))
const projectName = computed(() => props.project.fields?.name || '')
const initials = computed(() =>
  projectName.value.split(' ').filter((w) => /^[A-Za-z]/.test(w)).slice(0, 2).map((w) => w[0]).join('').toUpperCase(),
)

const projectSummary = computed(() => {
  const summary = props.project.fields?.summary || ''
  return summary.length > 220 ? summary.substring(0, 220).trim() + '...' : summary
})

const investigators = computed(() => {
  const list = props.project.fields?.investigators || []
  if (list.length <= 2) return list.join(', ')
  return `${list.slice(0, 2).join(', ')} +${list.length - 2}`
})

const formatCount = (n) => Number(n).toLocaleString()
</script>

<style scoped lang="scss">
.project-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid $es-border;
  border-radius: $es-radius;
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  transition: box-shadow 0.2s, border-color 0.2s;

  &:hover,
  &:focus-visible {
    border-color: $es-teal;
    box-shadow: 0 4px 16px rgba(62, 120, 119, 0.15);
    .project-title { text-decoration: underline; text-decoration-color: rgba(63, 82, 118, 0.4); }
    .cta { color: $es-primary-dark; }
  }
}

/* Tinted header band: thumbnail + title on a mint wash */
.project-top {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background-color: $es-slate-tint;
  border-bottom: 1px solid $es-border;
}



/* Fixed 1:1 tile so wide, square and wordmark images all get the same footprint */
.project-thumb {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid $es-border;
  border-radius: $es-radius-sm;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 6px;
  }

  .thumb-fallback {
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 1px;
    color: $es-teal;
  }
}

.project-heading {
  min-width: 0;
  padding-top: 2px;
}

.dashboard-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 5px;
  padding: 2px 7px;
  border-radius: $es-radius-sm;
  background: $es-teal;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.project-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 24px 28px 24px;
  text-align: left;
}

.project-title {
  margin: 0;
  font-size: 1.15rem;
  line-height: 1.3;
  font-weight: 600;
  color: $es-slate-dark;
  text-transform: none;
}

.project-summary {
  margin: 0 0 20px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #333;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 16px;
  list-style: none;
  padding: 18px 0;
  margin: 0 0 18px;
  border-block: 1px solid $es-border;

  .stat {
    display: flex;
    flex-direction: column;

    strong { font-size: 1.3rem; color: $es-teal; }
    span { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.4px; color: #555; white-space: nowrap; }
  }
}

.no-data {
  margin: 0 0 16px;
  padding: 14px 0;
  border-block: 1px solid $es-border;
  font-size: 0.85rem;
  color: #888;
  font-style: italic;
}

.modality-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.modality-tag {
  padding: 2px 10px;
  border-radius: $es-radius-sm;
  background: $es-panel-grey;
  color: $es-teal;
  font-size: 0.75rem;
  font-weight: 600;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding-top: 4px;
  font-size: 0.9rem;

  .investigators { color: #555; }
  .cta { color: $es-primary; font-weight: 600; text-transform: uppercase; font-size: 0.8rem; white-space: nowrap; }
}

.layout-list {
  .project-info { padding: 16px 24px; }
  .project-summary { margin-bottom: 8px; }
  .stat-row { display: flex; flex-wrap: wrap; gap: 10px 32px; margin-bottom: 8px; }
}

.layout-featured.featured {
  grid-column: 1 / -1;

  .project-top { padding: 20px 32px; }
  .project-info { padding: 24px 32px 28px; }
  .project-thumb { width: 80px; height: 80px; }
  .project-title { font-size: 1.6rem; }
  .project-summary { font-size: 1.05rem; }
  .stat-row { display: flex; flex-wrap: wrap; gap: 10px 48px; }
}

@media (max-width: 768px) {
  .layout-featured.featured {
  }
}
</style>
