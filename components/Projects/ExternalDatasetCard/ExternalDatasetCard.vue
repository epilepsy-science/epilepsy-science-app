<template>
  <article class="external-dataset-card">
    <div class="card-main">
      <div class="card-header">
        <span class="hosted-badge">
          <el-icon :size="12"><Link /></el-icon> Hosted by {{ hostedBy }}
        </span>
        <span v-if="dataset.accessTier" class="access-badge" :class="`tier-${dataset.accessTier}`">
          {{ accessLabel }}
        </span>
      </div>

      <h3 class="dataset-title">
        <a :href="dataset.links?.landing" target="_blank" rel="noopener">{{ dataset.name }}</a>
      </h3>
      <p class="dataset-description">{{ dataset.description }}</p>

      <ul class="detail-row">
        <li v-if="dataset.subjects != null" class="detail">
          <strong>{{ formatCount(dataset.subjects) }}</strong> {{ dataset.subjects === 1 ? 'Subject' : 'Subjects' }}
        </li>
        <li v-if="dataset.formats?.length" class="detail">
          <strong>{{ dataset.formats.join(', ') }}</strong>
        </li>
        <li v-if="dataset.license" class="detail">
          <strong>{{ dataset.license }}</strong>
        </li>
        <li v-if="dataset.version" class="detail">
          v{{ dataset.version }}<span v-if="dataset.publishedYear">, {{ dataset.publishedYear }}</span>
        </li>
      </ul>

      <div v-if="dataset.modalities?.length" class="modality-tags">
        <span v-for="m in dataset.modalities" :key="m" class="modality-tag">{{ m }}</span>
        <span v-if="dataset.hasRawSignal === false" class="modality-tag muted">Derived features only</span>
      </div>
    </div>

    <div class="card-meta">
      <div v-if="authors" class="authors">{{ authors }}</div>
      <div class="links">
        <a v-if="dataset.links?.landing" :href="dataset.links.landing" target="_blank" rel="noopener" class="link primary">
          View on {{ hostedBy }} →
        </a>
        <a v-if="dataset.doi" :href="`https://doi.org/${dataset.doi}`" target="_blank" rel="noopener" class="link">
          DOI {{ dataset.doi }}
        </a>
        <a v-if="dataset.links?.code" :href="dataset.links.code" target="_blank" rel="noopener" class="link">
          Code &amp; data on GitHub
        </a>
        <button v-if="dataset.links?.s3" type="button" class="link s3" @click="copyS3">
          {{ copied ? 'Copied S3 path' : 'Copy S3 path' }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Link } from '@element-plus/icons-vue'

const props = defineProps({
  dataset: { type: Object, required: true },
  hostedBy: { type: String, default: 'external repository' },
})

const ACCESS_LABELS = {
  open: 'Open access',
  restricted: 'Registration + DUA',
  credentialed: 'Credentialed access',
}
const accessLabel = computed(() => ACCESS_LABELS[props.dataset.accessTier] || props.dataset.accessTier)

const authors = computed(() => {
  const list = props.dataset.authors || []
  if (list.length <= 3) return list.join(', ')
  return `${list.slice(0, 3).join(', ')} +${list.length - 3}`
})

const copied = ref(false)
async function copyS3() {
  try {
    await navigator.clipboard.writeText(`s3://${props.dataset.links.s3}`)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch (e) {
    console.error('Clipboard write failed:', e)
  }
}

const formatCount = (n) => Number(n).toLocaleString()
</script>

<style scoped lang="scss">
.external-dataset-card {
  background: #fff;
  border: 1px solid $es-border;
  border-radius: $es-radius;
  overflow: hidden;
}

.card-main {
  padding: 20px 24px 16px;
}

.card-header {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.hosted-badge,
.access-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: $es-radius-sm;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.hosted-badge {
  background: $es-panel-grey;
  color: $es-teal;
}

.access-badge {
  border: 1px solid $es-border;
  color: #555;

  &.tier-open { border-color: $es-mint; color: #2b7a4b; background: #f1faf5; }
  &.tier-restricted { border-color: #f0c27a; color: #8a5a00; background: #fff8ec; }
  &.tier-credentialed { border-color: #e0a0a0; color: #8a2b2b; background: #fff3f3; }
}

.dataset-title {
  margin: 0 0 8px;
  font-size: 1.2rem;
  line-height: 1.35;
  font-weight: 600;
  text-transform: none;

  a {
    color: $es-primary;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
}

.dataset-description {
  margin: 0 0 14px;
  font-size: 0.95rem;
  line-height: 1.55;
  color: #333;
}

.detail-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  list-style: none;
  padding: 10px 0;
  margin: 0 0 12px;
  border-block: 1px solid $es-border;
  font-size: 0.85rem;
  color: #555;

  strong { color: $es-teal; }
}

.modality-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.modality-tag {
  padding: 2px 10px;
  border-radius: $es-radius-sm;
  background: $es-panel-grey;
  color: $es-teal;
  font-size: 0.75rem;
  font-weight: 600;

  &.muted { background: #fff; border: 1px dashed $es-border; color: #777; font-weight: 500; }
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding: 12px 24px;
  background: #f7f9fb;
  border-top: 1px solid $es-border;
  font-size: 0.85rem;

  .authors { color: #555; }
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  align-items: center;
}

.link {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  color: #4d628c;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;

  &:hover { color: $es-primary; text-decoration: underline; }
  &.primary { color: $es-primary; text-transform: uppercase; }
  &.s3 { color: $es-teal; }
}

@media (max-width: 768px) {
  .card-main { padding: 16px; }
  .card-meta { padding: 12px 16px; flex-direction: column; align-items: flex-start; }
}
</style>
