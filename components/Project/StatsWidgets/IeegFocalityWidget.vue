<template>
  <DonutChartCard
    title="iEEG-determined Focality"
    :segments="segments"
    :center-total="totalSegmentCount"
  />
</template>

<script setup>
import { computed } from 'vue'
import DonutChartCard from './DonutChartCard.vue'

const props = defineProps({
  segments: { type: Array, required: true },
})

const totalSegmentCount = computed(() =>
  props.segments.reduce((sum, segment) => sum + segment.count, 0),
)
</script>
