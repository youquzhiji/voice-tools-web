<template>
  <div class="spectrogram f-grow1 fbox-h">
    <div class="canvas-wrapper">
      <canvas ref="spCanvas" @wheel.prevent="wheel" :style="{transform: `translateX(${-scrollLocation}px) scaleX(${widthScale})`}"/>
    </div>

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
import {Timer} from "@/js/Utils";

@Options({components: {}})
export default class Spectrogram extends Vue {
  declare $refs: {
    spCanvas: HTMLCanvasElement
  }

  @Prop() spec: Float32Array[]
  @Prop() sr: number
  @Prop() freqArrays: {[index: string]: Float32Array}

  spectrogramCanvas: SpectrogramCanvas

  numberFormat = Intl.NumberFormat('en-US', {notation: "compact", maximumFractionDigits: 1})
  ticks: Ticks = null as never as Ticks

  // Zoom variables
  widthScale = 1.0
  scrollLocation = 0
  minWidthScale = 1

  async mounted()
  {
    const timer = new Timer()
    timer.log(`Spectrogram mounting... ${this.spec.length} * ${this.spec[0].length}, sr=${this.sr}`)
    this.spectrogramCanvas = new SpectrogramCanvas(this.$refs.spCanvas)
    await this.spectrogramCanvas.drawData(this.spec, this.sr).then(it => this.ticks = it)
    timer.log('Data draw complete')

    if (this.freqArrays)
    {
      console.log('Frequency overlays updating')
      await this.spectrogramCanvas.drawLine(this.freqArrays['pitch'], 0.032, '#64fbff', 3)
      await this.spectrogramCanvas.drawLine(this.freqArrays['f1'], 0.032, '#7bff4f', 2)
      await this.spectrogramCanvas.drawLine(this.freqArrays['f2'], 0.032, '#93ffb9', 2)
      await this.spectrogramCanvas.drawLine(this.freqArrays['f3'], 0.032, '#4ffff9', 1)
      timer.log('Lines drawn')
    }

    // Fix: If the image is smaller than the screen, scrolling will break
    const wt = this.$refs.spCanvas.getBoundingClientRect().width
    const wp = this.$refs.spCanvas.parentElement.getBoundingClientRect().width
    if (wt * this.widthScale < wp) {
      this.widthScale = wp / wt
      this.minWidthScale = this.widthScale
    }

    // Register touch listeners
    document.addEventListener('touchstart', this.onTouchStart)
    document.addEventListener('touchmove', this.onTouchMove)
    document.addEventListener('touchend', this.onTouchEnd)

    timer.log('Spectrogram mounted!')
  }

  unmounted()
  {
    // Unregister touch listeners
    document.removeEventListener('touchstart', this.onTouchStart)
    document.removeEventListener('touchmove', this.onTouchMove)
    document.removeEventListener('touchend', this.onTouchEnd)
  }

  lastTouchX = -1

  onTouchStart(e: TouchEvent)
  {
    if (e.touches.length != 1) return
    this.lastTouchX = e.touches[0].clientX
  }

  onTouchMove(e: TouchEvent)
  {
    if (this.lastTouchX == -1) return
    this.scroll(this.lastTouchX - e.touches[0].clientX)
    this.lastTouchX = e.touches[0].clientX
  }

  onTouchEnd(e: TouchEvent)
  {
    this.lastTouchX = -1
  }

  get width()
  {
    return this.$refs.spCanvas.width
  }

  /**
   * Mouse wheel event listener
   * @param e Event
   */
  wheel(e: WheelEvent)
  {
    const lastWidthScale = this.widthScale
    const el = this.$refs.spCanvas
    const rect = el.getBoundingClientRect()

    let direction = (e.detail < 0 || e.deltaY > 0) ? 1 : -1;

    // Shift to micro-adjust
    if (e.shiftKey) direction /= 10

    // Alt to zoom
    if (e.ctrlKey) this.widthScale -= direction / 2

    // Scroll
    else this.scroll(direction * 20)

    // TODO: Fix the problem where if you zoom in at the border, then scroll to the very border,
    //  then zoom out, it might appear out-of-bounds

    // Normalize
    this.widthScale = Math.max(this.minWidthScale, this.widthScale)

    // If zooming changed, adjust image position according to mouse location after zooming
    if (lastWidthScale != this.widthScale)
    {
      // Since zooming is anchored at the center, we need to adjust scroll location as well to
      // make it seems like anchored at the mouse
      const dc = e.clientX - (rect.left + rect.width / 2)
      const offset = dc / lastWidthScale * this.widthScale - dc
      this.scrollLocation += offset
    }
  }

  scroll(delta: number)
  {
    const el = this.$refs.spCanvas
    const rect = el.getBoundingClientRect()
    const pRect = el.parentElement.getBoundingClientRect()

    // Normalize left margin
    if (delta < 0) delta = Math.max(delta, rect.left - pRect.left)

    // Normalize right margin
    else delta = Math.min(delta, rect.right - pRect.right)

    // Do scroll
    this.scrollLocation += delta
  }
}
</script>

<style lang="sass" scoped>
.spectrogram
  background: #232323
  color: lightgray
  overflow: hidden

canvas
  height: 100%
  //min-width: 0
  min-height: 0

.canvas-wrapper
  width: calc(100% - 30px)

.x-ticks
  width: 100%
  height: 30px
  position: relative

.y-ticks
  position: relative
  min-width: 30px
  background: #232323cc

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
