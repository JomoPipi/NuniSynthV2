






type Indexible = { [param : string] : any }

interface Indexed<T> { [param : string] : T }

 
const log = console.log

const D = (x:string) => 
    document.getElementById(x)

const E = (x:string, options?: ElementCreationOptions) => 
    document.createElement(x, options)

const distance = (x:number, y:number, x2:number, y2:number) => 
    ((x-x2)**2 + (y-y2)**2)**0.5
    
const clamp = (min: number, value: number, max: number) => 
    Math.max(Math.min(max,value),min)

const PHI = (Math.sqrt(5) + 1) / 2.0
const TR2 = 2 ** (1.0 / 12.0)
const TAU = 2 * Math.PI