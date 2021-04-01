






import { MasterClock } from '../master_clock.js'
import { VolumeNodeContainer } from '../../volumenode_container.js'
import { JsDial } from '../../../UI_library/internal.js'
import { sequencerControls } from './sequencer_controls.js'

type ChannelData = {
    volume : number // Deprecated
    bufferKey? : number
    }

export abstract class Sequencer extends VolumeNodeContainer {
    /**
     * This creates an N-step sequencer out of
     * whatever inputs are connected to it.
     */
    nSteps = 8
    private _subdiv = 8
    private currentStep = 0
    private startTime = 0
    private noteTime = 0
    phaseShift = 0
    adsrIndex = 0
    soloChannel = -1
    mutedChannel : Indexable<boolean>
    stepMatrix : Record<number|string,boolean[]>
    
    readonly ctx : AudioContext
    protected tick : number
    private controls? : HTMLElement
    private tempo = 120
    HTMLGrid : HTMLElement
    isPlaying : boolean
    private HTMLBoxes : Indexable<Indexable<HTMLElement>>
    channelData : Indexable<ChannelData>
    channelVolumes : Indexable<GainNode>
    hasDoneTheDirtyWork = false // See painful bugfix in NuniGraphNode.ts
    private dialogBoxIsOpen = false
    localADSR : ADSRData =
        { attack: 0.010416984558105469
        , decay: 0.17708349227905273
        , sustain: 0.2166603088378906
        , release: 0.3812504768371582
        , curve: 'S'
        }

    volumeLevelUpperLimit = 1
    private _volumeLevel = 1
    get volumeLevel() {
        return this._volumeLevel
    }
    set volumeLevel(level : number) {
        this._volumeLevel = level
        this.volumeNode.gain.value = level
    }

    constructor(ctx : AudioContext) {
        super(ctx)
        this.ctx = ctx
        this.tick = (60*4 / MasterClock.getTempo()) / this._subdiv
        this.HTMLGrid = createBeatGrid()
        this.isPlaying = false // true // <- Wait for properties to arrive first
        this.stepMatrix = {}
        this.mutedChannel = {}
        this.HTMLBoxes = {}
        this.channelData = {}
        this.channelVolumes = {}
        this.setTempo(MasterClock.getTempo())
    }

    getController() {
        this.dialogBoxIsOpen = true
        return this.controls || (this.controls = sequencerControls(this))
    }

    deactivateWindow() {
        this.dialogBoxIsOpen = false
    }

    setTempo(tempo : number) {
        this.tempo = clamp(1, tempo, Infinity)
        this.tick = (60 * 4 / tempo) / this._subdiv
    }

    set subdiv(subdivision : number) {
        this._subdiv = subdivision
        this.tick = (60 * 4 / this.tempo) / this._subdiv
    }
    get subdiv() {
        return this._subdiv
    }

    updateSteps(nSteps : number) {
        const m = this.stepMatrix
        for (const key in this.stepMatrix) 
        {
            m[key] = m[key]
                .concat(Array<boolean>(Math.max(0, nSteps - m[key].length)).fill(false))
                .slice(0, nSteps)
        }
        this.nSteps = nSteps
    }

    duplicateSteps() {
        const m = this.stepMatrix
        for (const key in this.stepMatrix) 
        {
            m[key] = m[key].concat(m[key].slice())
        }
        this.nSteps *= 2
    }

    sync() {
        this.stop()
        this.play()
    }

    play() {
        this.noteTime = 0
        this.startTime = 0
        this.currentStep = 0
        this.isPlaying = true
        const measureLength = this.tick * this.nSteps
        const t = Math.max(0, this.ctx.currentTime - measureLength)
        this.noteTime = Math.floor(t / measureLength) * measureLength
    }

    stop() {
        this.isPlaying = false

        for (const key in this.HTMLBoxes) 
        {
            for (const step in this.HTMLBoxes[key]) 
            {
                this.HTMLBoxes[key][step].classList.remove('highlighted')
            }
        }
        // this.controls.unhighlightGrid()
    }

