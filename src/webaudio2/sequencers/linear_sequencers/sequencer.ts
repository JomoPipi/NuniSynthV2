






import { MasterClock } from '../master_clock.js'
import { VolumeNodeContainer } from '../../volumenode_container.js'
import { JsDial } from '../../../UI_library/internal.js'
import { sequencerControls } from '../sequencer_controls.js'

type ChannelData = {
    volume : number // Deprecated
    bufferKey? : number
    }

type CurveType = 'linear' | 'logarithmic' | 'exponential' | 'S'
type ADSRData = 
    { attack: number
    , decay: number
    , sustain: number
    , release: number
    , curve: CurveType
    }


export abstract class Sequencer extends VolumeNodeContainer {
    /**
     * This creates an N-step sequencer out of
     * whatever inputs are connected to it.
     */
    nSteps = 8
    private _subdiv = 8
    currentStep = 0
    startTime = 0
    noteTime = 0
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
    protected HTMLBoxes : Indexable<Indexable<HTMLElement>>
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

    constructor(ctx : AudioContext) {
        super(ctx)
        this.ctx = ctx
        this.tick = (60*4 / MasterClock.getTempo()) / this._subdiv
        this.HTMLGrid = createBeatGrid()
        this.isPlaying = true
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

    scheduleNotes() {
        if (!this.isPlaying) return;
        const time = this.ctx.currentTime
        const currentTime = time - this.startTime
        
        while (this.noteTime < currentTime + 0.200) 
        {
            const patternTime = this.noteTime + this.startTime + this.phaseShift * this.tick
            if (patternTime > time) 
            { 
                this.playStepsAtTime(patternTime)//, updateBox)
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

        const playRow = (key : number) => {
            if (this.dialogBoxIsOpen) // Highlight steps if user can see them:
            {
                this.HTMLBoxes[key][this.currentStep]?.classList.add('highlighted')
                const lastStep = (this.currentStep + this.nSteps - 1) % this.nSteps
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
        else {
            for (const key in this.channelData)
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
        this.HTMLGrid.innerHTML = ''
        this.HTMLBoxes = {}
        const grid = this.HTMLGrid
        const { nSteps, channelData, mutedChannel, channelVolumes } = this
        const soloButtons : HTMLButtonElement[] = []

        for (const key in channelVolumes) 
        {
            const row = E('div', { className: 'sequencer-step-row-container' })
            const stepRow = E('div', { className: 'sequencer-step-row' })

            this.HTMLBoxes[key] = {}
            const height = clamp(25, 140 / nSteps**0.5, 35)
            const width = height / 2 // (1 + (PHI - 1)/2)
            for (let i = 0; i < nSteps; i++) 
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
                            for (let c = 0; c < this.nSteps; c++)
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

            mute_solo_box: {
                const muteSoloBox = E('span')
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
                muteSoloBox.append(...items, mute, solo)
                soloButtons.push(solo)

                box.appendChild(muteSoloBox)
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

    additionalRowItems(key : number) : HTMLElement[] {
        // Override this function in a child class.
        return []
    }
}

// {"connectiăs":Ā2Č[ĀidČ31,āăąćĉnTypeČāhaĄel"},ĒĔ:32ĘĂħĜăğġģcĥħĩ}]Ę10ĐĭĕėęĴĈĶĠĢ:ĤĦąĽĬ"ēĕıŇěŉĞŋĹĻŐĪĿ"14ŃœĮĖĲĚĆřķŌŎļĪŒŔįŖĳŘĝŬŜŏĨşĘ21ŤŲŧŗŪŷśōĺźőńųŨňƅĸƇŝŻľĘĖƀĮ0ƍŶŊƐŮŞƔ"İƗČƙƃĵŚƝƈůľī"nodeċ:đťƤĘtƆ"gain"ƸitlŭƼƾǀ"xƤ.36Ęyǋ1138069ž6757741ŖaudĉNưŌ{ƭǢǤoParamValuƲČĀǆƿ:0.25}īƋŖƹƝoscillatorǈĈǃŭȇȉȋȍȏǈǊǼ.443946303Ȟž015Ǐǋ8471Ȯ27İǕ2983ĘǫǥǧǸātțĀtempoČǓ7ǾŁ93ǛƭADSRƳĀ6ɘ42łč"rĨeaseIĮ-1ȁĘvoǵmeǦƱǸƭMONOČɘ6ɚƥkbMȾōƯąǈsourcǷɝɹɻȿĥsStǯɄĮtrǶɩ"ʆtputƳ[Š_ȅŭsƾĢĘƱtuʃɝsʈɲƭfɟqǶncǐʮʰčȁǪǣȽƱŸōʦʃȻʿǭǯǱǳǵʊĀʳeʵeʷʹ616Ǿȴ8ȱ35ȩ48ʩeʫʭ0ɩƋŁƸƺȕȊȌȎȐǁȓģ˫ȗˮȚǋ2ȹȡȣȥȧŁȪȬȜȮȰȲȴ˸0ȷȹˆǬɰǨɀɂ"ɄɆɈ:ɊɌ0ɎɐĘɒɔɖ"ʌɛȿɟǄɢɤɦɨƭɫɭɯʀǩĘɴɶɸəɛĘɽɿɱʁăʨ"ʅʇʉ̝̟ɜĀʏʑʓeʕʗeʙʛʝʟĐʢʤģ˄̺ʪʬ̍ʯcʱĘˏˑ˓ȿ͗ʱʾ̋ǧ˂̻ʧǈȼˈǰǲǴǶ̝͛ʶʸČ4ȩ.5ǔȳȯ7ǖ82Ⱥ"͔ˤ˦ƶ̔4˩ȆȈˬȘ˯̐ǂǄ˲Έ˴șĘțǽ6ȥ˺ȤȦɚŁ̗̀ǽ̂ȱɚ̅ȶȸ;ͨ̌ȿć̏̑ɇɉɏ̖̘Ȁ̚ɓɕȿ̡̀ɠ̤ɥČɧʙ̩uɮΨʼ̮ɵɷ:̴̀ɾʀƮ̹ʄʆʈˍ̞̲́"̓ʒrʔČʖʘƭ͋ʞʠ͏ƺ͒ǈ΀͖ʻǩʲʴͰʹĀ͟ʼʙΧͣϢͦ̊ĉǮͪˋͭȿͯ˒ͱ:ȡ5.Ȯ˕199ȩǗɘˡˣŌ˥Ȃ΃žΆȔΐ˭ΒΌ˱ō˳Е΋Δ.ǠȠȢΙ˽˞7ΞЂȯΡȳȵ̇ΥϵoςĀΪȿά̓̕Ȩαɑδ̿ϓθ̣ɣλ:ν̨ɬπ̷̫̭"̯φψ"̵ϋʂ̺̼ϐлɺ̠ɝϖ͇ͅϜĘϞ͍ƴϡƝϣЋ͕͞ϧʙϼ͝ʺ͘ϯ͡ˀeͤѢ"ͨϷˊͬϑѨϾ2˕.6ǿ56Ͷ005ȸХͿˢѤǼ΂Ɓņ͐˃ubgǰph-ɣ͜ʉ΋ȒΎҏґғҕҗͰeМ˷7ІҧҨҩ҆ʹǽ4552ȳ68ǚȥ̗ҀЮа̎гɅέ̔ίзɏβ"̛εɝďɝ̢ɡп̦ƭŁнӋ̥μɨŀţӉιӌӓƭžӐκӍу̪аƭnʑepƳǠĘsɄpMȍrȉӈ[fǴɣ,ϛe,ƙӼӸ͈ӻӾǶ,ӵlӷԄӷƙӹŠӏƴƙԇӺӹԀԑԏԃӶӺԉӿԘԂ0ԋӖ[ԑԎԖԀԔԚԗԀԡԅԗŠӜԍԧԁԦӽԤԯԧ]ƭmʞ͆CƒĩσόɄTiɮČǿɋ8ȴŢΖɏЅǘӪϗtՀՂį3ǌ;cʇɟntӥpĕĘisPȌyƾgϚӿΌckǑҮ7Ζ9ǞǝҀȱˠ"wƾdowIsOġǻԔ"HTMLGӰĮшւքBoxϑ2ǼɲŽ̔֒"֐ӈш֐3֕֐Ӗ֙:5֜χ֢7֢8֢9֢Ԍ֟ǒ֕Ł֑Խ֯ſֱ0:֘ӎִֵ֛:ֵָ֮֞֠6׀:ֻֻֻ֥֧֩֫־ֱ֭4ְшŢ֔׎ֶ֮׏ֺב׏ֽӕֿהׂהׅי:ׇע׉ע׋ל׍֙1אӛ׬ֳ׫וԽžį֜׬כ֖׬֡׳׬ןױס׮ף׶Ͽ؃ר׹̔װʽЮѴͫˌɖҋŦȄϢҐҒaҔҖːҢҚ΍ʥؔҟؘҘң˶ȜȞЦҮҰҲҴͺȤ9ҸѲˇҺвɝдήɋӁ̙ӄкȿ֘ɞӘӒсӔšϔӊӞӚӕӝәـ׮وؿтɪфρ̬ӣ՛Ƴǎ̻ӬӮʖӱػĐԔԠԮԊŀɜ[ԨӷٟԓԖԝĐٟԲԤԫֳ٤٠ԙӻԵĘԷʔԺƉ֕ƯԿՁŌѻžح̗ͳ˕ɏխՍʓՐŌұ9.ҧ3ڐڑڒĲ՗˒՚ӬƷœՠբդզԂըժȜȷȪځ49үΙڇյշչջս˒Čր֊օև֕ڳ֌֎̝֐́ӛדַ֟֓טڽ׸֐׻בֵڼ٢ھ־ۀق׵ֻ׸֯ۆӎ׏ۉš׏؉לۍגۂלۑ׏ۓŽ׬ۖ״ۙ؇ۍ״۝؇ۄ׺͠؋ˉ؍ϺϯԵ
function createBeatGrid() {
    const grid = E('div')

    grid.style.marginBottom = '5px'
    
    return grid
}