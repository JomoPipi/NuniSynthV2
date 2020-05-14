






const Buffers = {
    buffers: <AudioBuffer[]>[],
    nBuffers: 16,
    refreshAffectedBuffers: log,
    currentIndex: 0,
    lastRecorderRequestId: 0,
    stopLastRecorder : log,
    attachToGraph: function (g : NuniGraph) {
        this.refreshAffectedBuffers = () => {
            const canvas = D('buffer-canvas') as HTMLCanvasElement
        
            drawBuffer(Buffers.buffers[this.currentIndex], canvas)
        
            for (const { audioNode: an } of g.nodes) {
                if (an instanceof BufferNode2 && an.bufferIndex === this.currentIndex) {
                    an.refresh()
                }
            }
        }
        this.refreshAffectedBuffers()
    },
    initBuffers(ctx : AudioContext2) {
        const seconds = 3
        Buffers.buffers.length = 0
        for (let x = 0; x < this.nBuffers; x++) {
            const buffer = ctx.createBuffer(2, ctx.sampleRate * seconds, ctx.sampleRate)
            for (let channel = 0; channel < buffer.numberOfChannels; channel++) {  
                const nowBuffering = buffer.getChannelData(channel)
                for (let i = 0; i < buffer.length; i++) {
                    nowBuffering[i] = [
                        Math.sin(i / 32.0) + Math.sin(i / 512.0),
                        Math.sin(i / Math.sqrt(i/3.0)) - Math.cos(i ** 0.3), 
                        Math.sin(i / 32.0) * 0.75 + Math.sin(i / 128.0 * channel) * 0.5 + Math.cos(i / (1000/(i**0.9*9+1))) * 0.3,
                        Math.sin(i / 32.0 + Math.sin(i / (channel+1))),
                        Math.sin(i / Math.tan(i/3.0)),
    
                        Math.sin(i / Math.tan(i/3.0)) - Math.cos(i / 32.0),
                        Math.sin(i / Math.sqrt(i/3.0)) * Math.cos(i ** 0.3),
                        Math.sin(i / 32.0) + Math.sin(i / 81.0),
                        Math.sin(i / 32.0) + Math.sin(i / 25.0),
                        Math.sin(i / 32.0) + Math.cos(i / 27.0)
                    ][x] || (i % 2) / 2.0
                }
            }
            Buffers.buffers.push(buffer)
        }
    }
}