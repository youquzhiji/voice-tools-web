import * as tf from "@tensorflow/tfjs";
import {NumberArray} from "@/js/Utils";
import {Tensor2D} from "@tensorflow/tfjs";

export function hzToMel(hz: number): number
{
    return 2595 * Math.log10(1 + hz / 700)
}

export function melToHz(mel: number): number
{
    return 700 * (Math.pow(10, mel / 2595) - 1)
}

export function melToHzTf(mel: tf.Tensor): tf.Tensor
{
    return tf.pow(10, mel.div(2595)).sub(1).mul(700)
}

/**
 * Convert FFT output bins (y-axis index) to frequencies
 *
 * @param winLen Integer, window length
 * @param sampleRate Sample rate
 */
export function binToFreq(winLen: number, sampleRate: number): Float32Array
{
    const multiplier = sampleRate / winLen
    const bins = winLen / 2 + 1
    const arr = new Float32Array(bins)
    for (let i = 0; i < bins; i++) arr[i] = i * multiplier
    return arr
}

/**
 * Tick: [numeric value, percentage position]
 */
export type Ticks = [number, number][]

/**
 * Generate ticks for a linear graph
 *
 * @param height Pixel height
 * @param min Min frequency
 * @param max Max frequency
 */
export function ticksLinear(height: number, min: number, max: number): Ticks
{
    const ticks: Ticks = []
    for (let i = 100; i < Math.min(max, 1000); i += 100)
        ticks.push([i, i / (max - min) + min])
    for (let i = 1000; i <= max; i += 200)
        ticks.push([i, i / (max - min) + min])
    return ticks
}

/**
 * Generate ticks for a Log2 graph
 *
 * @param height Pixel height
 * @param min Min frequency
 * @param max Max frequency
 */
export function ticksLog2(height: number, min: number, max: number): Ticks
{
    const logMin = min < 1 ? 0 : Math.log2(min)
    const logMax = Math.log2(max)

    const ticks: Ticks = []
    for (let log = 5; log < logMax; log++)
        ticks.push([Math.pow(2, log), log / (logMax - logMin) + logMin])
    return ticks
}

export function ticksMel(height: number, min: number, max: number): Ticks
{
    const melMin = min < 1 ? 0 : hzToMel(min)
    const melMax = hzToMel(max)

    const ticks: Ticks = []
    for (let i = 0; i < 20; i++)
    {
        const pivoit = i * (melMax - melMin) / 19
        const hz = Math.round(melToHz(pivoit) / 100) * 100

        ticks.push([hz, (hzToMel(hz) - melMin) / (melMax - melMin)])
    }
    return ticks
}

export function ticksMel2(height: number, min: number, max: number): Ticks
{
    const melMin = min < 1 ? 0 : hzToMel(min)
    const melMax = hzToMel(max)

    const ticks: Ticks = []

    for (let i = 100; i <= Math.min(max, 1000); i += 100)
        ticks.push([i, hzToMel(i) / (melMax - melMin) + melMin])

    for (let i = 1000; i <= Math.min(max, 4000); i += 200)
        ticks.push([i, hzToMel(i) / (melMax - melMin) + melMin])

    for (let i = 4000; i <= max; i += 500)
        ticks.push([i, hzToMel(i) / (melMax - melMin) + melMin])

    return ticks
}

export function melWeight(sr: number, nFft: number, nMels = 128, fMax?: number)
{
    if (typeof fMax == "undefined")
        fMax = sr / 2

    // const weights = tf.zeros([nMels, 1 + Math.floor(nFft / 2)], 'float32')
    const weights = Array(nMels)
    const fftFreqs = tf.tensor1d(binToFreq(nFft, sr), 'float32')
    const melF = melFrequencies(nMels + 2, 0, fMax)
    const fdiff = diff(melF.dataSync())
    const ramps = subtractOuter(melF.dataSync(), fftFreqs.dataSync())

    for (let i = 0; i < nMels; i++)
    {
        // lower and upper slopes for all bins
        const lower = ramps.slice(i, 1).mul(-1).div(fdiff[i])
        const upper = ramps.slice(i + 2, 1).div(fdiff[i + 1])

        // .. then intersect them with each other and zero
        weights[i] = tf.maximum(0, tf.minimum(lower, upper)).dataSync()
    }

    // Slaney-style mel is scaled to be approx constant energy per channel
    const enorm = tf.tensor(2).div(melF.slice(2, nMels).sub(melF.slice(0, nMels)))
    const wt = tf.tensor2d(weights)
    return wt.transpose().mul(enorm).transpose()
}

function melFrequencies(nMels: number = 128, fMin: number = 0.0, fMax: number = 11025.0): tf.Tensor1D
{
    return melToHzTf(tf.linspace(hzToMel(fMin), hzToMel(fMax), nMels)) as tf.Tensor1D
}

/**
 * Similar to np.diff
 */
export function diff(arr: NumberArray): Float32Array
{
    const out = new Float32Array(arr.length - 1)
    for (let i = 0; i < arr.length - 1; i++) out[i] = arr[i + 1] - arr[i]
    return out
}

/**
 * Similar to np.subtract.outer(x, y)
 */
export function subtractOuter(a: NumberArray, b: NumberArray): tf.Tensor2D
{
    const out = []
    // const out = tf.zeros([a.size, b.size], 'float32')
    for (let ai = 0; ai < a.length; ai++)
    {
        out.push(new Float32Array(b.length))
        for (let bi = 0; bi < b.length; bi++)
            out[ai][bi] = a[ai] - b[bi]
    }

    return tf.tensor2d(out)
}

/**
 * Similar to np.linspace
 */
export function linspace(start: number, finish: number, size: number): Float32Array
{
    const a = new Float32Array(size)
    const add = (finish - start) / size
    for (let i = 0; i < size; i++) a[i] = start + add * i
    return a
}