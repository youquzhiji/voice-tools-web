<template>
  <div class="spectrogram f-grow1 fbox-h">
    <canvas ref="spCanvas" style="min-height: 0"></canvas>
    <!--      <div class="x-ticks fbox-vcenter">Time</div>-->
    <div class="y-ticks" v-if="ticks">
      <div class="tick unselectable fbox-h" v-for="t of ticks" :style="{top: `${(1 - t[1]) * 100}%`}">
        <div class="tick-line"></div> {{numberFormat.format(t[0])}}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {Ticks} from "@/js/scales/Scales";
import SpectrogramCanvas from "@/js/SpectrogramCanvas";
import {Prop} from "vue-property-decorator";

@Options({components: {}})
export default class Spectrogram extends Vue {
  declare $refs: {
    spCanvas: HTMLCanvasElement
  }

  @Prop() audio!: AudioBuffer
  spectrogramCanvas!: SpectrogramCanvas

  numberFormat = Intl.NumberFormat('en-US', {notation: "compact", maximumFractionDigits: 1})
  ticks: Ticks = null as never as Ticks

  mounted()
  {
    console.log('Spectrogram mounting...')
    this.spectrogramCanvas = new SpectrogramCanvas(this.$refs.spCanvas)
    this.spectrogramCanvas.drawAudio(this.audio).then(it => this.ticks = it)
    console.log('Spectrogram mounted!')
  }
}
</script>

<style lang="sass" scoped>
canvas
  height: 100%
  width: 100%

.x-ticks
  width: 100%
  background: #232323
  color: lightgray
  height: 30px
  position: relative

.y-ticks
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
    align-items: center

    .tick-line
      width: 4px
      height: 1px
      background-color: lightgray
      margin-right: 2px
</style>
