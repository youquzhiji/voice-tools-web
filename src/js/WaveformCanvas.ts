import CanvasController from "@/js/CanvasController";

const waveColor = 'pink'

export default class WaveformCanvas extends CanvasController
{
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
            this.ctx.strokeStyle = waveColor
            this.ctx.moveTo(x, hh - aMax * hh)
            this.ctx.lineTo(x, hh - aMin * hh)
            this.ctx.stroke()
        }
    }
}
