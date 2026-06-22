<script setup lang="ts">
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

defineProps<{
  option: EChartsOption
  height?: string
}>()
</script>

<template>
  <v-chart
    class="chart"
    :option="option"
    autoresize
    :style="{ height: height ?? '320px' }"
  />
</template>

<style scoped>
.chart {
  width: 100%;
}
</style>
