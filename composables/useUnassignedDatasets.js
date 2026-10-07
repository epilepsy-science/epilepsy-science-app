import { ref, watch, onMounted } from 'vue'
import { useMainStore } from '~/store/index'

// Datasets published on Discover that are not part of any project collection.
export function useUnassignedDatasets(projects) {
  const pageStore = useMainStore()
  const { load } = useProjectDatasetIds()
  const count = ref(null)
  const size = ref(null)
  const loaded = ref(false)

  // Kick this off synchronously so the store action runs inside the Nuxt context.
  const statsReady =
    typeof pageStore.pageStats.datasets === 'number'
      ? Promise.resolve()
      : pageStore.fetchDatasetStats()

  async function compute() {
    if (!projects.value?.length) return

    const assigned = await load(projects.value)
    const assignedSize = [...assigned.values()].reduce((sum, s) => sum + s, 0)

    await statsReady
    const total = pageStore.pageStats.datasets
    const totalSize = pageStore.pageStats.totalDatasetSize
    if (typeof total === 'number') count.value = Math.max(total - assigned.size, 0)
    if (typeof totalSize === 'number') size.value = Math.max(totalSize - assignedSize, 0)
    loaded.value = true
  }

  onMounted(() => {
    compute()
    watch(projects, compute)
  })

  return { count, size, loaded }
}
