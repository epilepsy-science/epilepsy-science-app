<template>
  <div class="projects-list">
    <div v-if="isLoading" class="loading-state">Loading projects...</div>

    <div v-else-if="sortedProjects.length > 0" class="projects-grid" :class="`grid-${layout}`">
      <UnassignedDatasetsCard v-if="showUnassigned" :projects="projects" :layout="layout" />
      <ProjectCard
        v-for="project in sortedProjects"
        :key="project.sys?.id"
        :project="project"
        :image-url="getProjectImage(project)"
        :layout="layout"
      />
    </div>

    <div v-else class="empty-state">No projects found.</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { PROJECT_STATS_AVAILABLE_IDS } from '~/utils/constants.js'

const props = defineProps({
  projects: { type: Array, required: true, default: () => [] },
  totalCount: { type: Number, default: 0 },
  isLoading: { type: Boolean, default: false },
  layout: { type: String, default: 'cards' },
  showUnassigned: { type: Boolean, default: false },
})

const hasDashboard = (p) =>
  p.fields?.mockStats?.dashboard ?? PROJECT_STATS_AVAILABLE_IDS.includes(p.fields?.projectId?.toLowerCase())

// Dashboard projects first: they are the richest entry points for new visitors.
const sortedProjects = computed(() =>
  [...props.projects].sort((a, b) => Number(hasDashboard(b)) - Number(hasDashboard(a))),
)

function getProjectImage(project) {
  const url = project.fields?.bannerImage?.fields?.file?.url
  return url ? `https://${url}` : null
}
</script>

<style scoped lang="scss">
.projects-list { width: 100%; }

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #888;
}

.projects-grid {
  display: grid;
  gap: 1.5rem;
}

.grid-cards,
.grid-featured {
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 760px) {
  .grid-cards,
  .grid-featured { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1100px) {
  .grid-cards,
  .grid-featured { grid-template-columns: repeat(3, 1fr); }
}

.grid-list { grid-template-columns: 1fr; }

@media (max-width: 768px) {
  .grid-cards,
  .grid-featured { grid-template-columns: 1fr; }
}
</style>
