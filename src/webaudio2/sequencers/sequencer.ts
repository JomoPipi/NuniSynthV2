






import MasterClock from './master-clock.js'
import VolumeNodeContainer from '../volumenode_container.js'




export default class Sequencer extends VolumeNodeContainer {
    /**
     * This creates an N-step sequencer out of
     * whatever inputs are connected to it.
     */
    readonly ctx : AudioContext
    nSteps : number
    currentStep : number
    startTime : number
    noteTime : number
    subdiv : number
    stepMatrix : Indexable<boolean[]>
    mutedChannel : Indexable<boolean>
    soloChannel? : string
    isPlaying : boolean
    protected tick : number
    windowIsOpen : boolean
    HTMLGrid : HTMLElement
    protected HTMLBoxes : Indexable<Indexable<HTMLElement>>
    isInSync : boolean
    ADSRs : Indexable<GainNode>
    // controls : SequencerControls

    constructor(ctx : AudioContext) {
        super(ctx)
        this.ctx = ctx
        this.nSteps = 8
        this.currentStep = 0
        this.startTime = 0
        this.noteTime = 0
        this.subdiv = 8
        this.stepMatrix = {}
        this.mutedChannel = {}
        this.isPlaying = false
        this.tick = (60*4 / MasterClock.tempo) / this.subdiv
        this.windowIsOpen = false
        this.HTMLGrid = E('div')
        this.HTMLBoxes = {}
        this.isInSync = true
        this.ADSRs = {}
        // this.controls = new SequencerControls(this)
    }

    updateTempo(tempo : number) {
        const newTick = (60 * 4 / tempo) / this.subdiv
        if (this.tick !== newTick) {
            this.tick = newTick
            this.isInSync = false
            // this.declareOutOfSync() 
            // What this method should do, when it exists,
            // is uncheck the `sync` checkbox.
        }
    }

    updateSteps(nSteps : number) {
        const m = this.stepMatrix 
        for (const key in m) {
            if (m[key].length < nSteps) {
                // We need to add steps
                m[key] = m[key].concat(Array(nSteps - m[key].length).fill(0))
            } else {
                m[key] = m[key].slice(0, nSteps)
            }
        }
        this.nSteps = nSteps
    }

    play() {
        this.isPlaying = true
        this.noteTime = 0
        this.currentStep = 0
        this.startTime = this.isInSync ? 0 : this.ctx.currentTime + 0.005
    }

    scheduleNotes(tempo : number) {
        if (!this.isPlaying) return;
        this.updateTempo(tempo)
        const currentTime = this.ctx.currentTime - this.startTime
        
        let updateBox = true && this.noteTime > 0
        while (this.noteTime < currentTime + 0.200) {
            
            const patternTime = this.noteTime + this.startTime

            this.playStepsAtTime(patternTime, updateBox)
            updateBox = false
            this.nextNote()
        }
    }

    nextNote() {
        this.currentStep++
        if (this.currentStep >= this.nSteps) this.currentStep = 0
        this.noteTime += this.tick
    }

    playStepsAtTime(time : number, updateBox : boolean) {
        const boxIsVisible = this.HTMLGrid.offsetParent != null

        for (const key in this.ADSRs) {
            const stepIsActive = this.stepMatrix[key][this.currentStep]
            if (!this.mutedChannel[key] && (!this.soloChannel || this.soloChannel === key)) {

                if (boxIsVisible && updateBox) {
                    // Highlight box+
                    this.HTMLBoxes[key][this.currentStep]?.classList.add('highlighted')
                    const lastStep = (this.currentStep + this.nSteps - 1) % this.nSteps
                    this.HTMLBoxes[key][lastStep]?.classList.remove('highlighted')
                }

                // if (this.controls.offsetParent != null && updateBox) {
                //     this.controls.highlight(key,this.currentStep)
                // }
                log('step is being played woo')

                if (stepIsActive && (this.soloChannel == undefined || this.soloChannel === key)) {
                    this.playStepAtTime(key, time)
                }
            }
        }
    }

    playStepAtTime(key : string, time : number) { // , duration : number) {
        throw 'Implement this in a concrete class.'
    }

    stop() {
        this.isPlaying = false

        for (const key in this.HTMLBoxes) {
            for (const step in this.HTMLBoxes[key]) {
                this.HTMLBoxes[key][step].classList.remove('highlighted')
            }
        }

        // this.controls.unhighlightGrid()
    }

    refresh() {
        for (const key in this.ADSRs) {
            this.ADSRs[key].connect(this.volumeNode)
        }
        this.isPlaying = false
        this.currentStep = 0
        this.setupGrid()
    }

