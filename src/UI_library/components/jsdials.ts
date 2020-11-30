import { doUntilMouseUp } from "../events/until_mouseup.js"







const classes = 
    [ 'shadow-knob'
    , 'shadow-knob2'
    ]

export class JsDial {
    
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

    constructor(CSS_classIndex? : number) {
        
        this.dial = E('div', { className: 'js-dial' })
        
        this.html = E('div', 
            { className: classes[CSS_classIndex || 0]
            , children: [this.dial]
            }) 
            
        this.lastY = this.lastX = 0
        this.max = 1
        this.value = this.min = this.sensitivity = 2**-8
        this.imgDegreeOffset = 195
        this.arcLength = 320
        this.update = (value : number) => {
            this.value = value
            this.render()
        }
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

        const mousedown = ({ clientX, clientY } : MouseEvent) => {
            this.lastX = clientX
            this.lastY = clientY
            startFunc && startFunc()
            this.render()
        }
        
        const mousemove = ({ clientX: x, clientY: y } : MouseEvent) => {
            
            this.value += (this.lastY - y + x - this.lastX) * this.sensitivity
            this.value = clamp(this.min, this.value, this.max)
            this.lastX = x
            this.lastY = y

            this.render()
            func(this.value)
        }

        const mouseup = () => { 
            endFunc && endFunc()
        }

        this.dial.onmousedown = doUntilMouseUp(mousemove, { mousedown, mouseup })

        this.update = (value : number) => {
            this.value = value
            func(value)
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
                ((this.value-this.min) / (this.max-this.min)) +
                this.imgDegreeOffset}deg)`
    }
}