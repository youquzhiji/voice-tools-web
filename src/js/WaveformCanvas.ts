import CanvasController from "@/js/CanvasController";
import {extremes} from "@/js/Utils";

const waveColor = '#fff4eb'

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
            const [min, max] = extremes(data.subarray(x * pxLen, (x + 1) * pxLen))

            // Draw line
            this.ctx.strokeStyle = waveColor
            this.ctx.moveTo(x, hh - max * hh)
            this.ctx.lineTo(x, hh - min * hh)
            this.ctx.stroke()
        }
    }
}
