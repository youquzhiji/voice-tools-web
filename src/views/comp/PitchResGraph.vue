<template>
  <div id="PitchResGraph">
    <BubbleChart class="chart" :chartData="chartData" :options="options"/>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {BubbleChart} from "vue-chart-3";
import {Chart, ChartData, ChartOptions, ScaleOptions} from "chart.js";
import {Prop} from "vue-property-decorator";
import {StatsResult} from "@/views/comp/ClassificationResults.vue";


const scaleOptions: ScaleOptions = {
  position: 'center',
  min: 0,
  max: 1,
  ticks: {
    padding: -15,
    showLabelBackdrop: true,
    count: 5,
    callback: (value: number, i, ticks) => value.toFixed(2)
  },
  grid: {
    drawBorder: false
  }
}

const sharedAnnotationOptions = {
  backgroundColor: 'rgba(255,255,255,0.38)',
  borderRadius: 10,
  font: {
    size: 15
  }
}


@Options({components: {BubbleChart}})
export default class PitchResGraph extends Vue
{
  @Prop() stats: StatsResult



  options: ChartOptions = {
    maintainAspectRatio: false,
    scales: {
      x: {...scaleOptions,
        // title: {
        //   display: true,
        //   text: 'Hello',
        //   align: 'center',
        //   color: 'white',
        //   font: Chart.defaults.font,
        //   padding: 4
        // }
      },
      y: {...scaleOptions, ticks: {...scaleOptions.ticks, padding: -19}},
    },
    plugins: {
      legend: {
        display: false
      },
      annotation: {
        annotations: {
          topLeft: {...sharedAnnotationOptions,
            type: 'label',
            xValue: 0.25,
            yValue: 0.75,
            content: ['Unnatural'],
            color: 'rgba(255,148,8,0.76)',
          },
          topRight: {...sharedAnnotationOptions,
            type: 'label',
            xValue: 0.75,
            yValue: 0.75,
            content: ['Feminine'],
            color: 'rgba(255,65,65,0.46)',
          },
          bottomRight: {...sharedAnnotationOptions,
            type: 'label',
            xValue: 0.75,
            yValue: 0.25,
            content: ['Unnatural'],
            color: 'rgba(255,148,8,0.76)',
          },
          bottomLeft: {...sharedAnnotationOptions,
            type: 'label',
            xValue: 0.25,
            yValue: 0.25,
            content: ['Masculine'],
            color: 'rgba(75,138,255,0.76)',
          }
        }
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
