import CanvasController from "@/js/CanvasController";
import * as tf from '@tensorflow/tfjs'
import chroma from "chroma-js";
import {extremes, Gradient, mean} from "@/js/Utils";
import {binToFreq, hzToMel, melToHz, melWeight, ticksLinear, ticksLog2, ticksMel, ticksMel2} from "@/js/scales/Scales";
import {argMin} from "@tensorflow/tfjs";

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


export default class SpectrogramCanvas extends CanvasController
{
    /**
     * Draw full audio
     *
     * @param audio Full decoded audio
     */
    // async drawAudio(audio: AudioBuffer)
    // {
    //     let start = performance.now()
    //
    //     const spec = await stft(audio.getChannelData(0))
    //
    //     console.log(`stft calculation done: ${performance.now() - start} ms`)
    //     start = performance.now()
    //     console.log(spec)
    //
    //     this.el.width = this.w = spec.length
    //
    //     const [min, max] = extremes(spec.flatMap(it => extremes(it)))
    //     const range = max - min
    //
    //     function createArray(max: number, resolution: number)
    //     {
    //         return Array.from(Array(Math.floor(resolution)).keys()).map(i => i / resolution * max)
    //     }
    //
    //     // Precompute mapping
    //     const mappedMel = createArray(hzToMel(1024), 1000).map(i => melToHz(i))
    //     const mapping = Array.from(Array(this.h).keys()).map(y => Math.floor(mappedMel[Math.floor(y / this.h * mappedMel.length)]))
    //
    //     // Draw each pixel
    //     const img = this.ctx.createImageData(this.w, this.h)
    //     const imgA = img.data
    //     const w4 = this.w * 4
    //     const gradient = new Gradient(chroma.scale(['#232323',
    //         '#4F1879', '#B43A78', '#F98766', '#FCFAC0']), 1000);
    //     for (let x = 0; x < this.w; x++)
    //     {
    //         const d = spec[x]
    //         const x4 = x * 4
    //
    //         for (let y = 0; y < this.h; y++)
    //         {
    //             const iCur = mapping[y]
    //             const iNext = mapping[y + 1]
    //             const area = d.subarray(iCur, iNext == iCur ? iNext + 1 : iNext)
    //
    //             // Draw
    //             const i = (this.h - y - 1) * w4 + x4;
    //             [imgA[i], imgA[i + 1], imgA[i + 2]] = gradient.get((mean(area) - min) / range)
    //             imgA[i + 3] = 255
    //         }
    //     }
    //     this.ctx.putImageData(img, 0, 0)
    //
    //     console.log(`drawing done: ${performance.now() - start} ms`)
    //
    //     return ticksMel2(this.h, 0, audio.sampleRate / 2)
    // }


    /**
     * Draw full audio
     *
     * @param audio Full decoded audio
     */
    async drawAudio(audio: AudioBuffer)
    {
        let start = performance.now()

        const spec = await melStft(audio.getChannelData(0), 16000)

        console.log(`stft calculation done: ${performance.now() - start} ms`)
        start = performance.now()
        console.log(spec)

        this.el.width = this.w = spec.length

        const [min, max] = extremes(spec.flatMap(it => extremes(it)))
        const range = max - min

        // Draw each pixel
        const img = this.ctx.createImageData(this.w, this.h)
        const imgA = img.data
        const w4 = this.w * 4
        const gradient = new Gradient(chroma.scale(['#232323',
            '#4F1879', '#B43A78', '#F98766', '#FCFAC0']), 1000);
        for (let x = 0; x < this.w; x++)
        {
            const d = spec[x]
            const x4 = x * 4

            for (let y = 0; y < this.h; y++)
            {
                const value = d[Math.floor(y / this.h * d.length)]

                // Draw
                const i = (this.h - y - 1) * w4 + x4;
                [imgA[i], imgA[i + 1], imgA[i + 2]] = gradient.get((value - min) / range)
                imgA[i + 3] = 255
            }
        }
        this.ctx.putImageData(img, 0, 0)

        console.log(`drawing done: ${performance.now() - start} ms`)

        return ticksMel2(this.h, 0, audio.sampleRate / 2)
    }
}
