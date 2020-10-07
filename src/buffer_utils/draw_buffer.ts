






let worker : Worker, firstTime = true;


export function drawBuffer(buff : AudioBuffer, canvas : OffscreenCanvas) {
    
    if (firstTime) 
    {
        firstTime = false
        worker = new Worker('dist/buffer_utils/draw_buffer_worker.js', { type: 'module' })
        worker.postMessage({ canvas }, [canvas])
    }

    worker.postMessage({ buffer: buff.getChannelData(0) })
}

import { reallyDrawBuffer } from './draw_buffer_worker.js'

export function drawBuffer2(buffer : Float32Array, ctx : CanvasRenderingContext2D, H : number, W : number) {
    reallyDrawBuffer(buffer, ctx, H, W)
    return ctx.getImageData(0, 0, W, H)
}