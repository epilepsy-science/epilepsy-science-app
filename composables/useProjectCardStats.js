import { ref, computed, onMounted } from 'vue'
import { PROJECT_STATS_AVAILABLE_IDS } from '~/utils/constants.js'

export function useProjectCardStats(project) {
  const mock = project.value?.fields?.mockStats
  const stats = ref({
    datasets: mock?.datasets ?? null,
    size: mock?.size ?? null,
    patients: mock?.patients ?? null,
    recordings: mock?.recordings ?? null,
    modalities: mock?.modalities ?? [],
    loaded: Boolean(mock),
  })

  const hasDashboard = computed(() =>
    mock?.dashboard ?? PROJECT_STATS_AVAILABLE_IDS.includes(project.value?.fields?.projectId?.toLowerCase()),
  )

  onMounted(async () => {
    if (mock) return

    const { datasets, fetchDatasets } = useProjectDatasets(project)
    await fetchDatasets()
    const external = project.value?.fields?.externalDatasets || []
    stats.value.datasets = datasets.value.length + external.length
    stats.value.size = datasets.value.reduce((sum, d) => sum + (d.size || 0), 0)
    stats.value.loaded = true

    if (hasDashboard.value) {
      const projectId = project.value.fields.projectId.toLowerCase()
      const { queryRaw, table } = useDuckDB()
      try {
        const [[patients], [recordings]] = await Promise.all([
          queryRaw(`SELECT COUNT(DISTINCT person_id) AS total FROM ${table(`${projectId}_person.parquet`)}`),
          queryRaw(`SELECT COUNT(*) AS total FROM ${table(`${projectId}_ieeg_recording_parameters.parquet`)}`),
        ])
        stats.value.patients = Number(patients.total)
        stats.value.recordings = Number(recordings.total)
      } catch (e) {
        console.error('Failed to load project card stats:', e)
      }
    }
  })

  return { stats, hasDashboard }
}
