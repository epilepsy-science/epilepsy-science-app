<template>
  <NuxtLink to="/data?type=dataset&scope=individual" class="project-card unassigned-card" :class="`layout-${layout}`">
    <div class="project-top">
      <div class="project-thumb">
        <el-icon :size="30"><Files /></el-icon>
      </div>
      <h3 class="project-title">Individual published datasets</h3>
    </div>

    <div class="project-info">
      <p class="project-summary">
        Datasets published independently of a research project. Search them by keyword, modality,
        or species.
      </p>

      <ul class="stat-row">
        <li class="stat">
          <strong>{{ loaded ? count : '…' }}</strong><span>Datasets</span>
        </li>
        <li class="stat">
          <strong>{{ loaded ? useFormatMetric(size) : '…' }}</strong><span>Data</span>
        </li>
      </ul>

      <div class="project-footer">
        <span class="investigators">Various contributors</span>
        <span class="cta">Browse datasets →</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
import { toRef } from 'vue'
import { Files } from '@element-plus/icons-vue'

const props = defineProps({
  projects: { type: Array, required: true },
  layout: { type: String, default: 'cards' },
})

const { count, size, loaded } = useUnassignedDatasets(toRef(props, 'projects'))
</script>

<style scoped lang="scss">
/* Mirrors ProjectCard so it reads as a sibling in the grid */
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
    .cta { color: $es-primary-dark; }
  }
}

.project-top {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background-color: $es-slate-tint;
  border-bottom: 1px solid $es-border;
}

.project-thumb {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px dashed $es-slate;
  border-radius: $es-radius-sm;
  background: #fff;
  color: $es-slate;
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
  .stat-row { display: flex; flex-wrap: wrap; gap: 10px 32px; margin-bottom: 8px; }
}

.project-thumb {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px dashed $es-slate;
  border-radius: $es-radius-sm;
  background: #fff;
  color: $es-slate;
}
</style>
