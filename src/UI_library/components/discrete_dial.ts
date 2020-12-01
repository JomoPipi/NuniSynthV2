






import { doUntilMouseUp } from "../events/until_mouseup.js"







export function createDiscreteDialComponent(
    initialIndex : number, 
    optionList : string[], 
    fn : (s : string) => void) {
    
    const textBox = E('div', { className: 'number-input-2', text: optionList[initialIndex] })
    const dial = new DiscreteDial(optionList.length)

        dial.value = initialIndex

        dial.onrotation(i => {
            fn(optionList[i])
            textBox.innerText = optionList[i]
        })

    const container = E('div', 
        { className: 'number-dial-container'
        , children: [textBox, dial.html]
        })

    return { container }
    // return E('div', { text: 'TODO' })
}

const classes = 
    [ 'shadow-knob'
    , 'shadow-knob2'
    ]

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

    private realValue = 1e9
    // private readonly realValue_OFFSET = 1e9
    private lastX : number = 0
    private lastY : number = 0

    constructor (n : number, CSS_classIndex? : number) {
        this.n = n 
        
        // this.dial = E('div', { className: 'js-dial' })
        
        // this.html = E('div', 
        //     { className: classes[CSS_classIndex || 0]
        //     , children: [this.dial]
        //     }) 
            
        // this.isActive = false
        // this.lastY = this.lastX = 0
        // this.max = 1
        // this.value = this.min = this.sensitivity = 2**-8
        // this.imgDegreeOffset = 195
        // this.arcLength = 320
        // this.update = (value : number) => {
        //     this.value = value
        //     this.render()
        // }
        // this.rounds = 1
        this.dial = E('div', { className: 'js-dial' })

        this.html = E('div',
            { className: classes[CSS_classIndex || 0]
            , children: [this.dial]
            })
    }

    onrotation(fn : (index : number ) => void) {
        const mousedown = ({ clientX, clientY } : MouseEvent) => {
            this.lastX = clientX
            this.lastY = clientY
            this.render()
        }
        
        const mousemove = ({ clientX: x, clientY: y } : MouseEvent) => {
            
            this.realValue += (this.lastY - y + x - this.lastX)
            
            this.value = Math.round(this.realValue / 100) % this.n
            this.lastX = x
            this.lastY = y

            this.render()
            fn(this.value)
        }

        this.dial.onmousedown = doUntilMouseUp(mousemove, { mousedown })

        this.update = (value : number) => {
            this.value = value
            fn(value)
            this.render()
        }

        this.render()
    }

    render() {
        console.log('realvalue =',this.realValue)
        this.dial.style.transform = 
            `rotate(${
                -this.rounds * this.arcLength *
                Math.round(this.realValue / 100) * 100 +
                this.imgDegreeOffset}deg)`
    }
}