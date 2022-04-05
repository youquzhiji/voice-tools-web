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
  // backgroundColor: 'rgba(255,255,255,0.38)',
  borderRadius: 10,
  font: {
    size: 15
  }
}

const gray = 'rgba(136,136,136,0.76)'
const labelMargin = 0.03


@Options({components: {BubbleChart}})
export default class PitchResGraph extends Vue
{
  @Prop() stats: StatsResult



  options: ChartOptions = {
    maintainAspectRatio: false,
    scales: {
      x: {...scaleOptions},
      y: {...scaleOptions, ticks: {...scaleOptions.ticks, padding: -19}},
    },
    plugins: {
      legend: {
        display: false
      },
      annotation: {
        annotations: {
          topRight: {...sharedAnnotationOptions,
            type: 'label',
            xValue: 0.75,
            yValue: 0.75,
            content: ['Feminine', 'Average'],
            color: 'rgba(255,65,65,0.46)',
          },
          bottomLeft: {...sharedAnnotationOptions,
            type: 'label',
            xValue: 0.25,
            yValue: 0.25,
            content: ['Masculine', 'Average'],
            color: 'rgba(75,138,255,0.76)',
          },
          center: {...sharedAnnotationOptions,
            type: 'label',
            xValue: 0.5,
            yValue: 0.5,
            content: ['Androgyny'],
            color: gray,
            backgroundColor: 'white',
          },
          lowPitch: {...sharedAnnotationOptions,
            type: 'label',
            xValue: 0.5,
            yValue: labelMargin,
            content: ['Low Pitch'],
            color: gray
          },
          highPitch: {...sharedAnnotationOptions,
            type: 'label',
            xValue: 0.5,
            yValue: 1 - labelMargin,
            content: ['High Pitch'],
            color: gray
          },
          lowResonance: {...sharedAnnotationOptions,
            type: 'label',
            xValue: labelMargin,
            yValue: 0.5,
            rotation: -90,
            content: ['Dark Resonance'],
            color: gray
          },
          highResonance: {...sharedAnnotationOptions,
            type: 'label',
            xValue: 1 - labelMargin,
            yValue: 0.5,
            rotation: 90,
            content: ['Bright Resonance'],
            color: gray
          },
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
  background: linear-gradient(45deg, rgba(129, 218, 255, 0.4), white, rgba(255, 190, 200, 0.4))

  .chart
    height: 100%
</style>