    scheduleNotes(skipAhead : boolean) {

        const time = this.ctx.currentTime
        const currentTime = time - this.startTime

        if (skipAhead) // Skip ahead to prevent lag:
        {
            const steps = (currentTime - this.noteTime) / this.tick | 0
            this.noteTime += this.tick * steps
            this.currentStep = (this.currentStep + steps) % this.nSteps
        }

        while (this.noteTime < currentTime + 0.200) 
        {
            const patternTime = this.noteTime + this.startTime + this.phaseShift * this.tick
            if (patternTime > time) 
            { 
                this.playStepsAtTime(patternTime)
            }
            this.nextNote()
        }
    }

    private nextNote() {
        this.currentStep++
        if (this.currentStep >= this.nSteps) this.currentStep = 0
        this.noteTime += this.tick
    }

    private playStepsAtTime(time : number) {
        const boxIsVisible = this.HTMLGrid.offsetParent != null

        if (boxIsVisible !== this.dialogBoxIsOpen) throw 'yo???'

        const playRow = (key : number) => {
            if (this.dialogBoxIsOpen) // Highlight steps if user can see them:
            {
                const lastStep = (this.currentStep + this.nSteps - 1) % this.nSteps
                this.HTMLBoxes[key][this.currentStep]?.classList.add('highlighted')
                this.HTMLBoxes[key][lastStep]?.classList.remove('highlighted')
            }
            if (this.stepMatrix[key][this.currentStep] && !this.mutedChannel[key]) 
            {
                this.playStepAtTime(key, time)
            }
        }

        if (this.soloChannel >= 0) 
        {
            playRow(this.soloChannel)
        }
        else 
        {
            for (const key in this.channelVolumes)
            {
                playRow(+key)
            }
        }
    }

    abstract playStepAtTime(key : number, time : number) : void

    refresh() {
        this.setupGrid()
    }

    protected createStepRow() {
        const row  = Array<boolean>(this.nSteps).fill(false)
        row[0] = true
        return row
    }

