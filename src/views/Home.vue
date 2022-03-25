<template>
  <div id="home" ref="el" class="fbox-v">
    <div class="usage" v-if="!audio">
      Welcome to the voice training tool [TODO: 想一个名字]
    </div>

    <div class="drop-box unselectable" @dragover="(e) => e.preventDefault()" @drop="onDrop" v-if="!audio">
      <span class="drop-label">Drop Here</span>
    </div>

    <div class="results" :style="{visibility: audio ? 'unset' : 'hidden'}">
      <Waveform :audio="audio" v-if="audio" />

      <div class="result-nav unselectable">
        <div class="tab-button" @click="() => activeTab = 1" :class="{sel: activeTab === 1}">
          Spectrogram
        </div>
        <div class="tab-button" @click="() => activeTab = 2" :class="{sel: activeTab === 2}">
          Classification
        </div>
        <div class="tab-button" @click="() => activeTab = 3" :class="{sel: activeTab === 3}">
          Pitch & Formant
        </div>
      </div>

      <!-- Spectrogram View -->
      <div class="result-tab" v-if="activeTab === 1">
<!--        <Spectrogram :audio="audio" v-if="audio" />-->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {ElMessage, TabsPaneContext} from "element-plus";
import {Options, Vue} from "vue-class-component";
import Spectrogram from "@/views/comp/Spectrogram.vue";
import Waveform from "@/views/comp/Waveform.vue";

@Options({components: {Waveform, Spectrogram}})
export default class Home extends Vue
{
  // Canvas HTML elements
  declare $refs: {
    el: HTMLElement
  }

  // Audio (null if no audio is provided)
  audio: AudioBuffer = null as never as AudioBuffer
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

    const file = item.getAsFile()!

    console.log(`File Dropped: ${file.name}\n` +
        `- LastModified: ${file.lastModified}\n` +
        `- Size: ${file.size}\n` +
        `- Type: ${file.type}`)

    // Read file
    // TODO: If file type is not supported, convert file on backend
    const buf = await file.arrayBuffer()
    const ctx = new AudioContext({sampleRate: 16000})
    this.audio = await ctx.decodeAudioData(buf)
    const data = this.audio.getChannelData(0)

    console.log(`Audio Loaded:\n` +
        `- Sample Rate: ${this.audio.sampleRate} Hz\n` +
        `- Array Length: ${this.audio.length}\n` +
        `- Duration: ${this.audio.duration} sec\n` +
        `- Number of Channels: ${this.audio.numberOfChannels}\n`)
    console.log(data)
  }
}
</script>

<style lang="sass" scoped>
#home
  margin: 0 20px 0

  > * + *
    margin-top: 20px

  .drop-box
    width: 100%
    max-width: 600px
    margin-left: auto
    margin-right: auto
    height: 100px
    border: 5px dashed pink
    border-radius: 25px
    box-sizing: border-box

    display: flex
    align-items: center
    justify-content: center

    .drop-label
      color: gray
      font-size: 1.5em

  .results, .result-tab
    display: flex
    flex-direction: column
    flex: 1
    min-height: 0

  $border-color: rgba(95, 55, 38, 0.78)

  .result-tab
    border: 3px solid $border-color
    border-top: none
    margin-top: -1px

  .result-nav
    display: flex
    flex-direction: row
    margin-top: 10px
    justify-content: center
    min-height: 30px

    .tab-button
      padding: 10px
      display: flex
      flex-direction: column
      justify-content: center
      border-top: 3px solid transparent
      border-bottom: 3px solid $border-color

    .tab-button.sel
      border-left: 3px solid $border-color
      border-right: 3px solid $border-color
      border-top: 3px solid $border-color
      border-bottom: 3px solid transparent
      border-radius: 10px 10px 0 0
      background: #fff4eb

  .result-nav::before, .result-nav::after
    content: ''
    flex-grow: 1
    border-bottom: 3px solid $border-color
</style>
