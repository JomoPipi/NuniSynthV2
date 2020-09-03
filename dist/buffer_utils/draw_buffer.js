let worker, firstTime = true;
function drawBuffer(buff, canvas) {
    if (firstTime) {
        firstTime = false;
        worker = new Worker('dist/buffer_utils/draw_buffer_worker.js', { type: 'module' });
        worker.postMessage({ canvas }, [canvas]);
    }
    worker.postMessage({ buffer: buff.getChannelData(0) });
}
export { drawBuffer };
//# sourceMappingURL=draw_buffer.js.map