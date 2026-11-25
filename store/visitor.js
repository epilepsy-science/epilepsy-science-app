// Who is signed in, with their own Pennsieve account. Notebooks run as
// them.
import { defineStore } from 'pinia'
import { api } from '@/services/pennsieveApi'
import { accessToken, endSession } from '@/utils/visitorAuth'

export const useVisitorStore = defineStore('visitor', () => {
  const profile = ref(null)
  const checked = ref(false)

  const signedIn = computed(() => !!profile.value)

  // Loads the visitor's profile when there is a session; once, unless
  // forced.
  async function load(force = false) {
    if (checked.value && !force) return profile.value
    profile.value = null
    if (await accessToken()) {
      try {
        profile.value = await api('/user')
      } catch (err) {
        console.warn('Loading the profile failed:', err.message)
      }
    }
    checked.value = true
    return profile.value
  }

  async function signOut() {
    await endSession(useRuntimeConfig().public.app_domain)
    profile.value = null
  }

  return { profile, checked, signedIn, load, signOut }
})
