// Resolves the set of Discover dataset IDs that belong to any project collection.
// Cached per page load so the projects list and the data page share one fetch.
let cache = null

export function useProjectDatasetIds() {
  const { $contentfulClient } = useNuxtApp()
  const runtimeConfig = useRuntimeConfig()
  const contentType = runtimeConfig.public.deploy_env === 'dev' ? 'devEnvironmentProject' : 'project'
  const { fetchCollectionDatasets } = useCollectionDatasets()

  async function fetchCollection(collectionId) {
    try {
      return await fetchCollectionDatasets(collectionId)
    } catch {
      return []
    }
  }

  // Returns Map<datasetId, size>
  async function load(projects) {
    if (cache) return cache
    cache = (async () => {
      const items = projects || (await $contentfulClient.getEntries({ content_type: contentType })).items || []
      const collectionIds = new Set()
      for (const project of items) {
        for (const id of project.fields?.collectionIds || []) {
          if (id && Number(id) !== 0) collectionIds.add(id)
        }
      }
      const results = await Promise.all([...collectionIds].map(fetchCollection))
      const byId = new Map()
      for (const datasets of results) {
        for (const d of datasets) byId.set(String(d.id), d.size || 0)
      }
      return byId
    })()
    return cache
  }

  // Algolia filter string excluding every project dataset
  async function excludeFilter(projects) {
    const ids = await load(projects)
    return [...ids.keys()].map((id) => `NOT objectID:${id}`).join(' AND ')
  }

  return { load, excludeFilter }
}
