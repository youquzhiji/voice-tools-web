<template>
  <div id="PitchResGraph">
    <BubbleChart class="chart" :chartData="chartData" :options="options"/>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {BubbleChart} from "vue-chart-3";
import {ChartData, ChartOptions, ScaleOptions} from "chart.js";
import {Prop} from "vue-property-decorator";
import {StatsResult} from "@/views/comp/ClassificationResults.vue";

@Options({components: {BubbleChart}})
export default class PitchResGraph extends Vue
{
  @Prop() stats: StatsResult

  scaleOptions: ScaleOptions = {
    position: 'center',
    min: 0,
    max: 1,
    ticks: {
      padding: -15,
      showLabelBackdrop: true,
      count: 5,
      format: {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    },
    grid: {
      drawBorder: false
    }
  }

  options: ChartOptions = {
    maintainAspectRatio: false,
    scales: {
      x: {...this.scaleOptions},
      y: {...this.scaleOptions, ticks: {...this.scaleOptions.ticks, padding: -19}},
    },
    plugins: {
      legend: {
        display: false
      }
    }
  }

  get chartData(): ChartData
  {
    return {
      datasets: [
        {
          data: [
              {x: 0, y: 0, r: 10}
          ]
        }
      ]
    }
  }
}
</script>

<style lang="sass" scoped>
#PitchResGraph
  height: 100%
  background: linear-gradient(45deg, rgba(129, 218, 255, 0.3), white, rgba(255, 190, 200, 0.3))

  .chart
    height: 100%
</style>
