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

        // Fix: Allow setting canvas width and height using CSS
        const canvasCss = window.getComputedStyle(canvas)
        this.w = canvas.width = parseInt(canvasCss.width.replace('px', ''))
        this.h = canvas.height = parseInt(canvasCss.height.replace('px', ''))

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
        // Decoded audio data is an array of float that range from -1 to 1
        const data = audio.getChannelData(0)

        // Data points per pixel
        const pxLen = audio.length / this.w
        const hh = this.h / 2

        for (let x = 0; x < this.w; x++)
        {
            // Compute min and max for each pixel region
            const area = data.slice(x * pxLen, (x + 1) * pxLen).sort()
            const aMin = area[0]
            const aMax = area[area.length - 1]

            // Draw line
            this.ctx.moveTo(x, hh - aMax * hh)
            this.ctx.lineTo(x, hh - aMin * hh)
            this.ctx.stroke()
        }
    }
}
