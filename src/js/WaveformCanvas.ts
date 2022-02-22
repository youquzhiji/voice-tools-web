export default class WaveformCanvas
{
    el: HTMLCanvasElement
    ctx: CanvasRenderingContext2D

    w: number
    h: number

    constructor(canvas: HTMLCanvasElement)
    {
        this.el = canvas
        this.ctx = canvas.getContext("2d")!

        this.w = canvas.width
        this.h = canvas.height

        this.drawGrid()
    }

    drawGrid()
    {
        this.ctx.moveTo(0, this.h / 2)
        this.ctx.lineTo(this.w, this.h / 2)
        this.ctx.stroke()
    }

    /**
     * Draw full audio
     *
     * @param audio Full decoded audio
     */
    drawAudio(audio: AudioBuffer)
    {
        const data = audio.getChannelData(0)

        const sorted = data.slice().sort()
        const min = sorted[0]
        const max = sorted[sorted.length - 1]

        // Data points per pixel
        const pxLen = audio.length / this.w

        // Decoded audio data range from -1 to 1
        console.log(min, max)

        for (let x = 0; x < this.w; x++)
        {
            const area = data.slice(x * pxLen, (x + 1) * pxLen).sort()
            const aMin = area[0]
            const aMax = area[area.length - 1]

            const hh = this.h / 2

            this.ctx.moveTo(x, hh - aMax * hh)
            this.ctx.lineTo(x, hh)
            this.ctx.stroke()
            this.ctx.moveTo(x, hh - aMin * hh)
            this.ctx.lineTo(x, hh)
            this.ctx.stroke()
        }
    }
}
