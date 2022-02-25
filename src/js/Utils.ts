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