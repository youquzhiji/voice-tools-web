<template>
  <div id="home">
    <div class="usage">
      Welcome to the voice training tool [TODO: 想一个名字]

      <p>Drop an audio file below to start.</p>
    </div>

    <div class="drop-box unselectable" @dragover="(e) => e.preventDefault()" @drop="onDrop">
      <span class="drop-label">Drop Here</span>
    </div>

    <div class="waveform" :style="{visibility: this.audio ? 'unset' : 'hidden'}">
      <canvas ref="canvas"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import {ElMessage} from "element-plus";
import {Vue} from "vue-class-component";
import WaveformCanvas from "@/js/WaveformCanvas";

export default class Home extends Vue
{
  declare $refs: {
    canvas: HTMLCanvasElement
  }

  waveformCanvas!: WaveformCanvas
  audio: AudioBuffer = null as never as AudioBuffer

  mounted()
  {
    console.log('Initializing Canvas...')
    this.waveformCanvas = new WaveformCanvas(this.$refs.canvas)
  }

  async onDrop(e: DragEvent)
  {
    // Prevent default behavior: Opening the file in a browser tab.
    e.preventDefault()

    // Read file data
    if (e.dataTransfer && e.dataTransfer.items)
    {
      // Loop through all files
      for (let i = 0; i < e.dataTransfer.items.length; i++)
      {
        // Check file type
        const item = e.dataTransfer.items[i]
        if (item.kind == 'file')
        {
          const file = item.getAsFile()!

          console.log(`File Dropped: ${file.name}\n` +
              `- LastModified: ${file.lastModified}\n` +
              `- Size: ${file.size}\n` +
              `- Type: ${file.type}`)

          // Read file
          // TODO: If file type is not supported, convert file on backend
          const buf = await file.arrayBuffer()
          this.audio = await new AudioContext().decodeAudioData(buf)

          this.waveformCanvas.drawAudio(this.audio)

          console.log(this.audio)

        } else ElMessage.error(`Error: The item dropped must be a file, not a ${item.kind}`)
      }
    }
  }
}
</script>

<style lang="sass" scoped>
#home
  * + *
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
    height: 150px
    width: 100%
    display: block

    border-radius: 10px
    //box-shadow: 0 2px 12px -2px rgb(0 0 0 / 10%)
    //box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)
</style>
