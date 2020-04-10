/**
 * NuniSynth
 */

type Destination = AudioNode | AudioParam | SamplerNodeAudioParam

type Indexible = { [param : string] : any }

interface Indexibl<T> { [param : string] : T }

const log = console.log

const D = (x:string) => 
    document.getElementById(x)

const E = (x:string, options?: ElementCreationOptions) => 
    document.createElement(x, options)

const distance = (x:number,y:number,x2:number,y2:number) => ((x-x2)**2 + (y-y2)**2)**0.5

const clamp = (min: number, value: number, max: number) => Math.max(Math.min(max,value),min)

const PHI = (Math.sqrt(5) + 1) / 2.0
const TR2 = 2 ** (1.0 / 12.0)

class AudioContext2 extends AudioContext {

    constructor() {
        super()
    }

    createSampler() {
        return new SamplerNode(this)
    }
}

const audioCtx = new AudioContext2() as Indexible
const nBuffers = 10
initBuffers(nBuffers, audioCtx as AudioContext2) 


function connect_node_to_destination(node1 : NuniGraphNode, destination : Destination) {
    if (destination instanceof SamplerNodeAudioParam) 
    {
        node1.audioNode.connect(destination.src.offset)
    } else {
        node1.audioNode.connect(destination)
    }
    return destination
}


function disconnect_node_from_destination(node1 : NuniGraphNode, destination : Destination) {
    if (destination instanceof SamplerNodeAudioParam) {
        node1.audioNode.disconnect(destination.src.offset)
    } else {
        node1.audioNode.disconnect(destination)
    }
}
