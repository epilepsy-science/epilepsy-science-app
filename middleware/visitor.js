// Notebooks run as the visitor: without their own sign-in, to the sign-in
// page and back.
import { useVisitorStore } from '@/store/visitor'

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const visitor = useVisitorStore()
  if (!(await visitor.load())) return navigateTo({ path: '/sign-in', query: { redirectTo: to.fullPath } })
})
