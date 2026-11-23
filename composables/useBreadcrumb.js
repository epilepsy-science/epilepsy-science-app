import { watchEffect, onBeforeUnmount, unref, computed } from 'vue'

// Pages declare their breadcrumb trail; the default layout renders it in one
// fixed strip so it sits in the same place on every page.
// items: [{ label, to? }] or a ref/computed of that; the last item is the current page.
//
// Each page owns its trail. With async page setup the previous page can unmount
// *after* the new page has set its trail, so cleanup only clears a trail the
// unmounting page itself set.
let nextOwnerId = 0

export function useBreadcrumb(items) {
  const state = useState('breadcrumb', () => ({ owner: null, items: [] }))

  if (items !== undefined) {
    const owner = ++nextOwnerId

    watchEffect(() => {
      state.value = { owner, items: unref(items) || [] }
    })

    onBeforeUnmount(() => {
      if (state.value.owner === owner) state.value = { owner: null, items: [] }
    })
  }

  return computed(() => state.value.items)
}