    setupGrid() {
        this.HTMLGrid.innerHTML = ''
        this.HTMLBoxes = {}
        const grid = this.HTMLGrid
        const { nSteps, ADSRs, mutedChannel } = this
        for (const key in ADSRs) {
            const row = E('span')
            row.classList.add('flex-center')
            row.appendChild(rowOptions(key))
            this.HTMLBoxes[key] = {}
            for (let i = 0; i < nSteps; i++) {
                const box = E('span')
                this.HTMLBoxes[key][i] = box
                box.classList.add('note-box')
                box.classList.toggle('selected', this.stepMatrix[key][i])
                box.dataset.sequencerKey = `${key}:${i}`
                row.appendChild(box)
            }
            grid.appendChild(row)
        }
        grid.onclick = (e : MouseEvent) => {
            const box = e.target as HTMLSpanElement
            if (box.dataset.sequencerKey) {
                const turnOn = box.classList.toggle('selected')
                const [key,i] = box.dataset.sequencerKey.split(':').map(Number)
                this.stepMatrix[key][i] = turnOn
            }
            else if (box.dataset.sequencerRowKey) {
                const key = box.dataset.sequencerRowKey
                const mutesolo = box.innerText
                const activate = box.classList.toggle('selected')
                if (mutesolo === 'M') {
                    this.mutedChannel[key] = activate
                }
                else if (mutesolo === 'S') {
                    this.soloChannel = activate
                        ? key
                        : undefined
                }
            }
        }
        
        function rowOptions(key : string) {
            const muteSoloBox = E('div')
            const mute = E('button')
            const solo = E('button')
            const optionsBtn = E('button')
            mute.classList.add('top-bar-btn')
            solo.classList.add('top-bar-btn')
            mute.innerText = 'M'
            solo.innerText = 'S'
            optionsBtn.innerText = '⚙️'
            mute.dataset.sequencerRowKey = key
            solo.dataset.sequencerRowKey = key
            mute.classList.toggle('selected', mutedChannel[key] === true)
            muteSoloBox.append(mute, optionsBtn)//, solo)
            return muteSoloBox
        }
    }
}

