<template>
  <section class="how-it-works">
    <div class="inner">
      <div class="section-heading">
        <p class="es-label">How it works</p>
        <h2>What can I do on Epilepsy.Science?</h2>
        <div class="es-heading-bar centered"><i></i></div>
        <p>Built on the Pennsieve data platform. Every dataset is versioned, citable, and described using shared epilepsy data elements.</p>
      </div>

      <ol class="steps">
        <li v-for="(step, i) in steps" :key="step.title">
          <span class="step-number">{{ String(i + 1).padStart(2, '0') }}</span>
          <div class="step-icon"><el-icon :size="26"><component :is="step.icon" /></el-icon></div>
          <h3>{{ step.title }}</h3>
          <p>{{ step.text }}</p>
          <component :is="step.external ? 'a' : 'NuxtLink'" :to="step.to" :href="step.to" :target="step.external ? '_blank' : null" rel="noopener" class="step-link">
            {{ step.linkText }} →
          </component>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup>
import { DataAnalysis, Download, Collection, Upload } from '@element-plus/icons-vue'

const steps = [
  {
    icon: DataAnalysis,
    title: 'Explore cohorts',
    text: 'Each project publishes an interactive dashboard: demographics, modalities, implant and outcome statistics computed live from the metadata.',
    to: '/projects',
    linkText: 'See projects',
  },
  {
    icon: Collection,
    title: 'Speak the same language',
    text: 'Projects annotate data with shared Common Data Elements for epilepsy, so cohorts can be compared across institutions.',
    to: 'https://cde.epilepsy.science',
    linkText: 'Browse the CDEs',
    external: true,
  },
  {
    icon: Download,
    title: 'Download for research',
    text: 'Every dataset has a DOI and version history. Download files directly or pull them programmatically through the Pennsieve API.',
    to: '/data?type=dataset',
    linkText: 'Find a dataset',
  },
  {
    icon: Upload,
    title: 'Contribute your data',
    text: 'Publish your own cohort, get a citable DOI, and reach researchers worldwide.',
    to: 'https://forms.gle/rGW9MQna5jQa7iGm6',
    linkText: 'Get in touch',
    external: true,
  },
]
</script>

<style scoped lang="scss">
.how-it-works {
  background-color: white;
  background-image: radial-gradient(#83CFAB 1px, transparent 1px);
  background-size: 20px 20px;
}

.inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 64px 20px;
}

.section-heading {
  padding: 0 20px 32px;
  text-align: center;

  .es-label { margin: 0 0 8px; }
  h2 { margin: 0; font-size: 1.8rem; font-weight: 500; text-transform: uppercase; }
  .es-heading-bar { margin-bottom: 12px; }
  p { margin: 0; font-size: 1rem; line-height: 1.6; color: #333; }
}

.steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 24px;
    background: #fff;
    border: 1px solid $es-border;
    border-radius: $es-radius;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  h3 { margin: 16px 0 8px; font-size: 1.1rem; font-weight: 600; line-height: 1.3; text-transform: uppercase; }
  p { margin: 0 0 16px; font-size: 0.93rem; line-height: 1.6; color: #333; flex: 1; }
}

.step-number {
  position: absolute;
  top: 16px;
  right: 20px;
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1;
  color: $es-mint;
}

.step-icon {
  display: inline-flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  background: $es-teal;
  color: #fff;
  border-radius: $es-radius-sm;
}

.step-link {
  color: $es-primary;
  font-weight: 600;
  text-decoration: none;
  &:hover { text-decoration: underline; }
}

@media (max-width: 1024px) { .steps { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) {
  .inner { padding: 48px 16px; }
  .steps { grid-template-columns: 1fr; }
}
</style>
