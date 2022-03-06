<template>
  <div id="home" ref="el" class="fbox-v">
    <div class="usage">
      Welcome to the voice training tool [TODO: 想一个名字]
    </div>

    <div class="drop-box unselectable" @dragover="(e) => e.preventDefault()" @drop="onDrop" v-if="!audio">
      <span class="drop-label">Drop Here</span>
    </div>

    <div class="waveform" :style="{visibility: audio ? 'unset' : 'hidden'}">
      <canvas ref="wfCanvas"></canvas>
    </div>

    <div class="spectrogram f-grow1 fbox-h" :style="{visibility: audio ? 'unset' : 'hidden'}">
      <canvas ref="spCanvas" style="min-height: 0"></canvas>
<!--      <div class="x-ticks fbox-vcenter">Time</div>-->
      <div class="y-ticks" v-if="ticks">
        <div class="tick unselectable fbox-h fcenter" v-for="t of ticks" :style="{top: `${(1 - t[1]) * 100}%`}">
          <div class="tick-line"></div> {{numberFormat.format(t[0])}}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {ElMessage} from "element-plus";
import {Vue} from "vue-class-component";
import WaveformCanvas from "@/js/WaveformCanvas";
import SpectrogramCanvas from "@/js/SpectrogramCanvas";
import {Ticks} from "@/js/scales/Scales";

export default class Home extends Vue
{
  // Canvas HTML elements
  declare $refs: {
    el: HTMLElement
    wfCanvas: HTMLCanvasElement
    spCanvas: HTMLCanvasElement
  }

  // Canvas controllers
  waveformCanvas!: WaveformCanvas
  spectrogramCanvas!: SpectrogramCanvas

  // Audio (null if no audio is provided)
  audio: AudioBuffer = null as never as AudioBuffer
  ticks: Ticks = null as never as Ticks

  numberFormat = Intl.NumberFormat('en-US', {notation: "compact", maximumFractionDigits: 1})

  // Vue Lifecycle hook that runs after mount
  mounted()
  {
    // Initialize canvas
    this.waveformCanvas = new WaveformCanvas(this.$refs.wfCanvas)
    this.spectrogramCanvas = new SpectrogramCanvas(this.$refs.spCanvas)
  }

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

    this.waveformCanvas.drawAudio(this.audio)
    await this.spectrogramCanvas.drawAudio(this.audio)
  }
}
</script>

<style lang="sass" scoped>
#home
  width: 100%
  max-width: 600px
  margin: auto

  > * + *
    margin-top: 20px

  .drop-box
    width: 100%
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

  canvas
    height: 50px
    width: 100%
    display: block
    //box-shadow: 0 2px 12px -2px rgb(0 0 0 / 10%)
    //box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)

  .spectrogram > canvas
    height: 100%

  .x-ticks
    width: 100%
    background: #232323
    color: lightgray
    height: 30px
    position: relative

  .y-ticks
    margin-top: 1px
    background: #232323
    color: lightgray
    position: relative
    width: 30px

    font-size: 10px
    text-align: left
    overflow-y: hidden

    .tick
      position: absolute
      white-space: nowrap
      overflow: hidden
      margin-top: -6px

      .tick-line
        width: 4px
        height: 1px
        background-color: lightgray
        margin-right: 2px
</style>
