<template>
  <HistogramCard
    title="Distribution of 5-SENSE Scores"
    :bin-counts="binCounts"
    :x-tick-labels="xTickLabels"
    x-axis-title="5-SENSE score"
    rotate-x-labels
    :footer-items="footerItems"
  />
</template>

<script setup>
import { computed } from 'vue'
import HistogramCard from './HistogramCard.vue'

const props = defineProps({
  binCounts: { type: Array, required: true },
  medianScore: { type: Number, default: null },
  totalScoredCount: { type: Number, required: true },
  totalPatientCount: { type: Number, required: true },
  scoreMin: { type: Number, default: 0 },
  scoreMax: { type: Number, default: 1 },
})

// One label per bar showing the score range that bin covers (e.g. "0.0–0.1").
const xTickLabels = computed(() => {
  const binCount = props.binCounts.length
  const scoreRange = props.scoreMax - props.scoreMin
  return props.binCounts.map((_, binIndex) => {
    const lowerEdge = props.scoreMin + (binIndex / binCount) * scoreRange
    const upperEdge = props.scoreMin + ((binIndex + 1) / binCount) * scoreRange
    return `${lowerEdge.toFixed(1)}–${upperEdge.toFixed(1)}`
  })
})

const footerItems = computed(() => [
  {
    label: 'Median',
    value: props.medianScore == null ? '–' : props.medianScore.toFixed(2),
  },
  { label: 'N', value: String(props.totalScoredCount) },
])
</script>
