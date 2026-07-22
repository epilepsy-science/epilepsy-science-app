<template>
  <HistogramCard
    title="Distribution of Age at iEEG Implant"
    :bin-counts="binCounts"
    :x-tick-labels="xTickLabels"
    x-axis-title="Age at iEEG implant (years)"
    :footer-items="footerItems"
  />
</template>

<script setup>
import { computed } from 'vue'
import HistogramCard from './HistogramCard.vue'

const props = defineProps({
  binCounts: { type: Array, required: true },
  binStartAge: { type: Number, default: 0 },
  binWidthYears: { type: Number, default: 10 },
  medianAge: { type: Number, default: null },
  minAge: { type: Number, default: null },
  maxAge: { type: Number, default: null },
  totalCount: { type: Number, required: true },
})

// One label per bar showing the age range that bin covers (e.g. "0–10").
const xTickLabels = computed(() =>
  props.binCounts.map((_, binIndex) => {
    const binLowerEdge = props.binStartAge + binIndex * props.binWidthYears
    const binUpperEdge = binLowerEdge + props.binWidthYears
    return `${binLowerEdge}–${binUpperEdge}`
  }),
)

const footerItems = computed(() => [
  { label: 'Median', value: String(Math.round(props.medianAge ?? 0)) },
  {
    label: 'Range',
    value: `${Math.round(props.minAge ?? 0)}–${Math.round(props.maxAge ?? 0)}`,
  },
  { label: 'N', value: String(props.totalCount) },
])
</script>
