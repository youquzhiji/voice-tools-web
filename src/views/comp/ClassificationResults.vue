<template>
  <div id="ClassificationResults">
    <div class="title">Full Audio Statistics</div>

    <div class="features-bar">
      <div class="feature" :class="f" v-for="f in ['pitch', 'f1', 'f2', 'f3', 'tilt']" ref="feature">
        <div class="description">
          <span class="name">{{featureDescriptions[f].split(' - ')[0]}}</span>
          <span class="desc"> {{featureDescriptions[f].split(' - ')[1]}}</span>
        </div>
        <div class="classification-bar unselectable clickable" @click="updateAccordion(f)">
          <span class="f fbox-vcenter" :style="{width: `${(stats.fem_prob[f] * 100).toFixed(0)}%`}">
            <span class="percentage-sub" :class="{right: stats.fem_prob[f] < 0.5}">
              {{ (stats.fem_prob[f] * 100).toFixed(0) }}%
            </span>
          </span>
        </div>
        <div class="chart-wrapper">
          <ScatterChart :height="200" :chartData="getCurveData(f)" :options="getOptions(f)" style="min-height: 200px"/>
        </div>
      </div>
    </div>

    <div class="title">Machine Learning Classification</div>

    <div class="feature">
      <div class="description">
        <span class="name">Machine Learning</span>
        <span class="desc">How your voice might sound like to a robot.</span>
      </div>
      <div class="classification-bar ml-bar">
        <div class="frame" v-for="frame of ml" :style="{width: `${(frame[2] - frame[1]) / totalTime * 100}%`, background: getColor(frame)}"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {Prop} from "vue-property-decorator";
import curves from '@/data/vox1_kde_curves.json';
import {DoughnutChart, LineChart, ScatterChart, useDoughnutChart} from "vue-chart-3";
import {Chart, ChartData, ChartOptions, registerables, Plugin} from "chart.js";

const featureDescriptions = {
  pitch: 'Pitch / F0 - Whether the voice sounds high or low.',
  f1: 'Formant F1 - Associated with the vocal area closer to the throat or spine.',
  f2: 'Formant F2 - Controlled by the tongue.',
  f3: 'Formant F3 - Unknown?',
  tilt: 'Spectral Tilt - Whether the voice sounds breathy or creaky.'
}

// export type FeatureLiteral = 'pitch' | 'f1' | 'f2' | 'f3' | 'tilt'
export type FeatureLiteral = string

export interface Features
{
  pitch: number
  f1: number
  f2: number
  f3: number
  tilt: number
}

export interface StatsResult
{
  means: Features
  fem_prob: Features
}

export type MLLabel = 'speech' | 'music' | 'noise' | 'male' | 'female' | 'noEnergy'
export type MLFrame = [MLLabel, number, number, number | null]

@Options({components: {ScatterChart, DoughnutChart}})
export default class ClassificationResults extends Vue
{
  featureDescriptions = featureDescriptions

  // stats: StatsResult = {"means":{"pitch":218.81602478027344,"f1":634.3199462890625,"f2":1674.405517578125,"f3":2776.802978515625,"tilt":-0.6110478095823069},"fem_prob":{"pitch":0.9987228978848673,"f1":0.8214972602795243,"f2":0.3889807432291857,"f3":0.7679765820031421,"tilt":0.9999999640234953}}
  // ml: MLFrame[] = [["noEnergy",0,1.34,null],["female",1.34,1.94,0.7218596935272217],["noEnergy",1.94,2.48,null],["female",2.48,9.26,0.9072773456573486],["noEnergy",9.26,9.68,null],["female",9.68,17.3,0.933173656463623],["noEnergy",17.3,17.72,null],["female",17.72,19.56,0.4570167064666748],["noEnergy",19.56,20.18,null],["female",20.18,21.12,0.7143616080284119],["noEnergy",21.12,22.06,null],["female",22.06,24.44,0.5491729974746704],["noEnergy",24.44,25.34,null],["female",25.34,32.44,0.8829120397567749],["noEnergy",32.44,33.26,null],["female",33.26,35.2,0.8911810517311096],["noEnergy",35.2,36.2,null],["female",36.2,61.58,0.861036479473114],["noEnergy",61.58,63.74,null],["female",63.74,64.44,0.979472815990448],["male",64.44,65.66,0.8717442750930786],["noEnergy",65.66,66.16,null],["female",66.16,68.08,0.7185679078102112],["noEnergy",68.08,69.08,null],["female",69.08,69.84,0.6705546975135803],["noEnergy",69.84,70.06,null]]
  @Prop() stats: StatsResult
  @Prop() ml: MLFrame[]

