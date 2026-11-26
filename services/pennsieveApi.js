// Pennsieve's APIs, called as the signed-in visitor. api2 (the newer
// services) takes the token as a bearer; api (the older one) as ?api_key=.
import { accessToken } from '@/utils/visitorAuth'
import { notebookEndpoints } from '@/utils/notebookEndpoints'

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || body?.error || `Request failed (${status})`)
    this.status = status
    this.body = body
  }
}

async function parse(resp) {
  const text = await resp.text()
  let body = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = { message: text }
  }
  if (!resp.ok) throw new ApiError(resp.status, body)
  return body
}

const endpoints = () => notebookEndpoints(useRuntimeConfig().public)

// A call to api2: path like "/compute/workflows/runs".
export async function api2(path, { method = 'GET', body } = {}) {
  const resp = await fetch(`${endpoints().api2Url}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await accessToken()}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return parse(resp)
}

// A call to the older api: path like "/user".
export async function api(path) {
  const token = await accessToken()
  const sep = path.includes('?') ? '&' : '?'
  const resp = await fetch(`${endpoints().apiUrl}${path}${sep}api_key=${token}`, {
    headers: { 'Content-Type': 'application/json' },
  })
  return parse(resp)
}
