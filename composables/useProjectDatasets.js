import { ref, computed } from 'vue'

export function useProjectDatasets(project) {
  const runtimeConfig = useRuntimeConfig()

  const datasets = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const collectionIds = computed(() => {
    const rawCollectionIds = project.value?.fields?.collectionIds
    if (!Array.isArray(rawCollectionIds)) return []
    return rawCollectionIds.filter((collectionId) => collectionId && Number(collectionId) !== 0)
  })

  function buildDatasetsUrl(collectionId) {
    return `${runtimeConfig.public.discover_api_host}/datasets/${collectionId}/versions/1/dois?limit=200&offset=0`
  }

  async function fetchDatasets() {
    if (collectionIds.value.length === 0) return

    isLoading.value = true
    error.value = null

    try {
      const responses = await Promise.all(
        collectionIds.value.map((collectionId) =>
          useSendXhr(buildDatasetsUrl(collectionId), { header: {}, method: 'GET' })
        )
      )

      const datasetsById = new Map()
      for (const response of responses) {
        if (!Array.isArray(response?.dois)) continue
        for (const item of response.dois) {
          const dataset = item.data || item
          datasetsById.set(dataset.id, dataset)
        }
      }
      datasets.value = Array.from(datasetsById.values())
    } catch (fetchError) {
      console.error('Failed to fetch datasets:', fetchError)
      error.value = fetchError.message || 'Failed to load datasets'
      datasets.value = []
    } finally {
      isLoading.value = false
    }
  }

  return { datasets, isLoading, error, fetchDatasets }
}
