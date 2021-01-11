






import { doUntilMouseUp } from "../events/until_mouseup.js"

type Options = {
    mousedown? : MouseHandler
    mouseup? : MouseHandler
    CSS_classIndex? : number
}

export function createDiscreteDialComponent(
    initialIndex : number, 
    optionList : string[], 
    fn : (s : string, index : number) => void,
    options : Options = {}) {
    
    const textBox = E('div', { className: 'number-input-2', text: optionList[initialIndex] })
    const dial = new DiscreteDial(optionList.length, options)

        dial.onrotation(i => {
            fn(optionList[i], i)
            textBox.innerText = optionList[i]
        }, { mouseup: options.mouseup })

        dial.update(initialIndex)

    const container = E('div', 
        { className: 'number-dial-container'
        , children: [textBox, dial.html]
        })

    return (
        { container
        , getIndex() { return dial.value }
        , setIndex(i : number) { dial.update(i) }
        })
}

// const classes = 
//     [ 'shadow-knob'
//     , 'shadow-knob2'
//     ]
    
class DiscreteDial {
    readonly n : number
    value : number = 0
    tickLength : number = 30
    dial : HTMLElement
    html : HTMLElement
    rounds : number = 1
    arcLength : number = 320
    imgDegreeOffset = 195
    update : Function = (value : number) => {}
    options : Options

    private realValue = 1e9 + this.tickLength * 3
    // private readonly realValue_OFFSET = 1e9

    constructor (n : number, options : Options) {
        this.n = n 
        this.options = options
        
        this.dial = E('div', { className: 'js-dial' })
        // this.dial = E('div', { className: `js-dial _${knobClassIndex || 0}` })
        
        this.html = E('div', 
            { className: `shadow-knob _${options.CSS_classIndex || 0}`
            , children: [this.dial]
            }) 
            

        this.update(0)
    }

    onrotation(fn : (index : number ) => void, { mousedown: md, mouseup: mu } : Options = {}) {

        const _mousedown = (e : MouseEvent) => {
            md && md(e)
            this.html.requestPointerLock()
            this.render()
        }
        const mousemove = ({ movementX: dx, movementY: dy } : MouseEvent) => {
            this.realValue += -dy + dx
            this.value = Math.round(this.realValue / this.tickLength) % this.n

            this.render()
            fn(this.value)
        }
        const _mouseup = (e : MouseEvent) => {
            mu && mu(e)
            requestAnimationFrame(() => // Avoid interrupting double click
            document.exitPointerLock())
        }

        this.dial.onmousedown = doUntilMouseUp(mousemove, { mousedown: _mousedown, mouseup: _mouseup })

        this.update = (value : number) => {
            const oldvalue = this.value
            this.value = value
            this.realValue += (value - oldvalue)  * this.tickLength
            fn(value)
            this.render()
        }

        this.render()
    }

    render() {
        this.dial.style.transform = 
            `rotate(${
                -this.rounds * this.arcLength *
                Math.round(this.realValue / this.tickLength) * 100 +
                this.imgDegreeOffset}deg)`
    }
}

// Non-pointerlocking events:
// const mousedown = ({ clientX, clientY } : MouseEvent) => {
//     this.lastX = clientX
//     this.lastY = clientY
//     this.render()
// }

// const mousemove = ({ clientX: x, clientY: y } : MouseEvent) => {
    
//     this.realValue += (this.lastY - y + x - this.lastX)
    
//     this.value = Math.round(this.realValue / this.tickLength) % this.n
//     this.lastX = x
//     this.lastY = y

//     this.render()
//     fn(this.value)
// }

// this.dial.onmousedown = doUntilMouseUp(mousemove, { mousedown, mouseup: this.options.mouseup })