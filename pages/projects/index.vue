<template>
  <div class="projects-page">
    <section class="data-hero es-dots">
      <div class="data-hero__inner">
        <p class="es-label">Data</p>
        <h1 class="data-hero__title">Research projects</h1>
        <div class="es-heading-bar centered"><i></i></div>
        <p class="data-hero__text">
          Browse curated research projects, each with its own datasets and cohort statistics —
          or search every published dataset at once.
        </p>
        <DataBrowseTabs active="projects" class="mb-24" />
        <div class="data-hero__search">
          <el-input
            v-model="filterText"
            class="filter-input"
            placeholder="Filter projects by name, topic, or investigator"
            clearable
            :prefix-icon="Search"
          />
        </div>
      </div>
    </section>

    <div class="projects-body">
    <ProjectsList
      v-if="filteredProjects.length > 0"
      :projects="filteredProjects"
      :total-count="totalCount"
      :is-loading="isLoading"
      show-unassigned
    />
    <div v-else-if="isLoading" class="message">Loading projects...</div>
    <div v-else-if="error" class="message error">Error loading projects: {{ error }}</div>
    <div v-else class="message">No projects match “{{ filterText }}”.</div>
    </div>

    <section class="all-data-callout">
      <div>
        <h2>Looking for something specific?</h2>
        <p>Search every published dataset across all projects by keyword, modality, or species.</p>
      </div>
      <NuxtLink to="/data?type=dataset" class="callout-button">Search all datasets →</NuxtLink>
    </section>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'

const { $contentfulClient } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()

const projectsContentType = runtimeConfig.public.deploy_env === 'dev' ? 'devEnvironmentProject' : 'project'

const { data: contentfulProjects, error, status } = useLazyAsyncData('projects', () =>
  $contentfulClient.getEntries({ content_type: projectsContentType }),
)

const projects = computed(() => contentfulProjects.value?.items || [])
const totalCount = computed(() => contentfulProjects.value?.total || 0)
const isLoading = computed(() => status.value === 'pending')

const filterText = ref('')
const filteredProjects = computed(() => {
  const q = filterText.value.trim().toLowerCase()
  if (!q) return projects.value
  return projects.value.filter(({ fields = {} }) =>
    [fields.name, fields.summary, ...(fields.investigators || [])].join(' ').toLowerCase().includes(q),
  )
})


useBreadcrumb([{ label: 'Data' }])
useHead({ title: 'Data - Epilepsy.Science' })
</script>

<style scoped lang="scss">
/* Hero mirrors pages/data/index.vue exactly so the two tabs feel like one page */
.data-hero {
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

  &__search {
    max-width: 640px;
    margin: 0 auto;

    :deep(.el-input__wrapper) {
      border-radius: $es-radius-sm;
      box-shadow: 0 0 0 1px $es-border inset;
      padding: 6px 12px;
      background: #fff;
    }
  }
}

.projects-body,
.all-data-callout {
  max-width: 1200px;
  margin-inline: auto;
}

.projects-body {
  padding: 32px 20px 0;
}

.message {
  text-align: center;
  padding: 3rem;
  color: #555;
  &.error { color: #d32f2f; }
}

.all-data-callout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin: 48px auto 64px;
  padding: 28px 32px;
  border: 1px solid $es-border;
  border-radius: $es-radius;
  background: #fff;

  h2 { margin: 0 0 4px; font-size: 1.25rem; font-weight: 600; }
  p { margin: 0; color: #333; }
}

.callout-button {
  padding: 10px 22px;
  border: 1px solid $es-cta;
  border-radius: $es-radius-sm;
  background: $es-cta;
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
  &:hover { background: $es-cta-hover; }
}

@media (max-width: 768px) {
  .data-hero__inner { padding: 40px 16px 32px; }
  .data-hero__title { font-size: 1.6rem; }
  .projects-body { padding: 24px 16px 0; }
  .all-data-callout { flex-direction: column; align-items: flex-start; }
}
</style>
