






let worker : Worker, firstTime = true

export function drawBuffer(buff : AudioBuffer, canvas : OffscreenCanvas) {
    
    if (firstTime) {
        firstTime = false
        worker = new Worker('/dist/buffer_utils/draw_buffer_worker.js')
        worker.postMessage({ canvas }, [canvas])
    }

    worker.postMessage({ buffer: buff.getChannelData(0) })

    // worker.terminate() // Is there any harm in keeping idle workers alive?
}