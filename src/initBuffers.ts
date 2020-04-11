
const BUFFERS : AudioBuffer[] = []

function initBuffers(n : number, ctx : AudioContext2) {
    BUFFERS.length = 0
    for (let x = 0; x < n; x++) {
        const buffer = ctx.createBuffer(2, ctx.sampleRate * 3, ctx.sampleRate)
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {  
            const nowBuffering = buffer.getChannelData(channel);
            for (let i = 0; i < buffer.length; i++) {
                nowBuffering[i] = [
                    Math.sin(i / 32.0) * 0.75 + Math.sin(i / 128.0 * channel) * 0.5 + Math.cos(i / (1000/(i**0.9*9+1))) * 0.3,
                    Math.sin(i / 32.0 + Math.sin(i / (channel+1))),
                    Math.sin(i / Math.tan(i/3.0)),
                    Math.sin(i / Math.tan(i/3.0)) - Math.cos(i / 32.0),
                    
                    Math.sin(i / Math.sqrt(i/3.0)) - Math.cos(i ** 0.3),
                    Math.sin(i / Math.sqrt(i/3.0)) * Math.cos(i ** 0.3),
                    (Math.sin(i / Math.sqrt(i/3.0))+1) ** Math.cos(i ** 0.3),
                    Math.cos(i / Math.sqrt(i/3.0)) ** (Math.cos(i ** 0.3)/2.0+0.25),
                    Math.cos(i / Math.sqrt(i/30.0)) ** (Math.cos(i ** 0.03)),
                    Math.sin(i / 32.0) + Math.sin(i / 512.0),
                ][x]
                    // lots of cool things can be done, here.
            }
        }
        BUFFERS.push(buffer)
    }
}
