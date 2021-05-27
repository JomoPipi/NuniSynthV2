






import { createSubdivSelect3 } from "../../../nunigraph/view/create_subdivselect.js";
import { BufferStorage } from "../../../storage/buffer_storage.js";
import { SampleSelectComponent } from "../../../UI_library/components/sample_select.js";
import { createToggleButton } from "../../../UI_library/internal.js";
import { ADSR_Executor } from "../../adsr/adsr.js";
import { createADSREditor } from "../../adsr/adsr_editor.js";
import { VolumeNodeContainer } from "../../volumenode_container.js";
import { PianoRollEditor } from "../pianoroll/pianoroll_editor.js";

type MidiEvent = 
    { deltaTime : number
    , type : number
    , metaType : number
    , channel : number
    , data : any
    }
type MidiObject = 
    { formatType : number
    , tracks : number
    , track : { event : MidiEvent[] }[]
    , timeDivision : number
    }

export class SamplePianoRoll extends VolumeNodeContainer
 implements AudioNodeInterfaces<NodeTypes.SAMPLE_PIANOR> {
    
    isPlaying = true
    ctx : AudioContext
    private sampleCanvas : SampleSelectComponent
    private pianoRoll : PianoRollEditor
    private controller? : HTMLElement
    private detune : NuniAudioParam
    private playbackRate : NuniAudioParam
    private localADSR : ADSRData =
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
        
        const options = { editmode: 'dragpoly' } as const
        // this.pianoRoll = new PianoRollEditor(this.ctx, playCallback, options)
        this.pianoRoll = new PianoRollEditor(
            this.ctx,
            this.playSampleCurried.bind(this), 
            options)

        const update = (bufferKey : number) => 
            this.pianoRoll.currentSample = bufferKey

        this.sampleCanvas = 
            new SampleSelectComponent(update, 0)

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

    refreshBuffer(index : number) {
        if (index === this.sampleCanvas.bufferKey)
        {
            this.sampleCanvas.setImage(index)
        }
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

    // playSample(sample : number, startTime : number, endTime : number, n : number) {

    //     const src = this.createSource(sample)
    //     // const key = 'Q'.charCodeAt(0) // noteData.keyIndex
    //     // src.detune.value = KB.scale[KB.keymap[key]]

    //     const adsr = new GainNode(this.ctx)
    //     adsr.gain.setValueAtTime(0, 0)

    //     adsr.connect(this.volumeNode)
        
    //     // Connect the source to the envelope
    //     src.connect(adsr)
    //     src.start(startTime)
    //     src.detune.value = n * 100

    //     // Schedule the envelope on
    //     ADSR_Executor.triggerSource(src, adsr.gain, startTime, -1, this.localADSR)

    //     // Schedule the envelope off
    //     const stopTime = ADSR_Executor.untriggerAndGetStopTime(
    //         adsr.gain,
    //         endTime, 
    //         sample,
    //         this.localADSR)
            
    //     src.stop(stopTime)
    // }

    playSampleCurried(sample : number, startTime : number, n : number) {

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
        ADSR_Executor.triggerSource(src, adsr.gain, startTime, -1, this.localADSR)

        return (endTime : number) => {

            // Schedule the envelope off
            const stopTime = endTime + ADSR_Executor.untriggerAndGetReleaseLength(
                adsr.gain,
                endTime, 
                sample,
                this.localADSR)
                
            src.stop(stopTime)
        }
    }

    connect(destination : Destination) {
        this.volumeNode.connect(destination)
    }
    
    disconnect(destination? : Destination) {
        this.volumeNode.disconnect(destination)
    }

    private readonly SidePanelWidth = 100
    private nextFileReaderId = 0
    getController() {
        if (this.controller) return this.controller

        const snapToGrid = createToggleButton(this.pianoRoll, 'snapToGrid', 
            { text: 'snap to grid'
            , className: 'nice-btn2'
            })
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

        const writeMode = createToggleButton(this.pianoRoll, 'kbWriteMode',
            { text: 'WRITE'
            , className: 'nice-btn2'
            })
            
        const fileReader = E('input'); fileReader.type = 'file'
        fileReader.oninput = () => {
            console.log('yoyo')
            try {
                console.log('clearing sequence!')
                this.pianoRoll.clearSequence()
                ;(window as any).MidiParser.parse(fileReader, handleMidiData)
            }
            catch (e)
            { 
                console.log('Error!!!!!!!!!!!', e) 
            }
            const MidiEventTypes =
                { NOTE_OFF: 8
                , NOTE_ON: 9
                , NOTE_AFTERTOUCH: 10
                , CONTROLLER: 11
                , PROGRAM_CHANGE: 12
                , CHANNEL_AFTERTOUCH: 13
                , PITCH_BEND: 14
                } as const
            
            const pianoRoll = this.pianoRoll
            type Note = {
                time : number
                length : number
                n : number
                isSelected : boolean
                lastN : number
                lastT : number
                sample : number
            }
            function handleMidiData(o : MidiObject) {
                console.log('o.formatType =',o.formatType)
                if (o.formatType !== 1 && o.formatType !== 2) throw 'unsupported'
                const newSequence : Note[] = []
                let sample = 0
                o.track.slice(1).forEach(({ event }) => {
                    ++sample
                    if (event.length < 2) return;
                    const [_, { data: instrument }, ...track] = event
                    const notesThatNeedToEnd : Record<number,[number, number]> = {}
                    let noteTime = 0
                    if (instrument === 'Drums') { console.log('insstrument equals Drums!!'); return; }
                    console.log('instrument =',instrument)
                    for (const midiEvent of track)
                    {
                        const { data, type, deltaTime, metaType } = midiEvent
                        if (metaType === 47)
                        {
                            // console.log('END OF TRACk')
                            continue;
                        }
                        if (type === MidiEventTypes.PROGRAM_CHANGE)
                        {
                            console.log('IMPLEMENT INSTRUMENTS')
                            continue;
                        }
                        if (!Array.isArray(data)) throw 'Error parsing midi event: ' + JSON.stringify(midiEvent)
                        const [note, velocity] : number[] = data
                        noteTime += deltaTime / o.timeDivision
                        if (type === MidiEventTypes.NOTE_ON)
                        {
                            if (note in notesThatNeedToEnd && velocity === 0)
                            {
                                const [index, startTime] = notesThatNeedToEnd[note]
                                delete notesThatNeedToEnd[note]
                                const n = newSequence[index]
                                n.length = noteTime - startTime
                            }
                            else if (velocity > 0)
                            {
                                notesThatNeedToEnd[note] = [newSequence.length, noteTime]
                                const newNote : Note =
                                    { time: noteTime
                                    , length: -1
                                    , isSelected: false
                                    , n: note
                                    , lastN: note
                                    , lastT: noteTime
                                    , sample
                                    }
                                newSequence.push(newNote)
                            }
                        }
                    }
                    console.log(`Loading instrument: ${instrument}`)
                })
                console.log('seq.length =',newSequence.length)
                pianoRoll.setSequence(newSequence)
                console.log('yooo!!')
            }
        }
        fileReader.id = 'SamplePianoRollMidiFileReader' + (++this.nextFileReaderId).toString()
        fileReader.style.width = '0px'
        fileReader.style.display = 'none'
        fileReader.style.marginTop = '5px'
        const fileReaderLabel = E('label', 
            { className: 'neumorph2 push-btn'
            , text: 'MIDI' 
            })
            fileReaderLabel.htmlFor = fileReader.id
            // fileReaderLabel.style.paddingTop = 
        const fileReaderContainer = E('span', { children: [fileReaderLabel, fileReader] })

        const sidepanel = E('div', { className: 'pianoroll-sidepanel' })
        sidepanel.style.width = this.SidePanelWidth + 'px'
        sidepanel.append
            ( zoomControls
            , snapToGrid
            , timeBaseSelect
            , this.sampleCanvas.html
            , createADSREditor(this.localADSR, { orientation: 'square' })
            , writeMode
            , fileReaderContainer)

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

    sync() {
        this.pianoRoll.sync()
    }

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