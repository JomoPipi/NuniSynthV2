






import { createSubdivSelect3 } from "../../../nunigraph/view/create_subdivselect.js";
import { BufferStorage } from "../../../storage/buffer_storage.js";
import { SampleSelectComponent } from "../../../UI_library/components/sample_select.js";
import { createToggleButton } from "../../../UI_library/internal.js";
import { ADSR_Controller } from "../../adsr/adsr.js";
import { VolumeNodeContainer } from "../../volumenode_container.js";
import { PianoRollEditor } from "../pianoroll/pianoroll_editor.js";







export class SamplePianoRoll extends VolumeNodeContainer
 implements AudioNodeInterfaces<NodeTypes.SAMPLE_PIANOR> {
    
    isPlaying = true
    ctx : AudioContext
    private pianoRoll : PianoRollEditor
    private controller? : HTMLElement
    private detune : NuniAudioParam
    private playbackRate : NuniAudioParam
    private adsrValues : ADSRData =
        { attack: 0.010416984558105469
        , decay: 0.17708349227905273
        , sustain: 0.2166603088378906
        , release: 0.3812504768371582
        , curve: 'S'
        }

    constructor(ctx : AudioContext) {
        super(ctx)
        this.ctx = ctx
        this.detune = new NuniAudioParam(ctx)
        this.playbackRate = new NuniAudioParam(ctx)
        this.playbackRate.offset.value = 1
        // this.adsrValues 

        const playCallback = ({ start, end, n, sample } : { start : number, end : number, n : number, sample : number }) => {
            this.playSample(sample, start, end, n)
            // this.detune.offset.setValueAtTime(n * 100, start)
            // this.detune.offset.setValueAtTime(0, end)
        }
        const options = { editmode: 'dragpoly' } as const
        this.pianoRoll = new PianoRollEditor(this.ctx, playCallback, options)

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

    
    createSource(sample : number) {
        const src = this.ctx.createBufferSource()

        src.playbackRate.setValueAtTime(0, this.ctx.currentTime)
        this.detune.connect(src.detune)
        this.playbackRate.connect(src.playbackRate)
        src.buffer = BufferStorage.get(sample)
        // src.start(0)

        return src
    }

    playSample(sample : number, startTime : number, endTime : number, n : number) {

        const src = this.createSource(sample)
        // const key = 'Q'.charCodeAt(0) // noteData.keyIndex
        // src.detune.value = KB.scale[KB.keymap[key]]

        const adsr = new GainNode(this.ctx)
        adsr.gain.setValueAtTime(0, 0)

        adsr.connect(this.volumeNode)
        
        // Connect the source to the envelope
        src.connect(adsr)
        src.start(startTime)
        src.detune.value = n * 100

        // Schedule the envelope on
        ADSR_Controller.triggerSource(src, adsr.gain, startTime, -1, this.adsrValues)

        // Schedule the envelope off
        const stopTime = ADSR_Controller.untriggerAndGetStopTime(
            adsr.gain,
            endTime, 
            sample,
            this.adsrValues)
            
        src.stop(stopTime)
    }

    connect(destination : Destination) {
        this.volumeNode.connect(destination)
    }
    
    disconnect(destination? : Destination) {
        this.volumeNode.disconnect(destination)
    }

    private readonly SidePanelWidth = 100
    getController() {
        if (this.controller) return this.controller

        const snapToGrid = createToggleButton(this.pianoRoll, 'snapToGrid', { text: 'snap to grid' })
        const timeBaseSelect = createSubdivSelect3(this.pianoRoll.subdiv, value => this.pianoRoll.subdiv = value)
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
        
        const update = (bufferKey : number) => 
            this.pianoRoll.currentSample = bufferKey
        const sampleCanvas = 
            new SampleSelectComponent(update, 0)

            
        const sidepanel = E('div', { className: 'pianoroll-sidepanel' })
        sidepanel.style.width = this.SidePanelWidth + 'px'
        sidepanel.append(zoomControls, snapToGrid, timeBaseSelect, sampleCanvas.html)

        this.controller = E('div', { className: 'flat', children: [sidepanel, this.pianoRoll.controller] })
        return this.controller
    }
    
    scheduleNotes() {
        this.pianoRoll.scheduleNotes()
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
}