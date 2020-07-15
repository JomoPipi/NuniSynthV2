let worker, firstTime = true;
export function drawBuffer(buff, canvas) {
    if (firstTime) {
        firstTime = false;
        worker = new Worker('dist/buffer_utils/draw_buffer_worker.js');
        worker.postMessage({ canvas }, [canvas]);
    }
    worker.postMessage({ buffer: buff.getChannelData(0) });
}
//# sourceMappingURL=draw_buffer.js.map