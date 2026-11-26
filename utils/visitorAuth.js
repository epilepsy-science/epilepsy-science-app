// A visitor's own Pennsieve sign-in (Amplify, configured in
// plugins/amplify.js). Notebooks run as the visitor.
import { fetchAuthSession, signOut } from 'aws-amplify/auth'
import Cookies from 'js-cookie'

// Amplify keeps the session in cookies, named
// CognitoIdentityServiceProvider.<clientId>.<user>.<token>.
const TOKEN_COOKIE = /^CognitoIdentityServiceProvider\./

// The current session's access token, or null.
export async function accessToken() {
  try {
    const session = await fetchAuthSession()
    return session?.tokens?.accessToken?.toString() || null
  } catch {
    return null
  }
}

// The access token and refresh token; workflow-service takes the refresh
// token (X-Refresh-Token) to keep a run's credentials fresh.
export async function allTokens() {
  const access = await accessToken()
  const refreshKey = Object.keys(Cookies.get()).find((k) => TOKEN_COOKIE.test(k) && k.endsWith('.refreshToken'))
  return { accessToken: access, refreshToken: refreshKey ? Cookies.get(refreshKey) : '' }
}

/**
 * Ends the stored session, whatever state it is in. An old session must never
 * stop a new sign-in: a refresh token past its lifetime can't be revoked, so
 * when signing out fails the session's cookies are removed here instead.
 */
export async function endSession(domain) {
  try {
    await signOut()
  } catch (err) {
    console.warn('Signing out failed; removing the stored session:', err?.message)
  }
  for (const name of Object.keys(Cookies.get())) {
    if (TOKEN_COOKIE.test(name)) {
      Cookies.remove(name, { path: '/' })
      if (domain) Cookies.remove(name, { path: '/', domain })
    }
  }
}

// Only same-origin paths: "//host" and "/\host" are protocol-relative.
export function safeRedirectPath(value) {
  if (typeof value !== 'string' || !value.startsWith('/')) return null
  if (value.startsWith('//') || value.startsWith('/\\')) return null
  if (value === '/sign-in' || value.startsWith('/sign-in?')) return null
  return value
}
