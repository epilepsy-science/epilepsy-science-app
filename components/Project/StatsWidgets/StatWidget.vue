<template>
  <div class="stat-widget">
    <div class="stat-label">{{ label }}</div>
    <div class="stat-value">{{ value }}</div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
})
</script>

<style scoped lang="scss">
.stat-widget {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
  padding: 8px 20px 16px;
  box-sizing: border-box;
  font-family: 'Montserrat', sans-serif;
  gap: 12px;
}

.stat-label {
  font-size: 13px;
  font-weight: 600;
  color: #333333;
}

.stat-value {
  font-size: 30px;
  font-weight: 600;
  color: $gray_6;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
</style>
