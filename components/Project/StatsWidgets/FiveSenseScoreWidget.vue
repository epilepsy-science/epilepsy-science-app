<template>
  <div class="five-sense-widget">
    <h3 class="widget-title">Distribution of 5-SENSE Scores</h3>
    <div v-if="hasData" class="histogram-wrap">
      <div class="y-axis-title">Number of patients</div>
      <div class="y-axis-ticks">
        <span
          v-for="tick in yAxisTicks"
          :key="`y-tick-${tick.value}`"
          class="y-tick"
          :style="{ bottom: `${tick.bottomPercent}%` }"
        >{{ tick.value }}</span>
      </div>
      <div class="plot-area">
        <div
          v-for="tick in gridlineTicks"
          :key="`grid-${tick.value}`"
          class="gridline"
          :style="{ bottom: `${tick.bottomPercent}%` }"
        ></div>
        <div class="bars">
          <div
            v-for="(bar, index) in histogramBars"
            :key="`bar-${index}`"
            class="bar-slot"
          >
            <div class="bar" :style="{ height: `${bar.heightPercent}%` }"></div>
          </div>
        </div>
      </div>
      <div class="x-axis-ticks">
        <span
          v-for="(tick, index) in xAxisTicks"
          :key="`x-tick-${index}`"
          class="x-tick"
        ><span class="x-tick-label">{{ tick.label }}</span></span>
      </div>
      <div class="x-axis-title">5-SENSE score</div>
    </div>
    <div v-else class="histogram-wrap-empty">No data</div>
    <div v-if="hasData" class="widget-footer">
      Median <span class="footer-value">{{ medianScoreFormatted }}</span>
      <span class="footer-sep">·</span>
      N <span class="footer-value">{{ totalScoredCount }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  binCounts: { type: Array, required: true },
  medianScore: { type: Number, default: null },
  totalScoredCount: { type: Number, required: true },
  totalPatientCount: { type: Number, required: true },
  scoreMin: { type: Number, default: 0 },
  scoreMax: { type: Number, default: 1 },
})

const hasData = computed(
  () => props.totalScoredCount > 0 && props.binCounts.length > 0,
)

const yAxisNiceMax = computed(() => {
  const rawMax = Math.max(...props.binCounts, 1)
  const step = rawMax <= 10 ? 5 : rawMax <= 25 ? 5 : 10
  return Math.ceil(rawMax / step) * step
})

const yAxisStep = computed(() => (yAxisNiceMax.value <= 10 ? 2 : 5))

const yAxisTicks = computed(() => {
  if (!hasData.value) return []
  const ticks = []
  for (
    let tickValue = yAxisNiceMax.value;
    tickValue >= 0;
    tickValue -= yAxisStep.value
  ) {
    ticks.push({
      value: tickValue,
      bottomPercent: (tickValue / yAxisNiceMax.value) * 100,
    })
  }
  return ticks
})

// Gridlines for every tick above the baseline (the 0 line is the axis itself).
const gridlineTicks = computed(() =>
  yAxisTicks.value.filter((tick) => tick.value > 0),
)

const histogramBars = computed(() => {
  if (!hasData.value) return []
  return props.binCounts.map((countInBin) => ({
    heightPercent: (countInBin / yAxisNiceMax.value) * 100,
  }))
})

// One label per bar, centered beneath it, showing the score range that bin covers
// (e.g. "0.0–0.1").
const xAxisTicks = computed(() => {
  if (!hasData.value) return []
  const binCount = props.binCounts.length
  const scoreRange = props.scoreMax - props.scoreMin
  return props.binCounts.map((countInBin, binIndex) => {
    const lowerEdge = props.scoreMin + (binIndex / binCount) * scoreRange
    const upperEdge = props.scoreMin + ((binIndex + 1) / binCount) * scoreRange
    return {
      label: `${lowerEdge.toFixed(1)}–${upperEdge.toFixed(1)}`,
    }
  })
})

function formatScore(scoreValue) {
  return scoreValue == null ? '–' : scoreValue.toFixed(2)
}

const medianScoreFormatted = computed(() => formatScore(props.medianScore))
</script>

<style scoped lang="scss">
.five-sense-widget {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 20px;
  box-sizing: border-box;
  font-family: 'Montserrat', sans-serif;
  color: $neutralGrey;
}

.widget-title {
  margin: 0 0 18px;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  color: $gray_6;
  text-transform: none;
  text-align: left;
  align-self: flex-start;
}

.histogram-wrap {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: auto auto 1fr;
  grid-template-rows: 1fr auto auto;
  column-gap: 6px;
  row-gap: 4px;
}

.histogram-wrap-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $neutralGrey;
  font-size: 13px;
}

.y-axis-title {
  grid-column: 1;
  grid-row: 1;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $neutralGrey;
  align-self: center;
  justify-self: center;
}

.y-axis-ticks {
  grid-column: 2;
  grid-row: 1;
  position: relative;
  min-width: 22px;
}

.y-tick {
  position: absolute;
  right: 4px;
  transform: translateY(50%);
  font-size: 10px;
  line-height: 1;
  color: $neutralGrey;
  font-variant-numeric: tabular-nums;
}

.plot-area {
  grid-column: 3;
  grid-row: 1;
  position: relative;
  min-width: 0;
  min-height: 0;
  border-left: 1.5px solid $gray_3;
  border-bottom: 1.5px solid $gray_3;
}

.gridline {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: $gray_2;
}

.bars {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
}

.bar-slot {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 3px;
}

.bar {
  width: 100%;
  min-height: 2px;
  background: $es-primary-color;
  border-radius: 5px 5px 0 0;
}

.x-axis-ticks {
  grid-column: 3;
  grid-row: 2;
  display: flex;
  margin-top: -4px;
  height: 52px;
}

.x-tick {
  position: relative;
  flex: 1;
}

.x-tick::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 50%;
  width: 1.5px;
  height: 6px;
  background: $gray_3;
  transform: translateX(-50%);
}

.x-tick-label {
  position: absolute;
  top: 8px;
  right: 50%;
  transform: rotate(-45deg);
  transform-origin: top right;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 600;
  color: $neutralGrey;
  font-variant-numeric: tabular-nums;
}

.x-axis-title {
  grid-column: 3;
  grid-row: 3;
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $neutralGrey;
  margin-top: 2px;
}

.widget-footer {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid $gray_2;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  color: $neutralGrey;
  font-variant-numeric: tabular-nums;
}

.footer-value {
  color: $gray_6;
  font-weight: 700;
}

.footer-sep {
  margin: 0 6px;
  color: $gray_3;
}
</style>
