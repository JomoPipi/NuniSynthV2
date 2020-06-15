






import { BufferUtils } from './init_buffers.js'
import { audioCtx } from '../webaudio2/webaudio2.js'
import BufferStorage from '../storage/general/buffer_storage.js'

export function formulateBuffer(index : number) {
    
    const formula = D('buffer-formula') as HTMLInputElement
    const seconds = BufferUtils.nextBufferDuration
       
    const buffer = audioCtx
        .createBuffer(
            2, 
            audioCtx.sampleRate * seconds, 
            audioCtx.sampleRate)
    
    const isError = validateExp(formula.value)

    if (isError) {
        formula.value = isError
        log('buffer formulation denied')
        return;
    } 
    else {
        BufferStorage.set(index, buffer)
        BufferUtils.refreshAffectedBuffers()
        BufferUtils.updateBufferUI()
        log('buffer formulation complete')
    }
    

    function validateExp(expression : string) {
        const {
            sin, cos, tan, log, log2, exp, sqrt, random, 
            atan, atan2, atanh, abs, acos, acosh, asin, asinh,
            cbrt, ceil, cosh, expm1, floor, hypot, log10, LN2, 
            LN10, LOG2E, max, min, pow, round, sign, SQRT1_2, SQRT2,
            tanh, trunc
            } = Math
        try {
            eval(`for (let channel = 0; channel < buffer.numberOfChannels; channel++) {  
                const nowBuffering = buffer.getChannelData(channel)
                for (let n = 1; n < buffer.length; n++) {
                    nowBuffering[n] = clamp(-1, ${expression}, 1)
                }
            }`)
                    
        } catch (e) {
            return e
        }
        
        return undefined
    }
}

const presets = {

      'Hard Wave': 'sin(n / 32.0) + sin(n / 512.0)'
    , 'Kick-1A': '0.5 * sin(n / sqrt(n/3.0))'
    , 'Kick-2A': '0.5 * sin(n / (2*sqrt(n/4.0)))'
    , 'Kick-3A': '0.5 * sin(n / (0.4*sqrt(n/1.0)))'
    , 'Bass-1A': '0.5 * sin(n / sqrt(n/3.0)) - cos(n ** 0.3) * 0.25'
    , 'Bass-1B': '0.5 * sin(n / sqrt(n/3.0)) - cos(n ** 0.5) * 0.25'
    , 'Bass-1C': '0.5 * sin(n / sqrt(n/3.0)) - cos(n ** 0.57) * 0.25'
    , 'Bass-1D': '0.5 * sin(n / sqrt(n/3.0)) - cos(n ** 0.58) * 0.25'
    , 'Bass-1E': '0.5 * sin(n / sqrt(n/3.0)) - cos(n ** 0.59) * 0.25'
    , 'Bass-1F': '0.5 * sin(n / sqrt(n/3.0)) - cos(n ** 0.6) * 0.25'
    , 'Bass-2A': '0.5 * sin(n / sqrt(n/3.0)) + sin(n/70) * cos(n ** 0.5) * 0.25'
    , 'Warble Laser': '0.5 * sin(n / 10 / sqrt(n/5.0)) * cos(n /  sqrt(n/50.0))'
    , 'Noise 1': 'random() * .5 - .25'
    , 'Noise 2': 'sin(n/(2- sin(n/11))) * sin(n/23) * 0.5'
    }


D('buffer-formula-templates-button')!.onclick = () =>
    showBufferFormulaTemplates()

const container = D('formula-template-container')!
function showBufferFormulaTemplates() {
    const list = E('span')
    list.classList.add('window') // background color causes highlight color to be weird
    list.classList.add('show')
    list.classList.add('preset-list')
    for (const name in presets) {
        const btn = E('div')
            btn.classList.add('list-btn')
            btn.innerText = name
            
        list.appendChild(btn)
    }
    container.appendChild(list)

    window.addEventListener('mousedown', clickBufferTemplateOrNot)
}

function clickBufferTemplateOrNot(e : MouseEvent) {
    if (e.target instanceof HTMLElement && e.target.innerText in presets) {
        ;(D('buffer-formula') as HTMLInputElement).value = 
            (<Indexed>presets)[e.target.innerText]
    }

    window.removeEventListener('mousedown', clickBufferTemplateOrNot)
    container.innerHTML = ''
}