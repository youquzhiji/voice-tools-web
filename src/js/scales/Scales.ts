
export function hzToMel(hz: number): number
{
    return 2595 * Math.log10(1 + hz / 700)
}

export function melToHz(mel: number): number
{
    return 700 * Math.pow(mel / 2595, 10) - 1
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
    for (let i = 100; i < Math.min(max, 1000); i+=100)
        ticks.push([i, i / (max - min) + min])
    for (let i = 1000; i <= max; i+=200)
        ticks.push([i, i / (max - min) + min])
    return ticks
}