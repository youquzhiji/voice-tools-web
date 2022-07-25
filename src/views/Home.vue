<template>
  <div id="home" ref="el" class="fbox-v">
    <div class="usage" v-if="!audio">
      Welcome to the voice analysis tool!
      <br>
      Drop or record an audio to analyze.
    </div>

    <div class="drop-box unselectable shadow" @dragover="(e) => e.preventDefault()" @drop="onDrop" v-if="!audio">
      <span class="drop-label" v-if="!dropped">Drop Here</span>
      <Loading v-else></Loading>
    </div>

    <div class="drop-box unselectable shadow record clickable" @click="btnRecord" v-if="!audio && recorderCompatible">
      <span class="drop-label" v-if="!recorder">Record</span>
      <span class="drop-label" v-else>Stop Recording</span>
    </div>
  </div>
</template>

<script lang="ts">
import {ElMessage} from "element-plus";
import {Options, Vue} from "vue-class-component";
import Loading from "@/views/comp/Loading.vue";
import {request, Timer} from "@/js/Utils";

@Options({components: {Loading}})
export default class Home extends Vue
{
  // Canvas HTML elements
  declare $refs: {
    el: HTMLElement
  }

  dropped = false

  // Audio (null if no audio is provided)
  audio: AudioBuffer = null

  // Recording
  recorderCompatible = navigator.mediaDevices
  recorder: MediaRecorder = null
  recordChunks = []

  async loadFile(file: File)
  {
    const timer = new Timer()

    console.log(`File Dropped: ${file.name}\n` +
        `- LastModified: ${file.lastModified}\n` +
        `- Size: ${file.size}\n` +
        `- Type: ${file.type}`)

    // Upload file to be processed
    let res = request(`/process`, {file: file}).then(async it => {
      // TODO
      alert("TODO")
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
  }

  /**
   * Runs when the user drops an audio file over the drop area
   */
  async onDrop(e: DragEvent)
  {
    // Prevent default behavior: Opening the file in a browser tab.
    e.preventDefault()
    this.dropped = true

    // Check files dropped
    if (!(e.dataTransfer && e.dataTransfer.items)) return
    const len = e.dataTransfer.items.length
    if (len > 1) return ElMessage.error(`Only one file can be analyzed at a time, you dropped ${len}`)

    // Check file type
    const item = e.dataTransfer.items[0]
    if (item.kind != 'file') return ElMessage.error(`Error: The item dropped must be a file, not a ${item.kind}`)

    await this.loadFile(item.getAsFile())
  }

  /**
   * Click record
   */
  async btnRecord()
  {
    // Already recording, stop recording
    if (this.recorder)
    {
      this.recorder.stop()
      this.recorder = null
      return
    }

    // Start recording
    const stream = await navigator.mediaDevices.getUserMedia({audio: {sampleRate: 16000, channelCount: 1}})
    this.recorder = new MediaRecorder(stream, {mimeType: 'audio/webm;codecs=opus'})

    // Add data to the recording
    this.recorder.addEventListener("dataavailable", e => {
      this.recordChunks.push(e.data)
    })

    // After finish, load as file
    this.recorder.addEventListener("stop", () => {
      const audioBlob = new Blob(this.recordChunks, {type: 'audio/webm;codecs=opus'})
      this.loadFile(new File([audioBlob], 'recorded-audio.webm'))
    })
    this.recorder.start()
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
    height: 200px
    border-radius: 25px
    box-sizing: border-box
    background: white
    overflow: hidden

    display: flex
    align-items: center
    justify-content: center

    .drop-label
      color: $color-bg
      font-size: 1.5em

  .drop-box.record
    height: 100px

</style>
