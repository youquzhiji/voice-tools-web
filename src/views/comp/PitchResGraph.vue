<template>
  <div id="PitchResGraph">
    <BubbleChart class="chart" :chartData="chartData" :options="options"/>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {BubbleChart} from "vue-chart-3";
import {ChartData, ChartOptions} from "chart.js";
import {Prop} from "vue-property-decorator";
import {StatsResult} from "@/views/comp/ClassificationResults.vue";

@Options({components: {BubbleChart}})
export default class PitchResGraph extends Vue
{
  @Prop() stats: StatsResult

  options: ChartOptions = {
    maintainAspectRatio: false,
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

  .chart
    height: 100%
</style>
