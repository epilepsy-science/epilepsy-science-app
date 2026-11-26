<template>
  <div>
    <NotebooksHero title="Start a notebook">
      On an Epilepsy.Science dataset, read from its copy in the Registry of Open Data on AWS. You pick the files to
      download into the notebook.
    </NotebooksHero>

  <section class="page">
    <div class="inner">
      <NuxtLink to="/notebooks" class="back">← My notebooks</NuxtLink>

      <el-alert v-if="kernelsError" :title="kernelsError" type="error" show-icon :closable="false" />
      <div v-else v-loading="!kernels" class="launcher">
        <NotebookLauncher
          v-if="kernels"
          :workflows="kernels"
          personal
          :start-portal-dataset="startDataset"
          @launched="opened"
        />
      </div>
    </div>
  </section>
  </div>
</template>

<script setup>
// The quick launcher of @pennsieve/notebooks, as a page: data, notebook,
// start. ?dataset=<id> opens it on that dataset ("Open in a notebook").
import { notebookBackend } from '@pennsieve/notebooks/notebooks/host'

definePageMeta({ middleware: 'visitor' })
useHead({ title: 'Start a notebook · Epilepsy.Science' })

const route = useRoute()
const router = useRouter()

const startDataset = computed(() => {
  const id = Number(route.query.dataset)
  return Number.isInteger(id) && id > 0 ? { portal: 'epilepsyScience', id } : null
})

// Pennsieve's notebook definitions; the launcher offers those that start
// without a workspace.
const kernels = ref(null)
const kernelsError = ref('')
onMounted(async () => {
  try {
    kernels.value = await notebookBackend().listNotebookDefinitions()
  } catch (err) {
    kernelsError.value = `Couldn't load notebooks: ${err.message}`
  }
})

const opened = (run) => router.push({ name: 'notebooks-runId', params: { runId: run.executionRunId || run.uuid } })
</script>

<style lang="scss" scoped>
.page {
  padding: 32px 0 64px;
}

.inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.back {
  display: block;
  width: fit-content;
  margin: 0 0 20px;
  color: $es-primary;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;

  &:hover,
  &:focus-visible {
    text-decoration: underline;
  }
}

// The launcher scrolls its step inside this height; its buttons stay in view.
.launcher {
  display: flex;
  flex-direction: column;
  height: min(720px, calc(100vh - 240px));
  min-height: 420px;
  padding: 20px 24px;
  background: #fff;
  border: 1px solid $es-border;
  border-radius: $es-radius;
}
</style>
