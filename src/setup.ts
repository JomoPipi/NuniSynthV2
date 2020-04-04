/**
 * NuniSynth
 */

type Indexible = { [param : string] : any }

const log = console.log

const D = (x:string) => 
    document.getElementById(x)

const E = (x:string, options?: ElementCreationOptions) => 
    document.createElement(x, options)

const distance = (x:number,y:number,x2:number,y2:number) => ((x-x2)**2 + (y-y2)**2)**0.5

const clamp = (min: number, value: number, max: number) => Math.max(Math.min(max,value),min)


class AudioContext2 extends AudioContext {

    constructor() {
        super()
    }

    createSampler() {
        return new Sampler(this)
    }
}

const audioCtx = new AudioContext2() as Indexible
initBuffers(9, audioCtx as AudioContext2) 