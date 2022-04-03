import CanvasController from "@/js/CanvasController";
import * as tf from '@tensorflow/tfjs'
import chroma from "chroma-js";
import {extremes, Gradient, mean, Timer} from "@/js/Utils";
import {hzToMel, melWeight, ticksMel2} from "@/js/scales/Scales";


export async function melStft(data: Float32Array, sr: number, hopLen: number = 512, winLen: number = 2048)
{
    const spec = tf.signal.stft(tf.tensor1d(data), winLen, hopLen).abs()
    const melBasis = melWeight(sr, winLen)
    const tensor = melBasis.dot(spec.transpose()).transpose()
    const array1d = await tensor.data()
    const out = []

    const [xLen, yLen] = tensor.shape

    for (let i = 0; i < xLen; i++)
        out.push(array1d.subarray(i * yLen, (i + 1) * yLen))

    return out
}


/**
 * Draw a pixel at a specific point
 *
 * @param imgData Image data
 * @param x4 4 * x
 * @param y y
 * @param w4 4 * w
 * @param h h
 * @param r Red (0-255)
 * @param g Green (0-255)
 * @param b Blue (0-255)
 * @param a Alpha (0-255)
 */
export function drawAt(imgData: Uint8ClampedArray, x4: number, y: number, w4: number, h: number,
                       r: number, g: number, b: number, a: number = 255)
{
    const i = (h - y - 1) * w4 + x4
    imgData[i] = r
    imgData[i + 1] = g
    imgData[i + 2] = b
    imgData[i + 3] = a
}


export default class SpectrogramCanvas extends CanvasController
{
    /**
     * Draw full audio
     *
     * @param audio Full decoded audio
     */
    async drawAudio(audio: AudioBuffer)
    {
        const timer = new Timer()
        const spec = await melStft(audio.getChannelData(0), 16000)

        timer.log(`Spectrogram - Mel STFT calculation done`)
        console.log(spec)
        return await this.drawData(spec, 16000)
    }

    async drawData(spec: Float32Array[], sr: number)
    {
        const timer = new Timer()
        this.el.width = this.w = spec.length * 2
        // this.el.height = this.h = spec[0].length

        const [min, max] = extremes(spec.flatMap(it => extremes(it)))
        const range = max - min

        // Draw each pixel
        const img = this.ctx.createImageData(this.w, this.h)
        const imgA = img.data
        const w4 = this.w * 4
        const gradient = new Gradient(chroma.scale(['#232323',
            '#4F1879', '#B43A78', '#F98766', '#FCFAC0']), 1000);
        for (let x = 0; x < spec.length; x++)
        {
            const d = spec[x]
            const x4 = x * 4

            for (let y = 0; y < this.h; y++)
            {
                const value = d[Math.floor(y / this.h * d.length)]

                // Draw
                const color = gradient.get((value - min) / range)
                drawAt(imgA, 2 * x4, y, w4, this.h, color[0], color[1], color[2])
                drawAt(imgA, 2 * x4 + 4, y, w4, this.h, color[0], color[1], color[2])
            }
        }
        this.ctx.putImageData(img, 0, 0)

        timer.log('Spectrogram - Drawing done.')

        return ticksMel2(this.h, 0, 8000)
    }

    /**
     * Draw a line
     *
     * @param lineData
     * @param timeScale
     * @param color
     */
    async drawLine(lineData: Float32Array, timeScale: number, color: string)
    {
        console.log('Drawing line...')
        const xLen = lineData.length / this.w
        let lastMean: number | null = null
        const maxMel = hzToMel(8000)
        // console.log(maxMel)

        for (let x = 0; x < this.w; x++)
        {
            const windowMean = mean(lineData.subarray(xLen * x, xLen * (x + 1)))
            // if (windowMean != null) console.log(windowMean.toFixed(0), hzToMel(windowMean) / maxMel * this.h)

            if (lastMean != null && windowMean != null)
            {
                this.ctx.moveTo(x - 1, this.h - hzToMel(lastMean) / maxMel * this.h)
                this.ctx.lineTo(x, this.h - hzToMel(windowMean) / maxMel * this.h)
                this.ctx.stroke()
                this.ctx.strokeStyle = color
            }

            lastMean = windowMean
        }
    }
}
