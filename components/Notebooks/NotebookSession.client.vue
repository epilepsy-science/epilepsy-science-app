<template>
  <JupyterSession :run-id="runId" />
</template>

<script setup>
// @pennsieve/notebooks' notebook, in the browser build only (.client): its
// renderers (CodeMirror, Jupyter, Vega, Plotly, KaTeX) kept out of the
// server build, which can't hold them in Heroku's build memory.
import JupyterSession from '@pennsieve/notebooks/components/Analysis/JupyterSession/JupyterSession.vue'

defineProps({
  runId: { type: String, required: true },
})
</script>