// {"connectiăs":Ā2Č[ĀidČ31,āăąćĉnTypeČāhaĄel"},ĒĔ:32ĘĂħĜăğġģcĥħĩ}]Ę10ĐĭĕėęĴĈĶĠĢ:ĤĦąĽĬ"ēĕıŇěŉĞŋĹĻŐĪĿ"14ŃœĮĖĲĚĆřķŌŎļĪŒŔįŖĳŘĝŬŜŏĨşĘ21ŤŲŧŗŪŷśōĺźőńųŨňƅĸƇŝŻľĘĖƀĮ0ƍŶŊƐŮŞƔ"İƗČƙƃĵŚƝƈůľī"nodeċ:đťƤĘtƆ"gain"ƸitlŭƼƾǀ"xƤ.36Ęyǋ1138069ž6757741ŖaudĉNưŌ{ƭǢǤoParamValuƲČĀǆƿ:0.25}īƋŖƹƝoscillatorǈĈǃŭȇȉȋȍȏǈǊǼ.443946303Ȟž015Ǐǋ8471Ȯ27İǕ2983ĘǫǥǧǸātțĀtempoČǓ7ǾŁ93ǛƭADSRƳĀ6ɘ42łč"rĨeaseIĮ-1ȁĘvoǵmeǦƱǸƭMONOČɘ6ɚƥkbMȾōƯąǈsourcǷɝɹɻȿĥsStǯɄĮtrǶɩ"ʆtputƳ[Š_ȅŭsƾĢĘƱtuʃɝsʈɲƭfɟqǶncǐʮʰčȁǪǣȽƱŸōʦʃȻʿǭǯǱǳǵʊĀʳeʵeʷʹ616Ǿȴ8ȱ35ȩ48ʩeʫʭ0ɩƋŁƸƺȕȊȌȎȐǁȓģ˫ȗˮȚǋ2ȹȡȣȥȧŁȪȬȜȮȰȲȴ˸0ȷȹˆǬɰǨɀɂ"ɄɆɈ:ɊɌ0ɎɐĘɒɔɖ"ʌɛȿɟǄɢɤɦɨƭɫɭɯʀǩĘɴɶɸəɛĘɽɿɱʁăʨ"ʅʇʉ̝̟ɜĀʏʑʓeʕʗeʙʛʝʟĐʢʤģ˄̺ʪʬ̍ʯcʱĘˏˑ˓ȿ͗ʱʾ̋ǧ˂̻ʧǈȼˈǰǲǴǶ̝͛ʶʸČ4ȩ.5ǔȳȯ7ǖ82Ⱥ"͔ˤ˦ƶ̔4˩ȆȈˬȘ˯̐ǂǄ˲Έ˴șĘțǽ6ȥ˺ȤȦɚŁ̗̀ǽ̂ȱɚ̅ȶȸ;ͨ̌ȿć̏̑ɇɉɏ̖̘Ȁ̚ɓɕȿ̡̀ɠ̤ɥČɧʙ̩uɮΨʼ̮ɵɷ:̴̀ɾʀƮ̹ʄʆʈˍ̞̲́"̓ʒrʔČʖʘƭ͋ʞʠ͏ƺ͒ǈ΀͖ʻǩʲʴͰʹĀ͟ʼʙΧͣϢͦ̊ĉǮͪˋͭȿͯ˒ͱ:ȡ5.Ȯ˕199ȩǗɘˡˣŌ˥Ȃ΃žΆȔΐ˭ΒΌ˱ō˳Е΋Δ.ǠȠȢΙ˽˞7ΞЂȯΡȳȵ̇ΥϵoςĀΪȿά̓̕Ȩαɑδ̿ϓθ̣ɣλ:ν̨ɬπ̷̫̭"̯φψ"̵ϋʂ̺̼ϐлɺ̠ɝϖ͇ͅϜĘϞ͍ƴϡƝϣЋ͕͞ϧʙϼ͝ʺ͘ϯ͡ˀeͤѢ"ͨϷˊͬϑѨϾ2˕.6ǿ56Ͷ005ȸХͿˢѤǼ΂Ɓņ͐˃ubgǰph-ɣ͜ʉ΋ȒΎҏґғҕҗͰeМ˷7ІҧҨҩ҆ʹǽ4552ȳ68ǚȥ̗ҀЮа̎гɅέ̔ίзɏβ"̛εɝďɝ̢ɡп̦ƭŁнӋ̥μɨŀţӉιӌӓƭžӐκӍу̪аƭnʑepƳǠĘsɄpMȍrȉӈ[fǴɣ,ϛe,ƙӼӸ͈ӻӾǶ,ӵlӷԄӷƙӹŠӏƴƙԇӺӹԀԑԏԃӶӺԉӿԘԂ0ԋӖ[ԑԎԖԀԔԚԗԀԡԅԗŠӜԍԧԁԦӽԤԯԧ]ƭmʞ͆CƒĩσόɄTiɮČǿɋ8ȴŢΖɏЅǘӪϗtՀՂį3ǌ;cʇɟntӥpĕĘisPȌyƾgϚӿΌckǑҮ7Ζ9ǞǝҀȱˠ"wƾdowIsOġǻԔ"HTMLGӰĮшւքBoxϑ2ǼɲŽ̔֒"֐ӈш֐3֕֐Ӗ֙:5֜χ֢7֢8֢9֢Ԍ֟ǒ֕Ł֑Խ֯ſֱ0:֘ӎִֵ֛:ֵָ֮֞֠6׀:ֻֻֻ֥֧֩֫־ֱ֭4ְшŢ֔׎ֶ֮׏ֺב׏ֽӕֿהׂהׅי:ׇע׉ע׋ל׍֙1אӛ׬ֳ׫וԽžį֜׬כ֖׬֡׳׬ןױס׮ף׶Ͽ؃ר׹̔װʽЮѴͫˌɖҋŦȄϢҐҒaҔҖːҢҚ΍ʥؔҟؘҘң˶ȜȞЦҮҰҲҴͺȤ9ҸѲˇҺвɝдήɋӁ̙ӄкȿ֘ɞӘӒсӔšϔӊӞӚӕӝәـ׮وؿтɪфρ̬ӣ՛Ƴǎ̻ӬӮʖӱػĐԔԠԮԊŀɜ[ԨӷٟԓԖԝĐٟԲԤԫֳ٤٠ԙӻԵĘԷʔԺƉ֕ƯԿՁŌѻžح̗ͳ˕ɏխՍʓՐŌұ9.ҧ3ڐڑڒĲ՗˒՚ӬƷœՠբդզԂըժȜȷȪځ49үΙڇյշչջս˒Čր֊օև֕ڳ֌֎̝֐́ӛדַ֟֓טڽ׸֐׻בֵڼ٢ھ־ۀق׵ֻ׸֯ۆӎ׏ۉš׏؉לۍגۂלۑ׏ۓŽ׬ۖ״ۙ؇ۍ״۝؇ۄ׺͠؋ˉ؍ϺϯԵ