  @Prop() audio!: AudioBuffer

  mounted()
  {
    $(`.feature`).accordion({collapsible: true, header: '.classification-bar', heightStyle: 'content',
      active: false, animate: {easing: 'swing', duration: 500}})
  }

  get totalTime(): number
  {
    return this.ml[this.ml.length - 1][2]
  }

  getColor(frame: MLFrame): string
  {
    const alpha = frame[3] ? frame[3] : 0
    switch (frame[0])
    {
      case "female": return `rgba(255,190,200,${alpha})`
      case "male": return `rgba(129,218,255,${alpha})`
      default: return ``
    }
  }

  updateAccordion(feature: FeatureLiteral)
  {
    $(`.feature:not(.${feature})`).accordion({active: false})
  }

  getOptions(feature: FeatureLiteral)
  {
    const chartOptions: ChartOptions = {
      scales: {
        y: {
          ticks: {
            display: false
          }
        },
      },
      plugins: {
        annotation: {
          drawTime: 'afterDatasetsDraw',
          annotations: {
            you: {
              type: 'line',
              xMin: this.stats.means[feature],
              xMax: this.stats.means[feature],
              borderColor: 'rgba(106,100,100,0.47)',
              borderWidth: 2,
              label: {
                enabled: true,
                position: 'start',
                content: "You're Here",
                color: '#ffe3be',
                backgroundColor: 'rgba(106,100,100,0.8)'
              }
            }
          }
        }
      }
    }
    return chartOptions
  }

  getCurveData(feature: FeatureLiteral)
  {
    const d = curves[feature]
    const data: ChartData = {
      datasets: [
        {
          label: 'Masculine Range',
          data: d.m[0].map((val, i) => { return {x: val, y: d.m[1][i]}}),
          borderColor: '#81daff',
          pointRadius: 0,
          showLine: true,
          fill: 'origin',
          backgroundColor: 'rgba(129,218,255,0.5)',
        },
        {
          label: 'Feminine Range',
          data: d.f[0].map((val, i) => { return {x: val, y: d.f[1][i]}}),
          borderColor: '#ffbec8',
          pointRadius: 0,
          showLine: true,
          fill: 'origin',
          backgroundColor: 'rgba(255,190,200,0.5)',
        }
      ]
    }
    return data
  }
}
</script>

<style lang="sass" scoped>
@import "src/css/colors"

.title
  margin: 20px
  font-size: 1.2em

.feature
  text-align: left
  margin: 0 20px

  .description
    margin-left: 10px

    .desc
      font-size: 0.9em
      color: gray
      margin-left: 8px

  .classification-bar
    height: 30px
    background: $color-trans-blue
    border-radius: 10px
    margin-bottom: 10px
    overflow: hidden

    .f
      background: $color-trans-pink
      height: 100%
      border-radius: 10px
      align-items: end

      border-right: 5px solid white
      border-top: 5px solid white
      border-bottom: 5px solid white
      margin-top: -5px

      .percentage-sub
        margin-right: 10px
        font-size: 12px
        color: white
        font-weight: bold

      .percentage-sub.right
        margin-right: -40px


.classification-bar.ml-bar
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==)
  background-repeat: repeat

  .frame
    height: 100%
    display: inline-block
</style>
