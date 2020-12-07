






type Endofunction<T> = (arg : T) => T;

type Indexed = { [param : string] : any }

interface Indexable<T> { [param : string] : T }

type Immutable<Type> = {
    readonly [Key in keyof Type] : Immutable<Type[Key]>
}

type MouseHandler = (e : MouseEvent) => void

const log = console.log

const trace = <T>(x : T) => (log(x), x)

const D = (id : string) => {
    const el = document.getElementById(id)
    if (!el) throw `Error: No element found with id ${id}.`
    return el
}

type AllElements = {
    a      : HTMLAnchorElement
    div    : HTMLDivElement
    video  : HTMLVideoElement
    input  : HTMLInputElement
    select : HTMLSelectElement
    canvas : HTMLCanvasElement
    button : HTMLButtonElement
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
    is? : string
}

const E = <T extends string>(x : T, settings : ElementSettings = {}) => {

    const { text, className, children, props, is } = settings
    const element = document.createElement(x, { is }) as CreatedElement<T>
    
    element.innerText = text || ''

    if (className)
    {
        for (const name of className.split(' ')) 
        {
            element.classList.add(name)
        }
    }
    
    if (children)
    {
        element.append(...children)
    }
    
    Object.assign(element, props)

    return element
}

const distance = (x : number, y : number, x2 : number, y2 : number) => 
    ((x-x2)**2 + (y-y2)**2)**0.5
    
const clamp = (min : number, value : number, max : number) => 
    Math.max(Math.min(max,value), min)

const wrap = (min : number, value : number, max : number) => 
    value < min
        ? value + max
        : value > max
        ? value - max
        : value


    
const PHI = (Math.sqrt(5) + 1) / 2.0
const TR2 = 2 ** (1.0 / 12.0)
const TAU = 2 * Math.PI
const twoThirdsPi = TAU / 3.0

const dBToVolume = (dB : number) =>
    10 ** (0.05 * dB)

const volumeTodB = (volume : number) =>
    20 * Math.log10(volume)


interface DIRTYGLOBALS {
    lastControllerToOpenTheContextmenu : Indexed // unknown
    RISING_GLOBAL_Z_INDEX : number
}

const ISMAC = navigator.platform.toUpperCase().indexOf('MAC') >= 0

const DIRTYGLOBALS : DIRTYGLOBALS = 
    { lastControllerToOpenTheContextmenu: {}
    , RISING_GLOBAL_Z_INDEX: 0
    }