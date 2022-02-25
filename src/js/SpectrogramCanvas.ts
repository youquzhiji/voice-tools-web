import CanvasController from "@/js/CanvasController";
import * as tf from '@tensorflow/tfjs'
import meyda from 'meyda'

function fft(audio: AudioBuffer)
{
    const input = tf.tensor1d(audio.getChannelData(0))
    const n_fft = 2048
}

export default class SpectrogramCanvas extends CanvasController
{
    /**
     * Draw full audio
     *
     * @param audio Full decoded audio
     * @param audioCtx
     */
    drawAudio(audio: AudioBuffer, audioCtx: AudioContext)
    {
        meyda.sampleRate = 16000
        meyda.bufferSize = 2048
        const d = meyda.extract(['amplitudeSpectrum'], audio.getChannelData(0).subarray(0, 2048))!.amplitudeSpectrum!

        console.log(d)
        const [min, max] = extremes(d)
        const range = max - min

        // this.el.height = this.h = d.length
        const pxLen = d.length / this.h

        console.log(pxLen)

        console.log(min, max)
        const gradient = chroma.scale(['#000',
            '#4F1879', '#B43A78', '#F98766', '#FCFAC0']);

        for (let y = 0; y < this.h; y++)
        {
            const area = d.subarray(y * pxLen, (y + 1) * pxLen)

            this.ctx.beginPath()
            this.ctx.strokeStyle = gradient((mean(area) - min) / range).toString()
            this.ctx.moveTo(0, this.h - y)
            this.ctx.lineTo(this.w, this.h - y)
            this.ctx.stroke()
            this.ctx.closePath()
        }
    }
}