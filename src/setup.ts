/**
 * NuniSynth
 */

type Indexible = { [param : string] : any }

const log = console.log

const D = (x:string) => document.getElementById(x)

const E = (x:string) => document.createElement(x)

const audioCtx = new (window.AudioContext)() as Indexible

const distance = (x:number,y:number,x2:number,y2:number) => ((x-x2)**2 + (y-y2)**2)**0.5

const clamp = (min: number, value: number, max: number) => Math.max(Math.min(max,value),min)
