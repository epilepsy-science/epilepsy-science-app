<template>
  <QuickLauncher v-bind="$attrs" />
</template>

<script setup>
// @pennsieve/notebooks' quick launcher, in the browser build only (.client),
// as NotebookSession.
import QuickLauncher from '@pennsieve/notebooks/launch/QuickLauncher.vue'

defineOptions({ inheritAttrs: false })
</script>
