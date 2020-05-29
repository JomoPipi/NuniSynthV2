






import { NuniGraphNode } from "../../nunigraph/nunigraph_node.js"
import { Adsr, ADSR_Controller } from '../adsr.js'
import AdsrSplitter from "../adsr-splitter.js"
import { AudioContext2 } from '../webaudio2.js' 
// import { MasterClock } from "./master-clock.js"






export class SubgraphSequencer extends AdsrSplitter {
    /**
     * This creates an N-step sequencer out of
     * whatever inputs are connected to it.
     */
    ctx : AudioContext2
    nSteps : number
    stepMatrix : Indexable<boolean[]>
    mutedChannel : Indexable<boolean>
    soloChannel? : string
    currentStep : number
    startTime : number
    noteTime : number
    isPlaying : boolean
    tick : number
    windowIsOpen : boolean
    HTMLGrid : HTMLElement
    private HTMLBoxes : Indexable<HTMLElement>
    isInSync : boolean
    subdiv : number

    constructor(ctx : AudioContext2) {
        super(ctx)
        this.ctx = ctx
        this.nSteps = 6
        this.stepMatrix = {}
        this.mutedChannel = {}
        this.currentStep = 
        this.startTime = 
        this.noteTime = 0
        this.isPlaying = false
        this.tick = (60 / this.ctx.tempo) / this.nSteps
        this.windowIsOpen = false
        this.HTMLGrid = E('div')
        this.HTMLBoxes = {}
        this.isInSync = true
        this.subdiv = 6
    }

    addInput(node : NuniGraphNode) {
        const adsr = this.ADSRs[node.id] = new Adsr(this.ctx)
        adsr.gain.value = 0
        node.audioNode.connect(adsr)
        adsr.connect(this.volumeNode)
        this.stepMatrix[node.id] = Array(this.nSteps).fill(0)
        this.refresh()
    }

    removeInput(node : NuniGraphNode) {
        this.ADSRs[node.id].disconnect()
        delete this.ADSRs[node.id]
        delete this.stepMatrix[node.id]
        this.refresh()
    }

    updateTempo() {
        this.tick = (60*4 / this.ctx.tempo) / this.subdiv
    }

