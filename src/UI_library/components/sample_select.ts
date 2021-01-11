






import { BufferUtils } from "../../buffer_utils/internal.js"








export class SampleSelectComponent {

    readonly html : HTMLElement

    private canvas : HTMLCanvasElement
    private ctx : CanvasRenderingContext2D
    private valueText : HTMLElement
    private currentImage : number

    constructor(updateFunc : (key : number) => void, initialImage : number) {
        this.canvas = E('canvas', { className: 'sample-canvas sample-sequencer-channel' })
        this.ctx = this.canvas.getContext('2d')!//, { alpha: false })!
        
        this.canvas.height = 35
        this.canvas.width = this.canvas.height * PHI | 0 // * PHI | 0

        this.valueText = E('span',
            { text: String.fromCharCode(65 + initialImage) 
            , className: 'center'
            })
            this.valueText.style.display = 'inline-block'
            this.valueText.style.width = '25px' // The rows need to stop being moved by the text
    
        this.currentImage = initialImage
        const btnContainer = ['🡅','🡇'].reduce((btnContainer, op, i) => { // change the buffer index
            const btn = E('button',
                { text: op
                , className: `next-sample-btn`
                })
            if (i === 1) btn.classList.add('bottom')
    
            btn.onclick = () => {
                const v = this.currentImage = clamp(0, 
                    this.currentImage + Math.sign(-i + .5), 
                    BufferUtils.nBuffers-1)
    
                this.valueText.innerText = String.fromCharCode(65 + v)

                updateFunc(v)
                this.setImage(v)
            }
            btnContainer.appendChild(btn)
            return btnContainer
        }, E('span', { className: 'vert-split' }))

        btnContainer.appendChild(this.valueText)

        this.html = E('div', { className: 'flex-center', children: 
            [ this.valueText
            , btnContainer
            , this.canvas
            ]})

        this.setImage(initialImage)
    }

    setImage(n : number = this.currentImage) {
        this.valueText.innerText = String.fromCharCode(65 + n)
        const imageData = BufferUtils.getImage(n, this.ctx, this.canvas.height, this.canvas.width)
        // this.ctx.putImageData(imageData, 0, 0)
    }

}