
type Indexible = { [param : string] : any }

const log = console.log

const D = (x:string) => document.getElementById(x)

const audioCtx = new (window.AudioContext)() as Indexible
