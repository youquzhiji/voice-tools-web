<template>
  <div id="home" ref="el" class="fbox-v">
    <div class="usage" v-if="!audio">
      Welcome to the voice training tool [TODO: 想一个名字]
    </div>

    <div class="drop-box unselectable shadow" @dragover="(e) => e.preventDefault()" @drop="onDrop" v-if="!audio">
      <span class="drop-label">Drop Here</span>
    </div>

    <div class="results" v-if="audio">
      <Waveform :audio="audio" v-if="audio" />

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
        <Loading v-else></Loading>
      </div>

      <!-- Classification Results -->
      <div class="result-tab card shadow" v-if="activeTab === 2">
        <ClassificationResults v-if="stats" :stats="stats" :ml="ml"/>
        <Loading v-else></Loading>
      </div>

      <!-- Pitch vs Formant -->
      <div class="result-tab card shadow" v-if="activeTab === 3">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {ElMessage} from "element-plus";
import {Options, Vue} from "vue-class-component";
import Spectrogram from "@/views/comp/Spectrogram.vue";
import Loading from "@/views/comp/Loading.vue";
import Waveform from "@/views/comp/Waveform.vue";
import ClassificationResults, {MLFrame, StatsResult} from "@/views/comp/ClassificationResults.vue";
import {decodeFreqArray, decodeNdArray, request, Timer} from "@/js/Utils";
import {getSetting} from "@/js/Setting";
import {melStft} from "@/js/SpectrogramCanvas";

@Options({components: {ClassificationResults, Waveform, Spectrogram, Loading}})
export default class Home extends Vue
{
  // Canvas HTML elements
  declare $refs: {
    el: HTMLElement
  }

  // Audio (null if no audio is provided)
  audio: AudioBuffer = null as never as AudioBuffer
  stats: StatsResult = null as never as StatsResult
  ml: MLFrame[]
  spec: Float32Array[] = null as never as []
  specSr: number
  freqArrays: {[index: string]: Float32Array} = null as never as {}

  activeTab = 1

  // Runs when the user drops an audio file over the drop area
  async onDrop(e: DragEvent)
  {
    // Prevent default behavior: Opening the file in a browser tab.
    e.preventDefault()

    // Check files dropped
    if (!(e.dataTransfer && e.dataTransfer.items)) return
    const len = e.dataTransfer.items.length
    if (len > 1) return ElMessage.error(`Only one file can be analyzed at a time, you dropped ${len}`)

    // Check file type
    const item = e.dataTransfer.items[0]
    if (item.kind != 'file') return ElMessage.error(`Error: The item dropped must be a file, not a ${item.kind}`)

    const timer = new Timer()
    const localSpec = getSetting('spec.local').val

    const file = item.getAsFile()!

    console.log(`File Dropped: ${file.name}\n` +
        `- LastModified: ${file.lastModified}\n` +
        `- Size: ${file.size}\n` +
        `- Type: ${file.type}`)

    // Upload file to be processed
    let res = request(`/process`, {file: file, params: {with_mel_spect: !localSpec}}).then(async it => {
      let json = await it.json()
      this.stats = json.result
      this.ml = json.ml
      if (!localSpec)
      {
        this.specSr = json.spec_sr
        this.spec = decodeNdArray(json.spec.bytes, json.spec.shape)
      }
      this.freqArrays = decodeFreqArray(json.freq_array.bytes, json.freq_array.shape)
      console.log(json)
    })

    // Read file
    const buf = await file.arrayBuffer()
    const ctx = new AudioContext({sampleRate: 16000})
    this.audio = await ctx.decodeAudioData(buf)
    const data = this.audio.getChannelData(0)

    timer.log(`Audio Loaded:\n` +
        `- Sample Rate: ${this.audio.sampleRate} Hz\n` +
        `- Array Length: ${this.audio.length}\n` +
        `- Duration: ${this.audio.duration} sec\n` +
        `- Number of Channels: ${this.audio.numberOfChannels}\n`)

    // Calculate mel spectrogram locally (around 100x slower than tf backend)
    if (localSpec)
    {
      this.spec = await melStft(data, 16000)
      this.specSr = 16000
      timer.log(`Spectrogram - Mel STFT calculation done`)
    }
  }
}
</script>

<style lang="sass" scoped>
@import "src/css/colors"

#home
  margin: 0 20px 0

  > * + *
    margin-top: 20px

  .usage
    color: $color-fg

  .drop-box
    width: 100%
    max-width: 600px
    margin-left: auto
    margin-right: auto
    height: 100px
    border-radius: 25px
    box-sizing: border-box
    background: white

    display: flex
    align-items: center
    justify-content: center

    .drop-label
      color: $color-bg
      font-size: 1.5em

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
