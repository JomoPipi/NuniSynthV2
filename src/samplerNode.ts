



const TR2 = 2 ** (1.0 / 12.0)

const keys = ([] as number[]).concat(...[
    '1234567890',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm'
    ].map((s,i) => 
        [...s].map(c=>c.toUpperCase().charCodeAt(0))
            // .concat([
            //     [189,187],
            //     [219,221],
            //     [186,222],
            //     [188,190,191]
            // ][i])
        ))

const keyStates = keys.reduce((a : {[v:number]:boolean},v) => (a[v] = false, a), {})

let lastKeyStates : string

const refreshSamplers = () => {
    G.nodes.filter(node => {
        if (node.audioNode instanceof SamplerNode) {
            node.audioNode.refresh()
        }
    })
}

class SamplerNodeAudioParam {
    /**
     * AudioParams that are compatible with the sampler
     */
    src: ConstantSourceNode
    name: string

    constructor(name : string, ctx: AudioContext) {
        this.name = name
        this.src = ctx.createConstantSource()
        this.src.start(audioCtx.currentTime)
    }
    
    setValueAtTime(value: number, time:never) {
        this.src.offset.value = value
    }
}


const samplerBuffers : AudioBuffer[] = []

function initBuffers(n : number, ctx : AudioContext2) {
    for (let x = 0; x < n; x++) {
        const buffer = ctx.createBuffer(2, ctx.sampleRate * 3, ctx.sampleRate)
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {  
            const nowBuffering = buffer.getChannelData(channel);
            for (let i = 0; i < buffer.length; i++) {
                nowBuffering[i] = [
                    Math.sin(i / 32.0),
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
        samplerBuffers.push(buffer)
    }
}




class SamplerNode {
    /**
     * audioBufferSourceNodes need to get disconnected
     * as keys get pressed/unpressed.
     * The sampler will take care of this business internally
     * while keeping the node connected to the graph.
     */

    connectees: Destination[]
    playbackRate: SamplerNodeAudioParam
    detune: SamplerNodeAudioParam
    sources: Indexible
    bufferIndex: number
    loop: boolean
    ctx: AudioContext2
    type: string
    
    constructor(ctx : AudioContext2) {
        this.connectees = []
        this.bufferIndex = 0
        this.loop = false
        this.detune = new SamplerNodeAudioParam('detune', ctx)
        this.playbackRate = new SamplerNodeAudioParam('playbackRate', ctx)
        this.type = 'loop'
        this.ctx = ctx

        this.sources = keys.map((_,i) => {
            const src = ctx.createBufferSource()
            src.playbackRate.value =  TR2 ** (i - 12)
            this.detune.src.connect(src.detune)
            this.playbackRate.src.connect(src.playbackRate)
            return src
            })
        
        this.refresh()
    }

    clearBuffer(i : number) {
        const sources = this.sources
        if (!sources[i].isOn) return;
        sources[i].disconnect()

        sources[i] = this.ctx.createBufferSource()

        sources[i].playbackRate.value = 
            TR2 ** (i - 12) * this.playbackRate.src.offset.value
            
        sources[i].detune.value = this.detune.src.offset.value

        this.playbackRate.src.connect(sources[i].playbackRate)
        this.detune.src.connect(sources[i].detune)

        sources[i].buffer = samplerBuffers[this.bufferIndex]
        sources[i].loop = this.type === 'loop'
        sources[i].start(audioCtx.currentTime)
    }

    connectBuffer(_:any, i:number) {
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
        this.connectBuffer(0,n)
        this.sources[n].isOn = true
    }

    refresh() {
        keys.forEach((key,i) => {
            this.sources[i].isOn = true
            this.clearBuffer(i)
        })
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

    switchBuffer(i : number) {
        this.bufferIndex = i
        this.sources.forEach((src : AudioBufferSourceNode) => 
            src.buffer = samplerBuffers[this.bufferIndex])
    }
}

document.onkeydown = updateKeys(true)
document.onkeyup = updateKeys(false)

function updateKeys(on : boolean) {
    return function(e : KeyboardEvent) {
        keyStates[e.keyCode] = on
        G.nodes.forEach(node => {
            if (node.audioNode instanceof SamplerNode) {
                node.audioNode.update()
            }
        })
    }
}