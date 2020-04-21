






const Buffers = {
    buffers: <AudioBuffer[]>[],
    refreshAffectedBuffers: log,
    currentIndex: 0,
    lastRecorderRequestId: 0,
    stopLastRecorder : log,
    attachToGraph: function (g : NuniGraph) {
        this.refreshAffectedBuffers = () => {
            const canvas = D('buffer-canvas') as HTMLCanvasElement
        
            drawBuffer(Buffers.buffers[this.currentIndex], canvas)
        
            g.nodes.forEach(({ audioNode: an }) => {
                if (an instanceof BufferNode2 && an.bufferIndex === this.currentIndex) {
                    an.refresh()
                }
            })
        }
        this.refreshAffectedBuffers()
    }
}

function initBuffers(n : number, ctx : AudioContext2) {
    const seconds = 3
    Buffers.buffers.length = 0
    for (let x = 0; x < n; x++) {
        const buffer = ctx.createBuffer(2, ctx.sampleRate * seconds, ctx.sampleRate)
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {  
            const nowBuffering = buffer.getChannelData(channel);
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
                ][x]
                    // lots of cool things can be done, here.
            }
        }
        Buffers.buffers.push(buffer)
    }
}

function reverseBuffer(index : number) {
    Buffers.buffers[index].getChannelData(0).reverse()
    Buffers.refreshAffectedBuffers()
}

function invertBuffer(index : number) {
    const arr = Buffers.buffers[index].getChannelData(0)
    for (let i =0; i < arr.length; i++)
        arr[i] *= -1

    Buffers.refreshAffectedBuffers()
}


// Change buffer index
;['up','down'].forEach((s,i) => {
    D('buffer-index-'+s)!.onclick = () => {
        const idx = Buffers.currentIndex = clamp(0, Buffers.currentIndex + Math.sign(.5 - i), nBuffers-1)
        D('buffer-index')!.innerHTML = idx.toString()
        Buffers.refreshAffectedBuffers()
    }
})

// Reverse buffer at current index
D('reverse-buffer')!.onclick = () => {
    reverseBuffer(Buffers.currentIndex)
}

// Reverse buffer at current index
D('invert-buffer')!.onclick = () => {
    invertBuffer(Buffers.currentIndex)
}