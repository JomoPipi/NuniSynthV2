






class JsDial {
    [x : string] : unknown
    isActive : boolean
    sensitivity : number
    lastY : number
    lastX : number
    value : number
    max : number
    min : number
    dial : HTMLDivElement

    constructor(dial : HTMLDivElement) {
        this.isActive = false
        this.lastY = this.lastX = 0
        this.max = 1
        this.dial = dial
        this.value = this.min = this.sensitivity = 2**-7
        
        for (const attr of dial.attributes) {
            this[attr.name] = (x => isNaN(+x) ? x : +x)(attr.value)
        }
    }
    
    attach(func : Function, startFunc? : Function, endFunc? : Function) {

        const start = (x:number, y:number) => { 
            this.lastX = x
            this.lastY = y
            this.isActive = true
            startFunc && startFunc()
            this.render()
        }
        const end = () => { 
            this.isActive = false
            endFunc && endFunc()
        }
        const mouseStart = (e : MouseEvent) => start(e.clientX,e.clientY)
        const mouseMove  = (e : MouseEvent) => move (e.clientX,e.clientY)
        
        const move = (x:number, y:number) => {
            if (!this.isActive) return;
            this.value += (this.lastY - y + x - this.lastX) * this.sensitivity
            this.value = clamp(this.min, this.value, this.max)
            this.lastX = x
            this.lastY = y

            this.render()
            func(this.value)
        }

        this.dial.addEventListener('mousedown', mouseStart as EventListener)
        window.addEventListener('mousemove', mouseMove)
        window.addEventListener('mouseup', end)
    }

    render() {
        const imgDegreeOffset = 195
        this.dial.style.transform = 
            `rotate(${this.value * 320 + imgDegreeOffset}deg)`
    }
}

const MY_JS_DIALS = 
    [...document.querySelectorAll('.js-dial')]
    .map(dial => new JsDial(dial as HTMLDivElement))