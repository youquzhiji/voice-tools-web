<template>
  <div id="ClassificationResults">
    <div class="title">Full Audio Statistics</div>

    <div class="features-bar">
      <div class="feature" v-for="f in Object.keys(result.fem_prob)">
        <div class="description">
          <span class="name">{{featureDescriptions[f].split(' - ')[0]}}</span>
          <span class="desc"> {{featureDescriptions[f].split(' - ')[1]}}</span>
        </div>
        <div class="classification-bar">
          <span class="f fbox-vcenter" :style="{width: `${(result.fem_prob[f] * 100).toFixed(0)}%`}">
            <span class="percentage-sub" :class="{right: result.fem_prob[f] < 0.5}">
              {{(result.fem_prob[f] * 100).toFixed(0)}}%
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {Prop} from "vue-property-decorator";

const featureDescriptions = {
  pitch: 'Pitch / F0 - Whether the voice sounds high or low.',
  f1: 'Formant F1 - Associated with the vocal area closer to the throat or spine.',
  f2: 'Formant F2 - Controlled by the tongue.',
  f3: 'Formant F3 - Unknown?',
  tilt: 'Spectral Tilt - Whether the voice sounds breathy or creaky.'
}

export interface Features
{
  pitch: number
  f1: number
  f2: number
  f3: number
  tilt: number
}

export interface ReturnedResult
{
  means: Features
  fem_prob: Features
}

@Options({components: {}})
export default class ClassificationResults extends Vue
{
  // TODO: Make this a prop
  result: ReturnedResult = {"means":{"pitch":218.81602478027344,"f1":634.3199462890625,"f2":1674.405517578125,"f3":2776.802978515625,"tilt":-0.6110478095823069},"fem_prob":{"pitch":0.9987228978848673,"f1":0.8214972602795243,"f2":0.3889807432291857,"f3":0.7679765820031421,"tilt":0.9999999640234953}}
  featureDescriptions = featureDescriptions

  @Prop() audio!: AudioBuffer
}
</script>

<style lang="sass" scoped>
@import "src/css/colors"

.title
  margin: 20px
  font-size: 1.2em

.features-bar
  margin: 0 20px
  text-align: left

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

</style>
