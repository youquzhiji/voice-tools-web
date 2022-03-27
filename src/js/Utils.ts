import chroma from "chroma-js";
import buffer from "buffer";
import {FeatureLiteral} from "@/views/comp/ClassificationResults.vue";

type NumberArray = Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array |
    Float32Array | Float64Array | number[] | Array<number>

export function sum(arr: NumberArray): number
{
    let sum = 0
    for (let i = 0; i < arr.length; i++) sum += arr[i]
    return sum
}

export function mean(arr: NumberArray): number
{
    return sum(arr) / arr.length
}

/**
 * Calculates min and max of an array
 *
 * @param a Array
 * @return [min, max]
 */
export function extremes(a: NumberArray): [number, number]
{
    let min = a[0]
    let max = a[0]

    for (let n = 0; n < a.length; n++)
    {
        if (a[n] < min) min = a[n]
        if (a[n] > max) max = a[n]
    }

    return [min, max]
}

/**
 * Precomputed gradient optimized for pixel drawing
 */
export class Gradient
{
    res: number
    r: Uint8Array
    g: Uint8Array
    b: Uint8Array

    constructor(scale: chroma.Scale, resolution: number, logScale: boolean = true)
    {
        this.res = resolution

        this.r = new Uint8Array(resolution + 1)
        this.g = new Uint8Array(resolution + 1)
        this.b = new Uint8Array(resolution + 1)

        // Precompute
        if (logScale)
        {
            const logMax = Math.log2(resolution)
            for (let i = 0; i <= resolution; i++)
                [this.r[i], this.g[i], this.b[i]] = scale(Math.log2(i) / logMax).rgb()
        }
        else
        {
            for (let i = 0; i <= resolution; i++)
                [this.r[i], this.g[i], this.b[i]] = scale(i / resolution).rgb()
        }
    }

    /**
     * Get RGB
     *
     * @param ratio Color ratio (0 - 1)
     */
    get(ratio: number)
    {
        const i = Math.round(ratio * this.res)
        return [this.r[i], this.g[i], this.b[i]]
    }
}


/**
 * Decode frequency ndarray
 *
 * @param b64 Base 64 encoded
 * @param shape Shape
 */
export function decodeFreqArray(b64: string, shape: number[]): {[index: string]: Float32Array}
{
    const array = new Float32Array(buffer.Buffer.from(b64, 'base64').buffer)
    const rows = 4
    const cols = array.length / rows
    const keys = ['pitch', 'f1', 'f2', 'f3']
    const result = {}

    for (let x = 0; x < rows; x++)
        result[keys[x]] = array.slice(cols * x, cols * (x + 1))

    return result
}