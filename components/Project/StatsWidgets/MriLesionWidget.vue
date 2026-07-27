<template>
  <DonutChartCard
    title="Lesional Status based on Preimplant MRI"
    :segments="segments"
    :center-total="totalPatientCount"
  />
</template>

<script setup>
import DonutChartCard from './DonutChartCard.vue'

// The donut charts only the known-status segments, but the center shows the
// full patient count (known + unknown), so those totals are kept as props.
defineProps({
  segments: { type: Array, required: true },
  totalKnownCount: { type: Number, required: true },
  unknownCount: { type: Number, required: true },
  totalPatientCount: { type: Number, required: true },
})
</script>
