import { ref, watch, onMounted } from 'vue'

// Datasets published on Discover that are not part of any project collection.
// Counted by Algolia with the same exclusion filter the scoped search page
// uses (?scope=individual), so the card and the results always agree even
// when the index and Discover are out of sync.
export function useUnassignedDatasets(projects) {
  const { $algoliaClient } = useNuxtApp()
  const config = useRuntimeConfig()
  const { excludeFilter } = useProjectDatasetIds()
  const count = ref(null)
  const size = ref(null)
  const loaded = ref(false)

  async function compute() {
    if (!projects.value?.length) return

    try {
      const filters = await excludeFilter(projects.value)
      const index = $algoliaClient.initIndex(config.public.ALGOLIA_INDEX)
      const { nbHits, facets_stats } = await index.search('', {
        hitsPerPage: 0,
        analytics: false,
        facets: ['size'],
        filters,
      })
      count.value = nbHits
      size.value = facets_stats?.size?.sum ?? 0
    } catch (e) {
      console.error('Failed to count individual datasets:', e)
      count.value = null
      size.value = null
    } finally {
      loaded.value = true
    }
  }

  onMounted(() => {
    compute()
    watch(projects, compute)
  })

  return { count, size, loaded }
}
