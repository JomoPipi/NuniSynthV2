

type Destination = AudioNode | AudioParam | SamplerAudioParam



const TR2 = 2 ** (1.0 / 12.0)
const keys = [...`1234567890qwertyuiopasdfghjklzxcvbnm`.toUpperCase()]
const keyStates = keys.reduce((a : {[v:string]:boolean},v) => (a[v] = false, a), {})

let lastKeyStates : string




const superConnect = AudioNode.prototype.connect
AudioNode.prototype.connect = function (destination : Destination) {
    if (destination instanceof SamplerAudioParam) 
    {
        destination.connectors.push(this)
    } else {
        superConnect.call(this, destination as AudioParam)
    }
    return destination as AudioNode
}

function disconnect(node1 : NuniGraphNode, destination : Destination) {
    if (destination instanceof SamplerAudioParam) {
        destination.connectors.splice(
            destination.connectors.findIndex(n => 
                n === node1.audioNode as AudioNode), 1)
    }
    else 
        node1.audioNode.disconnect(destination)
}



class SamplerAudioParam {
    value: number
    connectors: AudioNode[]
    
    constructor() {
        this.value = 1
        this.connectors = []
    }
    
    setValueAtTime(value: number, time:never) {
        this.value = value
    }
}





const samplerBuffers = [...Array(9)].map(() => {
    // Create an empty three-second stereo buffer at the sample rate of the AudioContext
    const buffer = audioCtx.createBuffer(2, audioCtx.sampleRate * 3, audioCtx.sampleRate);
    
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {   
        const nowBuffering = buffer.getChannelData(channel);
        for (let i = 0; i < buffer.length; i++) {
            nowBuffering[i] = 
                // Math.sin(Math.sqrt(i) ** 1.618 / 8.0) 
                Math.sin(i / 32.0)
                // lots of cool things can be done, here.
        }
    }
    return buffer
})

class Sampler {
    /**
     * audioBufferSourceNodes need to get disconnected
     * and reconnected as notes get played.
     * The sampler will take care of this business
     * while staying connected to the graph.
     */

    connectees: Destination[]
    playbackRate: SamplerAudioParam
    detune: SamplerAudioParam
    sources: Indexible
    bufferIndex: number
    buffer: AudioBuffer
    loop: boolean
    constructor() {
        this.connectees = []
        this.bufferIndex = 0
        this.loop = false
        this.buffer = samplerBuffers[this.bufferIndex]
        this.playbackRate = new SamplerAudioParam()
        this.detune = new SamplerAudioParam()
        this.type = 'loop'
        this.sources = keys.map((key,i) => {
            const src = audioCtx.createBufferSource()
            src.playbackRate.value =  TR2 ** (i - 12)
            return src
            })
    }

    set type(t: string) {
        this.loop = t === 'loop'
    }
    get type() {
        return this.loop ? 'loop' : 'no loop'
    }

    clearBuffer(i : number) {
        const sources = this.sources
        sources[i].disconnect()
        sources[i] = audioCtx.createBufferSource()
    
        sources[i].playbackRate.value = 
            TR2 ** (i - 12) * this.playbackRate.value
            
        this.playbackRate.connectors
            .forEach((c : AudioNode) =>
                c.connect(sources[i].playbackRate))

        sources[i].detune.value = 
            this.detune.value

        this.detune.connectors
            .forEach((c : AudioNode) =>
                c.connect(sources[i].detune))


        sources[i].buffer = samplerBuffers[this.bufferIndex]
        sources[i].loop = this.loop
        sources[i].start()
    }

    newBuffer(_:any, i:number) {
        const src = this.sources[i] 

        this.connectees.forEach(destination => 
            src.connect(destination))
            
        src.isOn = true
    }

    connect(destination : Destination) {
        this.connectees.push(destination)
    }

    disconnect(destination : Destination) {
        this.connectees.splice(
            this.connectees.indexOf(destination), 1)
    }

    noteOn(n : number) {
        if (this.sources[n].isOn) return;
        this.newBuffer(0,n)
        this.sources[n].isOn = true
    }

    update() {
        keys.forEach((key,i) => {
            if (keyStates[key]) {
                this.noteOn(i)
            } else{
                this.clearBuffer(i)
            }
        })
    }

}


document.onkeydown = function(e) {
    keyStates[String.fromCharCode(e.keyCode)] = true
    const states = Object.keys(keyStates).reduce((a,v,i) => a + (keyStates[v] ? v : ''), '')
    if (states === lastKeyStates) {
        lastKeyStates = states
        return;
    }
    lastKeyStates = states
    G.nodes.forEach(node => {
        if (node.audioNode instanceof Sampler) {
            node.audioNode.update()
        }
    })
}
document.onkeyup = function(e) {
    lastKeyStates = ''
    keyStates[String.fromCharCode(e.keyCode)] = false
    G.nodes.forEach(node => {
        if (node.audioNode instanceof Sampler) {
            node.audioNode.update()
        }
    })
}