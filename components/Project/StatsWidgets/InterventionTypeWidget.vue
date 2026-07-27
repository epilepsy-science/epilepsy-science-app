<template>
  <div class="intervention-type-widget">
    <h3 class="widget-title">Intervention Type</h3>
    <div v-if="hasData" class="chart-wrap">
      <div class="labels-col">
        <div v-for="row in chartRows" :key="row.label" class="row-label">
          {{ row.label }}
        </div>
      </div>
      <div class="bars-col">
        <div v-for="row in chartRows" :key="row.label" class="bar-row">
          <div class="bar-fill" :style="{ width: `${row.widthPercent}%` }" />
          <span class="bar-value">{{ row.count }}</span>
        </div>
      </div>
      <div class="x-ticks">
        <span
          v-for="tick in xAxisTicks"
          :key="tick.value"
          class="x-tick"
          :style="{ left: `${tick.percent}%` }"
        >{{ tick.value }}</span>
      </div>
      <div class="axis-title">Number of patients (total = {{ totalPatientCount }})</div>
    </div>
    <div v-else class="widget-body-empty">No data</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  categories: { type: Array, required: true },
  totalPatientCount: { type: Number, required: true },
})

const hasData = computed(() => props.categories.length > 0)

const niceMax = computed(() => {
  const rawMax = props.categories.reduce(
    (currentMax, category) => Math.max(currentMax, category.count),
    0,
  )
  if (rawMax === 0) return 1
  return computeNiceMax(rawMax, 4)
})

const xAxisTicks = computed(() => {
  const tickStep = niceMax.value / 4
  const ticks = []
  for (let tickIndex = 0; tickIndex <= 4; tickIndex++) {
    const tickValue = tickStep * tickIndex
    ticks.push({
      value: Math.round(tickValue),
      percent: (tickValue / niceMax.value) * 100,
    })
  }
  return ticks
})

const chartRows = computed(() => {
  if (!hasData.value) return []
  return props.categories.map((category) => ({
    label: category.label,
    count: category.count,
    widthPercent: (category.count / niceMax.value) * 100,
  }))
})

function computeNiceMax(rawMax, desiredTickCount) {
  const rawTickStep = rawMax / desiredTickCount
  const tickStepMagnitude = Math.pow(10, Math.floor(Math.log10(rawTickStep)))
  const normalizedTickStep = rawTickStep / tickStepMagnitude
  let niceNormalizedStep
  if (normalizedTickStep <= 1) niceNormalizedStep = 1
  else if (normalizedTickStep <= 2) niceNormalizedStep = 2
  else if (normalizedTickStep <= 5) niceNormalizedStep = 5
  else niceNormalizedStep = 10
  const niceTickStep = niceNormalizedStep * tickStepMagnitude
  return Math.ceil(rawMax / niceTickStep) * niceTickStep
}
</script>

<style scoped lang="scss">
.intervention-type-widget {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 20px;
  box-sizing: border-box;
  font-family: 'Montserrat', sans-serif;
  color: $neutralGrey;
}

.widget-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  color: $gray_6;
  text-transform: none;
  text-align: left;
  align-self: flex-start;
}

// 4 grid items with explicit placement:
//   labels-col  → col 1, row 1 (stretches to fill row)
//   bars-col    → col 2, row 1 (stretches to fill row, draws L-shaped axes)
//   x-ticks     → col 2, row 2 (auto-sized)
//   axis-title  → col 2, row 3 (auto-sized)
.chart-wrap {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: 1fr auto auto;
}

.labels-col {
  grid-column: 1;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 4px 10px 4px 0;
}

.bars-col {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  border-left: 1.5px solid $gray_5;
  border-bottom: 1.5px solid $gray_5;
  padding: 4px 0;
}

.row-label {
  font-size: 12px;
  font-weight: 500;
  color: $gray_6;
  text-align: right;
  line-height: 1.3;
}

.bar-row {
  display: flex;
  align-items: center;
}

.bar-fill {
  height: 14px;
  background: $es-primary-color;
  border-radius: 2px;
  flex-shrink: 0;
  min-width: 2px;
}

.bar-value {
  margin-left: 6px;
  font-size: 12px;
  font-weight: 600;
  color: $gray_6;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.x-ticks {
  grid-column: 2;
  grid-row: 2;
  position: relative;
  height: 22px;
  margin-top: 2px;
}

.x-tick {
  position: absolute;
  top: 4px;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 500;
  color: $gray_6;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.axis-title {
  grid-column: 2;
  grid-row: 3;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: $gray_6;
  padding-top: 4px;
}

.widget-body-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $neutralGrey;
  font-size: 13px;
}
</style>
