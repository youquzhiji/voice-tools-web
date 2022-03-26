<template>
  <div class="waveform">
    <canvas ref="wfCanvas"></canvas>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import WaveformCanvas from "@/js/WaveformCanvas";
import {Prop} from "vue-property-decorator";

@Options({components: {}})
export default class Waveform extends Vue
{
  declare $refs: {
    wfCanvas: HTMLCanvasElement
  }

  @Prop() audio!: AudioBuffer
  waveformCanvas!: WaveformCanvas

  mounted()
  {
    this.waveformCanvas = new WaveformCanvas(this.$refs.wfCanvas)
    this.waveformCanvas.drawAudio(this.audio)
  }
}
</script>

<style lang="sass" scoped>
canvas
  height: 50px
  width: 100%
  display: block
</style>
