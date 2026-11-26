// The visitor's notebook runs through workflow-service, outside any
// workspace. Starting one is @pennsieve/notebooks' quick launcher
// (pages/notebooks/new.vue).
import { api2 } from '@/services/pennsieveApi'

export const RUNNING = ['NOT_STARTED', 'STARTED', 'FINALIZING']

// The visitor's runs outside any workspace that are notebooks.
export async function listNotebookRuns() {
  const body = await api2('/compute/workflows/runs?limit=50')
  const runs = Array.isArray(body) ? body : body?.runs || []
  return runs.filter((r) => r.interactive === true || r.notebook || (r.dag || []).some((d) => d.runtimeConfig?.interactive))
}

export const getRun = (runId) => api2(`/compute/workflows/runs/${runId}`)

// The session to connect to, once it is up: { kernelUrl, token, expiresAt },
// or null while it starts (404, 202 or a server error).
export async function sessionConnect(runId) {
  try {
    const body = await api2(`/compute/workflows/runs/${runId}/session/connect`)
    return body?.kernelUrl ? body : null
  } catch (err) {
    if (err.status === 404 || err.status === 202 || err.status >= 500) return null
    throw err
  }
}

// Ends a session. The task stops while it answers, so a gateway error or no
// answer also means it is closed.
export async function stopNotebook(runId) {
  const session = await sessionConnect(runId).catch(() => null)
  if (!session) return
  try {
    const resp = await fetch(`${session.kernelUrl.replace(/\/$/, '')}/pennsieve/close`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.token}` },
      credentials: 'include',
      signal: AbortSignal.timeout(15000),
    })
    if (!resp.ok && ![502, 503, 504].includes(resp.status)) throw new Error(`The notebook didn't stop (${resp.status})`)
  } catch (err) {
    if (err.name === 'TimeoutError' || err instanceof TypeError) return
    throw err
  }
}