    updateSteps(nSteps : number) {
        const m = this.stepMatrix 
        for (const key in m) {
            if (m[key].length < nSteps) {
                // We need to add steps
                m[key] = m[key].concat([...Array(nSteps - m[key].length)].fill(0))
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
        this.startTime = this.isInSync ? 0 : this.ctx.currentTime + 0.001
        this.scheduleNotes()
    }

    scheduleNotes() {
        if (!this.isPlaying) return;
        this.updateTempo()
        const currentTime = this.ctx.currentTime - this.startTime
        
        let updateBox = true
        while (this.noteTime < currentTime + 0.200) {
            
            const patternTime = this.noteTime + this.startTime

            this.playStepsAtTime(patternTime, updateBox)
            updateBox = false
            this.nextNote()
        }
        window.setTimeout(() => this.scheduleNotes())
        // requestAnimationFrame(() => this.scheduleNotes())
    }

    nextNote() {
        this.currentStep++
        if (this.currentStep >= this.nSteps) this.currentStep = 0
        this.noteTime += this.tick
    }

    playStepsAtTime(time : number, updateBox : boolean) {
        for (const key in this.ADSRs) {
            const adsr = this.ADSRs[key]
            const stepIsActive = this.stepMatrix[key][this.currentStep]
            if (!this.mutedChannel[key] && (!this.soloChannel || this.soloChannel === key)) {

                if (this.HTMLGrid.offsetParent != null && updateBox) {
                    // Highlight box
                    this.HTMLBoxes[`${key}:${this.currentStep}`]?.classList.toggle('highlighted', true)
                    const lastStep = (this.currentStep === 0 ? this.nSteps : this.currentStep) - 1
                    this.HTMLBoxes[`${key}:${lastStep}`]?.classList.toggle('highlighted', false)
                }

                if (stepIsActive) {
                    ADSR_Controller.trigger(adsr.gain, time)
                    ADSR_Controller.untriggerAdsr(adsr.gain, time + this.tick / 2.0)
                }
            }
        }
    }

    stop() {
        this.isPlaying = false
    }

    refresh() {
        this.isPlaying = false
        this.currentStep = 0
        this.gridSetup()
    }

    gridSetup() {
        this.HTMLGrid.innerHTML = ''
        this.HTMLBoxes = {}
        const grid = this.HTMLGrid
        const { nSteps, ADSRs, mutedChannel } = this
        for (const key in ADSRs) {
            const row = E('span')
            row.classList.add('flex-center')
            row.appendChild(muteSoloButtons(key))
            for (let i = 0; i < nSteps; i++) {
                const box = E('span')
                this.HTMLBoxes[`${key}:${i}`] = box
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
        
        function muteSoloButtons(key : string) {
            const muteSoloBox = E('div')
            const mute = E('button')
            const solo = E('button')
            mute.classList.add('top-bar-btn')
            solo.classList.add('top-bar-btn')
            mute.innerText = 'M'
            solo.innerText = 'S'
            mute.dataset.sequencerRowKey = key
            solo.dataset.sequencerRowKey = key
            mute.classList.toggle('selected', mutedChannel[key] === true)
            muteSoloBox.appendChild(mute)
            return muteSoloBox
        }
    }
}

// {"connectiăs":Ā2Č[ĀidČ31,āăąćĉnTypeČāhaĄel"},ĒĔ:32ĘĂħĜăğġģcĥħĩ}]Ę10ĐĭĕėęĴĈĶĠĢ:ĤĦąĽĬ"ēĕıŇěŉĞŋĹĻŐĪĿ"14ŃœĮĖĲĚĆřķŌŎļĪŒŔįŖĳŘĝŬŜŏĨşĘ21ŤŲŧŗŪŷśōĺźőńųŨňƅĸƇŝŻľĘĖƀĮ0ƍŶŊƐŮŞƔ"İƗČƙƃĵŚƝƈůľī"nodeċ:đťƤĘtƆ"gain"ƸitlŭƼƾǀ"xƤ.36Ęyǋ1138069ž6757741ŖaudĉNưŌ{ƭǢǤoParamValuƲČĀǆƿ:0.25}īƋŖƹƝoscillatorǈĈǃŭȇȉȋȍȏǈǊǼ.443946303Ȟž015Ǐǋ8471Ȯ27İǕ2983ĘǫǥǧǸātțĀtempoČǓ7ǾŁ93ǛƭADSRƳĀ6ɘ42łč"rĨeaseIĮ-1ȁĘvoǵmeǦƱǸƭMONOČɘ6ɚƥkbMȾōƯąǈsourcǷɝɹɻȿĥsStǯɄĮtrǶɩ"ʆtputƳ[Š_ȅŭsƾĢĘƱtuʃɝsʈɲƭfɟqǶncǐʮʰčȁǪǣȽƱŸōʦʃȻʿǭǯǱǳǵʊĀʳeʵeʷʹ616Ǿȴ8ȱ35ȩ48ʩeʫʭ0ɩƋŁƸƺȕȊȌȎȐǁȓģ˫ȗˮȚǋ2ȹȡȣȥȧŁȪȬȜȮȰȲȴ˸0ȷȹˆǬɰǨɀɂ"ɄɆɈ:ɊɌ0ɎɐĘɒɔɖ"ʌɛȿɟǄɢɤɦɨƭɫɭɯʀǩĘɴɶɸəɛĘɽɿɱʁăʨ"ʅʇʉ̝̟ɜĀʏʑʓeʕʗeʙʛʝʟĐʢʤģ˄̺ʪʬ̍ʯcʱĘˏˑ˓ȿ͗ʱʾ̋ǧ˂̻ʧǈȼˈǰǲǴǶ̝͛ʶʸČ4ȩ.5ǔȳȯ7ǖ82Ⱥ"͔ˤ˦ƶ̔4˩ȆȈˬȘ˯̐ǂǄ˲Έ˴șĘțǽ6ȥ˺ȤȦɚŁ̗̀ǽ̂ȱɚ̅ȶȸ;ͨ̌ȿć̏̑ɇɉɏ̖̘Ȁ̚ɓɕȿ̡̀ɠ̤ɥČɧʙ̩uɮΨʼ̮ɵɷ:̴̀ɾʀƮ̹ʄʆʈˍ̞̲́"̓ʒrʔČʖʘƭ͋ʞʠ͏ƺ͒ǈ΀͖ʻǩʲʴͰʹĀ͟ʼʙΧͣϢͦ̊ĉǮͪˋͭȿͯ˒ͱ:ȡ5.Ȯ˕199ȩǗɘˡˣŌ˥Ȃ΃žΆȔΐ˭ΒΌ˱ō˳Е΋Δ.ǠȠȢΙ˽˞7ΞЂȯΡȳȵ̇ΥϵoςĀΪȿά̓̕Ȩαɑδ̿ϓθ̣ɣλ:ν̨ɬπ̷̫̭"̯φψ"̵ϋʂ̺̼ϐлɺ̠ɝϖ͇ͅϜĘϞ͍ƴϡƝϣЋ͕͞ϧʙϼ͝ʺ͘ϯ͡ˀeͤѢ"ͨϷˊͬϑѨϾ2˕.6ǿ56Ͷ005ȸХͿˢѤǼ΂Ɓņ͐˃ubgǰph-ɣ͜ʉ΋ȒΎҏґғҕҗͰeМ˷7ІҧҨҩ҆ʹǽ4552ȳ68ǚȥ̗ҀЮа̎гɅέ̔ίзɏβ"̛εɝďɝ̢ɡп̦ƭŁнӋ̥μɨŀţӉιӌӓƭžӐκӍу̪аƭnʑepƳǠĘsɄpMȍrȉӈ[fǴɣ,ϛe,ƙӼӸ͈ӻӾǶ,ӵlӷԄӷƙӹŠӏƴƙԇӺӹԀԑԏԃӶӺԉӿԘԂ0ԋӖ[ԑԎԖԀԔԚԗԀԡԅԗŠӜԍԧԁԦӽԤԯԧ]ƭmʞ͆CƒĩσόɄTiɮČǿɋ8ȴŢΖɏЅǘӪϗtՀՂį3ǌ;cʇɟntӥpĕĘisPȌyƾgϚӿΌckǑҮ7Ζ9ǞǝҀȱˠ"wƾdowIsOġǻԔ"HTMLGӰĮшւքBoxϑ2ǼɲŽ̔֒"֐ӈш֐3֕֐Ӗ֙:5֜χ֢7֢8֢9֢Ԍ֟ǒ֕Ł֑Խ֯ſֱ0:֘ӎִֵ֛:ֵָ֮֞֠6׀:ֻֻֻ֥֧֩֫־ֱ֭4ְшŢ֔׎ֶ֮׏ֺב׏ֽӕֿהׂהׅי:ׇע׉ע׋ל׍֙1אӛ׬ֳ׫וԽžį֜׬כ֖׬֡׳׬ןױס׮ף׶Ͽ؃ר׹̔װʽЮѴͫˌɖҋŦȄϢҐҒaҔҖːҢҚ΍ʥؔҟؘҘң˶ȜȞЦҮҰҲҴͺȤ9ҸѲˇҺвɝдήɋӁ̙ӄкȿ֘ɞӘӒсӔšϔӊӞӚӕӝәـ׮وؿтɪфρ̬ӣ՛Ƴǎ̻ӬӮʖӱػĐԔԠԮԊŀɜ[ԨӷٟԓԖԝĐٟԲԤԫֳ٤٠ԙӻԵĘԷʔԺƉ֕ƯԿՁŌѻžح̗ͳ˕ɏխՍʓՐŌұ9.ҧ3ڐڑڒĲ՗˒՚ӬƷœՠբդզԂըժȜȷȪځ49үΙڇյշչջս˒Čր֊օև֕ڳ֌֎̝֐́ӛדַ֟֓טڽ׸֐׻בֵڼ٢ھ־ۀق׵ֻ׸֯ۆӎ׏ۉš׏؉לۍגۂלۑ׏ۓŽ׬ۖ״ۙ؇ۍ״۝؇ۄ׺͠؋ˉ؍ϺϯԵ

class SequencerRenderer {
    constructor() {

    }
}