
export function sum(arr: Array<number>)
{
    return arr.reduce((a, b) => a + b, 0)
}

export function mean(arr: Array<number>)
{
    return sum(arr) / arr.length
}