    setupGrid() {
        //! If bugs arise, we can try this in hopes to fix it..
        // if (!this.hasDoneTheDirtyWork) return;

        this.HTMLGrid.innerHTML = ''
        this.HTMLBoxes = {}
        const grid = this.HTMLGrid
        const { nSteps, channelData, mutedChannel, channelVolumes } = this
        
        const soloButtons : HTMLButtonElement[] = []

        for (const key in channelVolumes) 
        {
            const row = E('div', { className: 'flat-grid' })
            const stepRow = E('div', { className: 'sequencer-step-row' })

            this.HTMLBoxes[key] = {}
            const height = clamp(25, 140 / nSteps**0.5, 35)
            const width = height / 2 // (1 + (PHI - 1)/2)
            for (let i = 0; i < nSteps; ++i) 
            {
                const box = E('span')
                this.HTMLBoxes[key][i] = box
                box.classList.add('note-box'
                    , ...(i === 0 
                    || i === nSteps / 2 
                    || i === nSteps / 4
                    || i === nSteps * 3 / 4 
                    ? ['halfway']
                    : []))
                box.style.width = `${width}px`
                box.style.height = `${height}px`
                // log('key =',key,', stepmatrix =',this.stepMatrix)
                // log('channelData =',channelData)
                box.classList.toggle('selected', this.stepMatrix[key][i])
                box.dataset.sequencerKey = `${key}:${i}`
                stepRow.appendChild(box)
            }
            
            row.append(
                rowOptions(this.additionalRowItems(+key), key), 
                stepRow,
                E('span')) // <- Centers the stepRow

            grid.appendChild(row)
        }

        const setButtonState = (r : number, c : number, on : boolean) => {
            this.HTMLBoxes[r][c].classList.toggle('selected', on)
            this.stepMatrix[r][c] = on
        }
        
        grid.onmousedown = (e : MouseEvent) => {
            const box = e.target as HTMLElement
            if (box.dataset.sequencerKey) // Grid buttons
            {
                const turnOn = box.classList.toggle('selected')
                const [key, i] = box.dataset.sequencerKey.split(':').map(Number)
                const rowState = this.stepMatrix[key].slice()

                this.stepMatrix[key][i] = turnOn
                
                const row = box.parentElement!
                let lastEntered = i
                row.onmousemove = (e : MouseEvent) => {
                    const box = e.target as HTMLElement
                    if (box.dataset.sequencerKey) // Grid buttons
                    {
                        const [_,j] = box.dataset.sequencerKey.split(':').map(Number)
                        if (j !== lastEntered)
                        {
                            const [start, end] = [i,j].sort((a,b) => a - b)
                            for (let c = 0; c < this.nSteps; ++c)
                            {
                                const flip = start <= c && c <= end
                                setButtonState(key, c, flip !== rowState[c])
                            }
                        }
                        lastEntered = j
                    }
                }
                window.onmouseup = mouseup
                function mouseup() {
                    row.onmousemove = null
                    window.removeEventListener('mouseup', mouseup)
                }
            }
            else if (box.dataset.sequencerRowKey) // Mute/Solo buttons
            {
                const key = +box.dataset.sequencerRowKey
                const mutesolo = box.innerText
                const activate = box.classList.toggle('selected')
                if (mutesolo === 'M') 
                {
                    this.mutedChannel[key] = activate
                }
                else if (mutesolo === 'S') 
                {
                    // Deselect the other solo buttons
                    for (const button of soloButtons) 
                    {
                        if (button !== e.target) 
                        {
                            button.classList.remove('selected')
                        }
                    }
                    this.soloChannel = activate ? key : -1
                }
            }
        }

        function rowOptions(items : HTMLElement[], key : string) {
            const box = E('span', { className: 'flex-center' })
            box.append(...items)

            mute_solo_box: {
                // const muteSoloBox = E('span')
                const mute = E('button', 
                    { className: 'nice-btn'
                    , text: 'M'
                    })
                const solo = E('button', 
                    { className: 'nice-btn'
                    , text: 'S'
                    })
                    
                // optionsBtn.innerText = '⚙️'
                mute.dataset.sequencerRowKey =
                solo.dataset.sequencerRowKey = key
                mute.classList.toggle('selected', mutedChannel[key] === true)
                // muteSoloBox.append(...items, mute, solo)
                box.append(mute,solo)
                // soloButtons.push(solo)

                // box.appendChild(muteSoloBox)
            }
            
            add_volume_knob: {
                // const value = channelData[key].volume 
                const value = channelVolumes[key].gain.value
                
                const dial = new JsDial()
                dial.min = 0.1
                dial.max = Math.SQRT2
                dial.value = value**(1/4.0)
                dial.sensitivity = 2**-9
                dial.imgDegreeOffset = 200
                dial.size = 30
                dial.render()

                const valueText = E('span', { text: volumeTodB(value).toFixed(1) + 'dB' })
                    valueText.style.display = 'inline-block'
                    valueText.style.width = '54px' // The rows need to stop being moved by the text
                    
                dial.attach((value : number) => {
                    const v = value ** 4.0
                    channelData[key].volume = v
                    channelVolumes[key].gain.value = v
                    
                    valueText.innerText = 
                        volumeTodB(v).toFixed(1) + 'dB'
                })

                dial.attachDoubleClick(() => {
                    dial.value = 1
                    channelData[key].volume = 1
                    channelVolumes[key].gain.value = 1
                    valueText.innerText = '0.0dB'
                })

                box.append(dial.html, valueText)
            }

            return box
        }
    }

    protected additionalRowItems(key : number) : HTMLElement[] {
        // Override this function in a child class.
        return []
    }
}

function createBeatGrid() {
    const grid = E('div')

    grid.style.marginBottom = '5px'
    
    return grid
}