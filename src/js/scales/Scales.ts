
export function hzToMel(hz: number)
{
    return 2595 * Math.log10(1 + hz / 700)
}

export function melToHz(mel: number)
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