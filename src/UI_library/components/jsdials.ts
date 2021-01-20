






import { doUntilMouseUp } from "../events/until_mouseup.js"

type Options = {
    mousedown? : MouseHandler
    mouseup? : MouseHandler
}

export class JsDial {
    
    sensitivity : number
    private x_sensitivity = 2 ** -4
    value : number
    max : number
    min : number
    dial : HTMLElement
    html : HTMLElement
    imgDegreeOffset : number
    arcLength : number
    rounds : number
    update : (value : number) => void
    doubleClick? : (value : number) => void

    constructor(CSS_classIndex? : number, knobClassIndex? : number) {
        
        this.dial = E('div', { className: `js-dial _${knobClassIndex || 0}` })
        
        this.html = E('div', 
            { className: `shadow-knob _${CSS_classIndex || 0}`
            , children: [this.dial]
            }) 

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

    attachDoubleClick(func : Function) {
        // Won't do anything if attach isn't called
        this.doubleClick = () => func(this.value)
    }
    
    attach(func : (n : number) => void, { mousedown, mouseup } : Options = {}) {
        const doubleClickDelay = 500
        let lastClickTime = 0

        const _mousedown = (e : MouseEvent) => {
            mousedown && mousedown(e)
            const now = Date.now()
            if (this.doubleClick && now - lastClickTime <= doubleClickDelay)
            {
                this.doubleClick(this.value)
            }
            lastClickTime = now
            this.render()
            this.dial.requestPointerLock()
        }

        const LIMIT = 100
        const _mousemove = ({ movementX: dx, movementY: dy } : MouseEvent) => {
            const sum = Math.abs(dx) + Math.abs(dy)
            if (sum > LIMIT) return; // <- Helps mitigate a Chrome bug.

            this.value += (-dy + dx * this.x_sensitivity) * this.sensitivity
            this.value = clamp(this.min, this.value, this.max)

            this.render()
            func(this.value)
        }

        const _mouseup = (e : MouseEvent) => {
            document.exitPointerLock()
            mouseup && mouseup(e)
        }

        this.dial.onmousedown = doUntilMouseUp(
            { mousedown: _mousedown
            , mousemove: _mousemove
            , mouseup: _mouseup
            })

        this.update = (value : number) => {
            this.value = value
            func(value)
            this.render()
        }

        this.render()
    }

    render() {
        this.dial.style.transform = 
            `rotate(${
                this.rounds * this.arcLength * 
                ((this.value-this.min) / (this.max-this.min)) +
                this.imgDegreeOffset}deg)`
    }
}

// non-pointerlocking events:
// const _mousedown = (e : MouseEvent) => {
//     const { clientX, clientY } = e
//     this.lastX = clientX
//     this.lastY = clientY
//     mousedown && mousedown(e)
//     this.render()
//     hideCursor.classList.add('show')
// }

// const _mousemove = ({ clientX: x, clientY: y } : MouseEvent) => {
//     this.value += (this.lastY - y + (x - this.lastX) * this.x_sensitivity) * this.sensitivity
//     this.value = clamp(this.min, this.value, this.max)
//     this.lastX = x
//     this.lastY = y

//     this.render()
//     func(this.value)
// }

// const _mouseup = (e : MouseEvent) => {
//     hideCursor.classList.remove('show')
//     mouseup && mouseup(e)
// }