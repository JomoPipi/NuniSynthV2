






type Endofunction<T> = (arg : T) => T;

type Indexed = { [param : string] : any }

interface Indexable<T> { [param : string] : T }




const log = console.log

const trace = <T>(x : T) => (log(x), x)

const D = (x:string) => 
    document.getElementById(x)

type AllElements = {
    a      : HTMLAnchorElement
    div    : HTMLDivElement
    video  : HTMLVideoElement
    input  : HTMLInputElement
    select : HTMLSelectElement
}

type CreatedElement<T extends string> = 
    T extends keyof AllElements 
        ? AllElements[T] 
        : HTMLElement

type ElementSettings = {
    text? : string
    className? : string
    children? : HTMLElement[]
    props? : Indexed
    }

const E = <T extends string>(x : T, settings : ElementSettings = {}) => {
    const element = document.createElement(x) as CreatedElement<T>
    
    const { text, className, children, props } = settings

    if (text) element.innerText = text

    if (className)
        for (const name of className.split(' ')) 
            element.classList.add(name)
    
    for (const child of children || [])
        element.appendChild(child)
    
    for (const prop in props || {}) {
        (<Indexed>element)[prop] = props![prop]
    }

    return element
}

const distance = (x : number, y : number, x2 : number, y2 : number) => 
    ((x-x2)**2 + (y-y2)**2)**0.5
    
const clamp = (min : number, value : number, max : number) => 
    Math.max(Math.min(max,value), min)



    
const PHI = (Math.sqrt(5) + 1) / 2.0
const TR2 = 2 ** (1.0 / 12.0)
const TAU = 2 * Math.PI
const twoThirdsPi = TAU / 3.0

const dBToVolume = (dB : number) =>
    10 ** (0.05 * dB)

const volumeTodB = (volume : number) =>
    20 * Math.log10(volume)