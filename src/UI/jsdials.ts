






class JsDial {
    
    [x : string] : unknown
    isActive : boolean
    sensitivity : number
    lastY : number
    lastX : number
    value : number
    max : number
    min : number
    dial : HTMLElement
    html : HTMLElement

    constructor() {
        this.dial = E('div')
        this.dial.classList.add('js-dial')
        this.html = E('div') 
        this.html.classList.add('shadow-knob')
        this.html.appendChild(this.dial)
        this.isActive = false
        this.lastY = this.lastX = 0
        this.max = 1
        this.value = this.min = this.sensitivity = 2**-7
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
            if (y === 0) log('onwheel event')
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
            `rotate(${
                320 * 
                ((this.value-this.min)/(this.max-this.min)) +
                imgDegreeOffset}deg)`
    }
}