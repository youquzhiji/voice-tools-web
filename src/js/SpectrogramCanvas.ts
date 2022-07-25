import CanvasController from "@/js/CanvasController";
import chroma from "chroma-js";
import {extremes, Gradient, mean, Timer} from "@/js/Utils";
import {hzToMel, ticksMel2} from "@/js/scales/Scales";

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
        this.ctx.closePath()

        timer.log('Spectrogram - Drawing done.')

        return ticksMel2(this.h, 0, 8000)
    }

    /**
     * Draw a line
     *
     * @param lineData
     * @param timeScale
     * @param color
     * @param width
     */
    async drawLine(lineData: Float32Array, timeScale: number, color: string, width: number = 1)
    {
        console.log('Drawing line...')
        console.log(lineData.length)
        const xLen = lineData.length / this.w
        console.log(xLen)
        let lastMean: number | null = null
        const maxMel = hzToMel(8000)
        lineData = lineData.map(it => this.h - hzToMel(it) / maxMel * this.h)

        this.ctx.beginPath()

        for (let x = 0; x < this.w; x++)
        {
            const windowMean = mean(lineData.subarray(xLen * x, Math.ceil(xLen * (x + 1))))

            if (windowMean != null)
            {
                if (lastMean != null)
                    this.ctx.lineTo(x, windowMean)
                else
                    this.ctx.moveTo(x, windowMean)
            }

            lastMean = windowMean
        }
        this.ctx.lineWidth = width
        this.ctx.strokeStyle = color
        this.ctx.stroke()
        this.ctx.closePath()
    }
}
