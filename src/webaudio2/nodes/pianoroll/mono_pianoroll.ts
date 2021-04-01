






import { createSubdivSelect3 } from "../../../nunigraph/view/create_subdivselect.js"
import { createDraglineElement } from "../../../UI_library/components/dragline.js"
import { createToggleButton } from "../../../UI_library/internal.js"
import { PianoRollEditor } from "./pianoroll_editor.js"







export class MonoPianoRoll 
    implements AudioNodeInterfaces<NodeTypes.PIANOR> {

    isPlaying = true
    private ctx : AudioContext
    private csn : ConstantSourceNode
    private pianoRoll : PianoRollEditor
    private controller? : HTMLElement

    constructor(ctx : AudioContext) {
        this.ctx = ctx
        this.csn = ctx.createConstantSource()
        this.csn.start()
        
        const playCallback = (sample : number, start : number, n : number) => {
            this.csn.offset.setValueAtTime(n * 100, start)
            return (end : number) => this.csn.offset.setValueAtTime(0, end)
        }

        this.pianoRoll = new PianoRollEditor(this.ctx, playCallback)

        for (const prop of Object.keys(Transferable_Pianoroll_properties))
        {
            Object.defineProperty(this, prop, { 
                get() {
                    return this.pianoRoll[prop]
                }, 
                set(value : any) {
                    this.pianoRoll[prop] = value
                }
            })
        }

        this.play()
    }

    connect(destination : Destination) {
        this.csn.connect(destination)
    }
    
    disconnect(destination? : Destination) {
        this.csn.disconnect(destination)
    }

    private readonly SidePanelWidth = 100
    getController() {
        if (this.controller) return this.controller

        const snapToGrid = createToggleButton(this.pianoRoll, 'snapToGrid', { text: 'snap to grid' })
        const timeBaseSelect = 
            createSubdivSelect3(this.pianoRoll.subdiv, value => this.pianoRoll.subdiv = value)//, { min: 2 })
        const buttons = () => 
            [ E('div', { className: 'push-button nice-btn', text: '-' })
            , E('div', { className: 'push-button nice-btn', text: '+' })
            ]
        const zoomX = E('span', { children: buttons(), className: 'flat-grid' })
        const zoomY = E('span', { children: buttons().reverse(), className: 'vert-flat-grid' })
        const zoomControls = E('div', { className: 'space-evenly', children: [zoomX, zoomY] })
            zoomControls.onmousedown = e => {
                const btn = e.target as HTMLElement
                if (!'+-'.includes(btn.innerText)) return
                const x_axis = zoomX.contains(btn)
                const amount = btn.innerText === '-' ? 0.2 : -0.2
                this.pianoRoll.zoom(x_axis, amount)
            }

        const sidepanel = E('div', { className: 'pianoroll-sidepanel' })
        sidepanel.style.width = this.SidePanelWidth + 'px'
        sidepanel.append(zoomControls, snapToGrid, timeBaseSelect)

        this.controller = E('div', { className: 'flat', children: [sidepanel, this.pianoRoll.controller] })
        return this.controller
    }
    
    scheduleNotes(skipAhead : boolean) {
        this.pianoRoll.scheduleNotes(skipAhead)
    }

    setTempo(tempo : number) {
        this.pianoRoll.setTempo(tempo)
    }

    play() {
        this.isPlaying = true
        this.pianoRoll.play()
    }

    sync() {}

    get MMLString() {
        return this.pianoRoll.getMMLString()
    }

    set MMLString(s : string) {
        this.pianoRoll.setMMLString(s)
    }
    
    updateBoxDimensions(H : number, W : number) {
        const barHeight = 25 // height of .draggable-window-bar
        this.pianoRoll.setDimensions(H - barHeight, W - this.SidePanelWidth)
    }

    keydown(e : KeyboardEvent) {
        this.pianoRoll.keydown(e)
    }
}