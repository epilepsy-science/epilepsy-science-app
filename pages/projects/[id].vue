<template>
  <div class="project-detail-page">
    <div v-if="isLoading" class="loading-state">
      Loading project...
    </div>

    <div v-else-if="error" class="error-state">
      <h2>Error loading project</h2>
      <p>{{ error }}</p>
    </div>

    <div v-else-if="project" class="project-detail">
      <div class="project-header">
        <p class="es-label">Project</p>
        <h1 class="project-title">{{ projectName }}</h1>
        <p v-if="projectSummary" class="project-summary">{{ projectSummary }}</p>
      </div>

      <div class="overview-layout">
        <div class="overview-main">
          <!-- Dashboard when available; otherwise the description is the main content -->
          <section v-if="isStatsDashboardAvailable" class="panel dashboard-panel">
            <ProjectStatsDashboard :project="project" />
          </section>
          <section v-else-if="projectDescription" class="panel description-panel">
            <h2 class="section-title">About this project</h2>
            <div class="es-heading-bar"><i></i></div>
            <div class="description-text" v-html="projectDescription"></div>
          </section>

          <section class="datasets-section">
            <div class="section-heading">
              <h2 class="section-title">Datasets</h2>
              <span v-if="!datasetsLoading" class="dataset-count">{{ totalDatasetCount }}</span>
            </div>
            <div class="es-heading-bar"><i></i></div>

            <div v-if="datasetsLoading" class="loading-state">Loading datasets...</div>

            <div v-else-if="datasetsError" class="error-state">
              <h2>Error loading datasets</h2>
              <p>{{ datasetsError }}</p>
            </div>

            <div v-else-if="datasets.length > 0 || externalDatasets.length > 0" class="datasets-list">
              <p v-if="externalDatasets.length > 0 && dataAccessNote" class="external-notice">
                <el-icon :size="16"><InfoFilled /></el-icon>
                <span>{{ dataAccessNote }}</span>
              </p>
              <DatasetCard
                v-for="dataset in datasets"
                :key="dataset.id"
                class="mb-16"
                :dataset="dataset"
              />
              <ExternalDatasetCard
                v-for="dataset in externalDatasets"
                :key="dataset.id"
                class="mb-16"
                :dataset="dataset"
                :hosted-by="hostedBy"
              />
            </div>

            <div v-else class="no-datasets">
              <p>No datasets have been published for this project yet.</p>
              <NuxtLink to="/data?type=dataset" class="no-datasets-link">Browse all datasets →</NuxtLink>
            </div>
          </section>
        </div>

        <ProjectSidebar :project="project" :hide-description="!isStatsDashboardAvailable" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import DatasetCard from '~/components/Datasets/DatasetCard/DatasetCard.vue'
import { PROJECT_STATS_AVAILABLE_IDS } from '~/utils/constants.js'
import markedMixin from '@/mixins/marked/index'

const route = useRoute()
const { $contentfulClient } = useNuxtApp()

const { data: project, error, status } = useLazyAsyncData(
  `project-${route.params.id}`,
  () => $contentfulClient.getEntry(route.params.id),
)

const isLoading = computed(() => status.value === 'pending')
const projectName = computed(() => project.value?.fields?.name || '')
const projectSummary = computed(() => project.value?.fields?.summary || '')
const projectDescription = computed(() => {
  const description = project.value?.fields?.description
  return description ? markedMixin.methods.parseMarkdown(description) : ''
})
const externalDatasets = computed(() => project.value?.fields?.externalDatasets || [])
const hostedBy = computed(() => project.value?.fields?.hostedBy || 'external repository')
const dataAccessNote = computed(() => project.value?.fields?.dataAccess || '')
const isStatsDashboardAvailable = computed(() =>
  PROJECT_STATS_AVAILABLE_IDS.includes(project.value?.fields?.projectId?.toLowerCase()),
)

const {
  datasets,
  isLoading: datasetsLoading,
  error: datasetsError,
  fetchDatasets,
} = useProjectDatasets(project)

const totalDatasetCount = computed(() => datasets.value.length + externalDatasets.value.length)

watch(project, (currentProject) => {
  if (currentProject && datasets.value.length === 0 && !datasetsLoading.value) fetchDatasets()
}, { immediate: true })

useBreadcrumb(computed(() => [
  { label: 'Data', to: '/projects' },
  { label: projectName.value || 'Project' },
]))

useHead({
  title: computed(() => (project.value ? `${projectName.value} - Projects` : 'Project')),
  meta: [
    { name: 'description', content: projectSummary.value || 'Project details' },
  ],
})
</script>

<style scoped lang="scss">
.project-detail-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 60px 2rem 4rem;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.error-state { color: #d32f2f; }

.project-header {
  margin-bottom: 32px;

  .es-label { display: inline-flex; margin: 0 0 8px; }

  .project-title {
    font-size: 2rem;
    font-weight: 600;
    color: #000;
    margin: 0;
    text-transform: none;
  }

  .project-summary {
    max-width: 760px;
    margin: 12px 0 0;
    font-size: 1.05rem;
    line-height: 1.6;
    color: #333;
  }
}

.overview-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.overview-main {
  flex: 1;
  min-width: 0;
}

.panel {
  background: #fff;
  border: 1px solid $es-border;
  border-radius: $es-radius;
  padding: 24px;
  margin-bottom: 40px;
}

.dashboard-panel {
  --dash-widget-border: 1px solid #d0d4dc;
  --dash-widget-radius: 8px;
}

.section-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #000;
}

.section-heading {
  display: flex;
  align-items: baseline;
  gap: 10px;

  .dataset-count {
    font-size: 0.95rem;
    font-weight: 600;
    color: $es-teal;
  }
}

.es-heading-bar { margin-bottom: 20px; }

.description-text {
  color: #333;
  line-height: 1.65;

  :deep(h1), :deep(h2), :deep(h3) { text-transform: none; color: #000; margin: 20px 0 8px; }
  :deep(h1) { font-size: 1.4rem; }
  :deep(h2) { font-size: 1.2rem; }
  :deep(h3) { font-size: 1.05rem; }
  :deep(p) { margin: 0 0 12px; }
  :deep(a) { color: $es-primary; }
  :deep(ul) { padding-left: 20px; margin: 0 0 12px; }
}

.datasets-list { width: 100%; }

.external-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0 0 16px;
  padding: 12px 16px;
  border: 1px solid $es-border;
  border-left: 3px solid $es-teal;
  border-radius: $es-radius-sm;
  background: #fff;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #333;

  .el-icon { color: $es-teal; margin-top: 2px; flex-shrink: 0; }
}

.no-datasets {
  padding: 28px;
  border: 1px dashed $es-border;
  border-radius: $es-radius;
  text-align: center;
  color: #666;

  p { margin: 0 0 8px; }
  .no-datasets-link { color: $es-primary; font-weight: 600; text-decoration: none; &:hover { text-decoration: underline; } }
}

@media (max-width: 900px) {
  .project-detail-page { padding: 1rem 1rem 3rem; }
  .project-header .project-title { font-size: 1.5rem; }
  .overview-layout { flex-direction: column; }
}
</style>
