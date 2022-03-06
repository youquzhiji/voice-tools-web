import CanvasController from "@/js/CanvasController";
import * as tf from '@tensorflow/tfjs'
import chroma from "chroma-js";
import {extremes, Gradient, mean} from "@/js/Utils";
import {hzToMel, melToHz, ticksLinear} from "@/js/scales/Scales";

/**
 * Convert power spectrum signal to decibel signal inspired by python's librosa library.
 *
 * @param ps Power spectrum
 * @param aMin
 * @param maxDb
 */
function powerToDb(ps: Float32Array[], aMin: number = 1e-10, maxDb: number = 80): Float32Array[]
{
    const ref = 1
    const refFactor = 10 * Math.log10(Math.max(aMin, ref))
    const out: Float32Array[] = []

    for (let amplitudes of ps)
    {
        const a = amplitudes.map(n => 10 * Math.log10(Math.min(n, aMin)) - refFactor)

        if (maxDb)
        {
            const min = extremes(a)[1] - maxDb
            for (let i in a) a[i] = Math.max(a[i], min)
        }
    }

    return out
}

/**
 * Calculate stft spectrogram
 *
 * @param data Decoded audio waveform data
 * @param hopLen Hop length
 * @param winLen Window length (aka. n_fft)
 */
async function stft(data: Float32Array, hopLen: number = 512, winLen: number = 2048): Promise<Float32Array[]>
{
    const stft = tf.signal.stft(tf.tensor1d(data), winLen, hopLen).abs()
    const array1d = await stft.data() as never as Float32Array
    const out = []

    const [xLen, yLen] = stft.shape

    for (let i = 0; i < xLen; i++)
        out.push(array1d.subarray(i * yLen, (i + 1) * yLen))

    return out
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
        let start = performance.now()

        const spec = await stft(audio.getChannelData(0))

        console.log(`stft calculation done: ${performance.now() - start} ms`)
        start = performance.now()

        this.el.width = this.w = spec.length
        // const xPxLen = d.length / this.w

        const [min, max] = extremes(spec.flatMap(it => extremes(it)))
        const range = max - min

        // Mapping i(y) - Input: pixel index y, Output: displayed index in array
        // Displayed index range = i(y) to i(y + 1), non-inclusive
        const binLen = spec[0].length
        const logLen = Math.log2(binLen)
        // const melLen = hzToMel()
        const [yPxLen, logPxLen] = [binLen / this.h, logLen / this.h]
        const mappingLinear = (y: number) => y * yPxLen
        const mappingLog = (y: number) => Math.floor(Math.pow(2, y * logPxLen))
        // const mappingMel = ;

        // Precompute mapping
        const mapping = Array.from(Array(this.h).keys()).map(i => mappingLinear(i))

        // Draw each pixel
        const img = this.ctx.createImageData(this.w, this.h)
        const imgA = img.data
        const w4 = this.w * 4
        const gradient = new Gradient(chroma.scale(['#232323',
            '#4F1879', '#B43A78', '#F98766', '#FCFAC0']), 1000);
        // const gradient = new Gradient(chroma.scale(['#fff', '#ff7676', '#ff7676', '#ff2f2f']), 1000);
        for (let x = 0; x < this.w; x++)
        {
            const d = spec[x]
            const x4 = x * 4

            for (let y = 0; y < this.h; y++)
            {
                const iCur = mapping[y]
                const iNext = mapping[y + 1]
                const area = d.subarray(iCur, iNext == iCur ? iNext + 1 : iNext)

                // Draw
                const i = (this.h - y) * w4 + x4;
                [imgA[i], imgA[i + 1], imgA[i + 2]] = gradient.get((mean(area) - min) / range)
                imgA[i + 3] = 255

                // this.ctx.beginPath()
                // this.ctx.fillStyle = gradient((mean(area) - min) / range).toString()
                // this.ctx.fillRect(x, this.h - y, 1, 1)
                // this.ctx.closePath()
            }
        }
        this.ctx.putImageData(img, 0, 0)

        console.log(`drawing done: ${performance.now() - start} ms`)

        return ticksLinear(this.h, 0, audio.sampleRate / 2)
    }
}