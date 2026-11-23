<template>
  <aside class="overview-sidebar">
    <div v-if="bannerImageUrl" class="sidebar-logo-wrapper">
      <img :src="bannerImageUrl" alt="Project banner" class="sidebar-logo" />
    </div>

    <div v-if="description && !hideDescription" class="sidebar-item">
      <h3 class="sidebar-label">Description</h3>
      <div class="sidebar-text" v-html="formattedDescription"></div>
    </div>

    <div v-if="investigators.length > 0" class="sidebar-item">
      <h3 class="sidebar-label">Investigators</h3>
      <p class="sidebar-text">{{ investigators.join(', ') }}</p>
    </div>

    <div v-if="funding.length > 0" class="sidebar-item">
      <h3 class="sidebar-label">Funding</h3>
      <p class="sidebar-text">{{ funding.join(', ') }}</p>
    </div>

    <div v-if="hostedBy || website" class="sidebar-item">
      <h3 class="sidebar-label">Data hosted by</h3>
      <p class="sidebar-text">
        <a v-if="website" :href="website" target="_blank" rel="noopener" class="sidebar-link">{{ hostedBy || websiteLabel }} ↗</a>
        <span v-else>{{ hostedBy }}</span>
      </p>
      <p v-if="dataAccess" class="sidebar-text sidebar-note">{{ dataAccess }}</p>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import markedMixin from '@/mixins/marked/index'

const props = defineProps({
  project: { type: Object, default: null },
  hideDescription: { type: Boolean, default: false },
})

const parseMarkdown = markedMixin.methods.parseMarkdown

const bannerImageUrl = computed(() => {
  const fileUrl = props.project?.fields?.bannerImage?.fields?.file?.url
  return fileUrl ? `https://${fileUrl}` : null
})

const description = computed(() => props.project?.fields?.description || null)
const investigators = computed(() => props.project?.fields?.investigators || [])
const funding = computed(() => props.project?.fields?.funding || [])
const hostedBy = computed(() => props.project?.fields?.hostedBy || '')
const website = computed(() => props.project?.fields?.website || '')
const websiteLabel = computed(() => website.value.replace(/^https?:\/\//, '').replace(/\/$/, ''))
const dataAccess = computed(() => props.project?.fields?.dataAccess || '')

const formattedDescription = computed(() => {
  if (!description.value) return 'No description available.'
  return parseMarkdown(description.value)
})
</script>

<style scoped lang="scss">
.overview-sidebar {
  width: 340px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid $es-border;
  border-radius: $es-radius;
  overflow: hidden;
}

.sidebar-logo-wrapper {
  padding: 1rem;
  display: flex;
  justify-content: center;

  .sidebar-logo {
    width: 200px;
    height: 200px;
    display: block;
    object-fit: contain;
  }
}

.sidebar-item {
  padding: 1rem 1.25rem;
  border-top: 1px solid $es-border;
}

.sidebar-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: $es-teal;
  margin: 0 0 0.35rem 0;
}

.sidebar-text {
  font-size: 0.85rem;
  line-height: 1.5;
  color: #444;
  margin: 0;
}

.sidebar-note {
  margin-top: 0.5rem;
  color: #666;
}

.sidebar-link {
  color: $es-primary;
  font-weight: 600;
  text-decoration: none;
  &:hover { text-decoration: underline; }
}

@media (max-width: 768px) {
  .overview-sidebar {
    width: 100%;
  }
}
</style>
