// Epilepsy.Science as a host of @pennsieve/notebooks: the visitor's own
// Pennsieve account as the scope (there are no workspaces here), its
// datasets from the Registry of Open Data on AWS.
import { ElMessage } from 'element-plus'
import { configureNotebooks } from '@pennsieve/notebooks/notebooks/host'
import { createPennsieveBackend } from '@pennsieve/notebooks/notebooks/pennsieveBackend'
import '@pennsieve/notebooks/style.css'
import { useVisitorStore } from '@/store/visitor'
import { accessToken, allTokens } from '@/utils/visitorAuth'
import { notebookEndpoints } from '@/utils/notebookEndpoints'
import { SHARED_NODE } from '@/utils/computeBrand'

// The sizes offered. The Pennsieve Shared Compute Node (platform: true)
// takes the smaller ones only (SHARED_NODE.sizes).
const SIZES = [
  { key: 'small', label: 'Small', detail: '1 vCPU · 2 GB', cpu: '1024', memory: '2048' },
  { key: 'medium', label: 'Medium', detail: '2 vCPU · 4 GB', cpu: '2048', memory: '4096' },
  { key: 'large', label: 'Large', detail: '4 vCPU · 8 GB', cpu: '4096', memory: '8192' },
]

export default defineNuxtPlugin((nuxtApp) => {
  const endpoints = notebookEndpoints(useRuntimeConfig().public)
  const visitor = useVisitorStore(nuxtApp.$pinia)
  const scope = () => ({ kind: 'user', userId: visitor.profile?.id })

  configureNotebooks({
    endpoints,
    getToken: accessToken,
    getTokens: allTokens,
    backend: createPennsieveBackend({ endpoints, scope, getToken: accessToken, getTokens: allTokens }),
    user: () => visitor.profile,
    members: () => [],
    pennsieveAppUrl: endpoints.pennsieveAppUrl,
    notify: ({ type, message }) => ElMessage({ type, message }),
    locations: {
      run: () => ({ name: 'notebooks' }),
      notebook: (runId) => ({ name: 'notebooks-runId', params: { runId } }),
      listedRun: (runId) => ({ name: 'notebooks-runId', params: { runId } }),
    },
    launch: {
      platforms: ['epilepsyScience'],
      sizes: SIZES,
      sizeAllowed: (size, node) => !node?.platform || SHARED_NODE.sizes.includes(size.key),
      defaultSize: 'small',
      // "Add a compute node": on the visitor's own AWS account.
      computeNodes: { path: '/notebooks/compute' },
    },
  })
})
