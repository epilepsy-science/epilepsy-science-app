<template>
  <div class="landing-page">
    <HomeHero :project-count="projects.length || null" />

    <section class="featured-projects">
      <div class="inner">
        <div class="section-heading">
          <div>
            <p class="es-label">Start here</p>
            <h2>Research Projects</h2>
            <div class="es-heading-bar"><i></i></div>
          </div>
          <NuxtLink to="/projects" class="view-all">View all projects →</NuxtLink>
        </div>

        <ProjectsList
          :projects="featuredProjects"
          :is-loading="isLoading"
          layout="featured"
        />
      </div>
    </section>

    <HowItWorks />

    <section class="subscribe-strip">
      <div class="inner">
        <div>
          <p class="es-label">Newsletter</p>
          <h2>Stay in the loop</h2>
          <p>Occasional updates when new cohorts, features, or tools are released. No spam.</p>
        </div>
        <a :href="subscribeUrl" target="_blank" rel="noopener" class="subscribe-button">Subscribe to updates</a>
      </div>
    </section>
  </div>
</template>

<script setup>
const { $contentfulClient } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()

const projectsContentType = runtimeConfig.public.deploy_env === 'dev' ? 'devEnvironmentProject' : 'project'
const subscribeUrl =
  'https://docs.google.com/forms/d/e/1FAIpQLSfiYHwJqkU9N-UqyvbEvJWrdKKL6myURkUq1-xHI7a7FBVxCg/viewform'

const { data: contentfulProjects, status } = useLazyAsyncData('projects', () =>
  $contentfulClient.getEntries({ content_type: projectsContentType }),
)

const projects = computed(() => contentfulProjects.value?.items || [])
const isLoading = computed(() => status.value === 'pending')

// Featured layout puts the dashboard project full-width; keep the rest to one row of three.
const featuredProjects = computed(() => projects.value.slice(0, 4))
</script>

<style scoped lang="scss">
.inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.featured-projects {
  padding: 64px 0 72px;

  .section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 24px;

    h2 { margin: 8px 0 0; font-size: 1.8rem; font-weight: 500; text-transform: uppercase; }
    .es-label { margin: 0; }
  }

  .view-all {
    color: $es-primary;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.9rem;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
}

.subscribe-strip {
  padding: 0 0 64px;

  .inner > div,
  .inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .inner {
    border: 1px solid $es-border;
    border-radius: $es-radius;
    background: #fff;
    padding: 28px 32px;
    max-width: 1160px;
  }

  h2 { margin: 4px 0; font-size: 1.4rem; font-weight: 600; }
  p { margin: 0; color: #333; }
  .es-label { margin: 0; }
  .inner > div { display: block; }
}

.subscribe-button {
  padding: 12px 24px;
  border: 1px solid $es-cta;
  border-radius: $es-radius-sm;
  background: #fff;
  color: $es-cta;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.9rem;
  text-decoration: none;
  white-space: nowrap;
  &:hover { background: $es-cta; color: #fff; }
}

@media (max-width: 768px) {
  .inner { padding: 0 16px; }
  .featured-projects { padding: 40px 0 48px; }
  .featured-projects .section-heading { flex-direction: column; align-items: flex-start; gap: 8px; }
  .subscribe-strip .inner { flex-direction: column; align-items: flex-start; }
}
</style>
