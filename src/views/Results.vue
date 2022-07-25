<template>
  <div class="results">
<!--    <Waveform :audio="audio" v-if="audio" />-->

    <div class="result-nav unselectable anim">
      <div class="tab-button spectrogram" @click="() => activeTab = 1" :class="{sel: activeTab === 1}">
        Spectrogram
      </div>
      <div class="tab-button" @click="() => activeTab = 2" :class="{sel: activeTab === 2}">
        Classification
      </div>
      <div class="tab-button" @click="() => activeTab = 3" :class="{sel: activeTab === 3}">
        Position
      </div>
    </div>

    <!-- Spectrogram View -->
    <div class="result-tab card shadow" :style="activeTab === 1 ? {} : {display: 'none'}">
      <Spectrogram v-if="spec" :spec="spec" :sr="specSr" :freq-arrays="freqArrays"/>
      <Loading v-else />
    </div>

    <!-- Classification Results -->
    <div class="result-tab card shadow" v-if="activeTab === 2">
      <ClassificationResults v-if="stats" :stats="stats" :ml="ml" :audio-duration="audioDuration"/>
      <Loading v-else />
    </div>

    <!-- Pitch vs Formant -->
    <div class="result-tab card shadow" v-if="activeTab === 3">
      <PitchResGraph v-if="stats" :stats="stats" />
      <Loading v-else />
    </div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import Spectrogram from "@/views/comp/Spectrogram.vue";
import Waveform from "@/views/comp/Waveform.vue";
import PitchResGraph from "@/views/comp/PitchResGraph.vue";
import ClassificationResults, {MLFrame, StatsResult} from "@/views/comp/ClassificationResults.vue";
import Loading from '@/views/comp/Loading.vue';
import {decodeBdictResult, request} from "@/js/Utils";
import { Prop } from 'vue-property-decorator';

@Options({components: {PitchResGraph, ClassificationResults, Waveform, Spectrogram, Loading}})
export default class Results extends Vue
{
  @Prop({required: true}) uuid!: string

  activeTab = 1

  stats: StatsResult = null
  ml: MLFrame[]
  spec: Float32Array[] = null
  specSr: number
  freqArrays: {[index: string]: Float32Array} = null
  audioDuration: number

  created()
  {
    console.log('Viewing results for', this.uuid)
    request('/results', {params: {uuid: this.uuid}}).then(async it =>
    {
      let obj = await decodeBdictResult(await it.arrayBuffer())
      this.stats = obj.result
      this.ml = obj.ml
      this.specSr = obj.spec_sr
      this.spec = obj.spec
      this.freqArrays = obj.freqArrays
      this.audioDuration = obj.audio_dur
      console.log(obj)
    })
  }
}
</script>

<style lang="sass" scoped>
@import "src/css/colors"

.results
  margin: 0 20px 0

.results, .result-tab
  display: flex
  flex-direction: column
  flex: 1
  min-height: 0

// Tab content
.result-tab
  border-top: none
  margin-top: -1px
  overflow-x: hidden

  // Card effect
  margin-bottom: 20px
  z-index: 2

.result-nav
  display: flex
  flex-direction: row
  margin-top: 20px
  justify-content: center
  min-height: 40px
  color: $color-text-main

  .tab-button
    padding: 5px 10px
    display: flex
    flex-direction: column
    justify-content: center
    border-radius: 10px 10px 0 0
    background: lighten(#fff4eb, 1)
    margin: 0 10px
    min-width: 115px

  .tab-button.sel
    border-radius: 10px 10px 0 0
    min-height: 30px
    margin-top: -10px
    background: white
    color: #7c7c7c

    // Show shadow without the bottom side
    box-shadow: 0 2px 12px -2px rgb(0 0 0 / 10%)
    clip-path: inset(-5px -5px 0 -5px)
    z-index: 3

  .tab-button.spectrogram
    background: #232323
    color: #c9c9c9

.result-nav::before, .result-nav::after
  content: ''
  flex-grow: 1
</style>
