export function hzToMel(hz: number): number
{
    return 2595 * Math.log10(1 + hz / 700)
}

export function melToHz(mel: number): number
{
    return 700 * (Math.pow(10, mel / 2595) - 1)
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
