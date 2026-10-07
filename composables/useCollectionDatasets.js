// Fetch every dataset in a Discover collection, using the collection's latest
// published version and paging through the DOI list.
const PAGE_SIZE = 200

export function useCollectionDatasets() {
  const runtimeConfig = useRuntimeConfig()
  const host = runtimeConfig.public.discover_api_host

  async function fetchCollectionDatasets(collectionId) {
    const collection = await useSendXhr(`${host}/datasets/${collectionId}`, { header: {}, method: 'GET' })
    const version = collection?.version || 1

    const datasets = []
    let offset = 0
    while (true) {
      const response = await useSendXhr(
        `${host}/datasets/${collectionId}/versions/${version}/dois?limit=${PAGE_SIZE}&offset=${offset}`,
        { header: {}, method: 'GET' },
      )
      const page = Array.isArray(response?.dois) ? response.dois : []
      datasets.push(...page.map((item) => item.data || item))
      offset += page.length
      const total = response?.totalCount ?? datasets.length
      if (page.length === 0 || offset >= total) break
    }
    return datasets
  }

  return { fetchCollectionDatasets }
}
