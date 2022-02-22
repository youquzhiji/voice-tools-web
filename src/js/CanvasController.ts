export default class CanvasController
{
    el: HTMLCanvasElement
    ctx: CanvasRenderingContext2D

    w: number
    h: number

    constructor(canvas: HTMLCanvasElement)
    {
        this.el = canvas
        this.ctx = canvas.getContext("2d")!

        // Fix: Allow setting canvas width and height using CSS
        const canvasCss = window.getComputedStyle(canvas)
        this.w = canvas.width = parseInt(canvasCss.width.replace('px', ''))
        this.h = canvas.height = parseInt(canvasCss.height.replace('px', ''))
    }
}