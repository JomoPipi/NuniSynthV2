






const classes = [
    'shadow-knob',
    'shadow-knob2'
    ]

export class JsDial {
    
    [x : string] : unknown
    private isActive : boolean
    sensitivity : number
    lastY : number
    lastX : number
    value : number
    max : number
    min : number
    dial : HTMLElement
    html : HTMLElement
    imgDegreeOffset : number
    arcLength : number
    rounds : number
    update : (value : number) => void

    constructor(classIndex? : number) {
        
        this.dial = E('div', {
            className: 'js-dial'
            })
        
        this.html = E('div', {
            className: classes[classIndex || 0],
            children: [this.dial]
            }) 
            
        this.isActive = false
        this.lastY = this.lastX = 0
        this.max = 1
        this.value = this.min = this.sensitivity = 2**-8
        this.imgDegreeOffset = 195
        this.arcLength = 320
        this.update = x => void 0
        this.rounds = 1
    }

    set size(px : number) {
        this.dial.style.width = 
        this.dial.style.height =
        this.html.style.width = 
        this.html.style.height =
            px + 'px'
    }
    
    attach(func : (n : number) => void, startFunc? : Function, endFunc? : Function) {
        const start = (x:number, y:number) => { 
            this.lastX = x
            this.lastY = y
            this.isActive = true
            startFunc && startFunc()
            this.render()

            window.addEventListener('mousemove', mouseMove)
            window.addEventListener('mouseup', end)
        }
        const end = () => { 
            this.isActive = false
            endFunc && endFunc()
            
            window.removeEventListener('mousemove', mouseMove)
            window.removeEventListener('mouseup', end)
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
        this.update = (value : number) => {
            this.value = value
            this.render()
        }

        this.render()
    }

    attachDoubleClick(func : Function) {
        this.dial.ondblclick = () => {
            func(this.value)
            this.render()
        }
    }

    render() {
        this.dial.style.transform = 
            `rotate(${
                this.rounds * this.arcLength * 
                ((this.value-this.min)/(this.max-this.min)) +
                this.imgDegreeOffset}deg)`
    }
}