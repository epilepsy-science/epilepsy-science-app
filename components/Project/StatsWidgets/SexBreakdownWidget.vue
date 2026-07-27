<template>
  <DonutChartCard
    title="Distribution of Sex"
    :segments="segments"
    :center-total="totalCount"
  />
</template>

<script setup>
import DonutChartCard from './DonutChartCard.vue'

defineProps({
  segments: { type: Array, required: true },
  totalCount: { type: Number, required: true },
  sourceLabel: { type: String, default: '' },
})
</script>
