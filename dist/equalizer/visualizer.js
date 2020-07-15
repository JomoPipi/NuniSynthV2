export function renderVisualiserCanvas(canvas, analyser) {
    analyser.fftSize = 2048;
    analyser.minDecibels = -90;
    const bufferLength = analyser.frequencyBinCount;
    const worker = new Worker('/src/webaudio2/equalizer/visualizer_worker.js');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const offscreen = canvas.transferControlToOffscreen();
    worker.postMessage({ canvas: offscreen, bufferLength }, [offscreen]);
    return function render() {
        const fbc_array = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(fbc_array);
        worker.postMessage({ buffer: fbc_array.buffer });
        requestAnimationFrame(render);
    };
}
//# sourceMappingURL=visualizer.js.map