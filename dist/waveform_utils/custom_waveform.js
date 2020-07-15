import { audioCtx } from '../webaudio2/internal.js';
function newRandomWaveForm(N) {
    const real = new Float32Array(N);
    const imag = new Float32Array(N);
    for (let i = 1; i < N; i++) {
        real[i] = i / N;
        imag[i] = 1 - i / N;
    }
    return audioCtx.createPeriodicWave(real, imag, { disableNormalization: true });
}
//# sourceMappingURL=custom_waveform.js.map