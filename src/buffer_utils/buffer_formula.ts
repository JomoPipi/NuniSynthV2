






import { BufferUtils } from './init_buffers.js'
import { audioCtx } from '../webaudio2/internal.js'
import { BufferStorage } from '../storage/general/buffer_storage.js'

const formulaInput = D('buffer-formula') as HTMLInputElement
const errorMsgText = D('buffer-formula-error-msg') as HTMLElement

export function formulateBuffer(index : number) {
    
    const seconds = BufferUtils.nextBufferDuration

    const buffer = audioCtx
        .createBuffer(
            2, 
            audioCtx.sampleRate * seconds, 
            audioCtx.sampleRate)
    
    const isError = validateExp(formulaInput.value)

    if (isError) {
        errorMsgText.innerText = isError
        log('buffer formulation denied')
        return;
    } 
    else {
        errorMsgText.innerText = ''
        BufferStorage.set(index, buffer)
        BufferUtils.refreshAffectedBuffers()
        BufferUtils.updateBufferUI()
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
    , 'Noise 3': 'sin(sin(n/30) * sin(n/20) * 3000)'
    , 'Tone': 'sin(sin(n/24.5) * cos(n/50.5) * 10) *.25 + sin(sin(n/28) * sin(n/22) * 10) *.25 + sin(sin(n/29) * sin(n/21) * 10) *.25 + sin(sin(n/30) * sin(n/20) * 10) *.25'
    , 'Water Drum': '0.5 * sin(n / sqrt(n/(10.0 + 2*(0.5 * sin(n / sqrt(n/3.0))))))'
    , 'Space Drum 1': '0.5 * sin(n / cbrt(n/(15.0 + 1*(0.5 * sin(n / sqrt(n/3.0))))))'
    , 'Space Laser 1': '0.5 * sin(n / sqrt(n/(15.0 + 1*(0.5 * sin(n / cbrt(n/3.0))))))'
    , 'Space Laser 2': '0.5 * sin(n / cbrt(n/(15.0 + 1*(0.5 * sin(n / cbrt(n/3.0))))))'
    , 'Descending Laser': '0.5 * sin(n / cbrt(n/(1500.0 + 1*(0.5 * sin(n / cbrt(n/30.0))))))'
    , 'Space Laser 3': '0.5 * sin(n / cbrt(n/(150.0 + 1*(0.5 ** sin((n+1) / sqrt(n/30.0))))))'
    , 'JI Pulse 1': '0.8 * ((n**1.4) % (2*n**1.1) > (n - (n % 2)) ? sin(n/64) : sin(n/25))'
    , 'Pulse 1': '0.8 * ((n**1.4) % (2*n**1.1) > (n - (n % 2)) ? sin(n/32) : sin(n/64))'
    , 'Pulse 2': '0.8 * ((n**1.35) % (2*n**1.1) > (n - (n % 40)) ? sin(n/32) : sin(n/64))'
    , 'Space Pulse 1': '0.8 * ((n**(1+0.7*sin(n/15000))) % (4*n**1.1) > (3*n - (n /2)) ? sin(n/32) : sin(n/48))'
    , 'Space Laser 4': '0.8 * ((n**(1+0.55*sin(n/81))) % (2*n**1.1) > (3*n - (n /2)) ? sin(n/32) : sin(n/32)*cos(n/12))'
    , 'Water Wave': '0.5 * sin(n / (sqrt(n/90)-sqrt(n/4)+sqrt(n/705)**2.3))'
    }


D('buffer-formula-templates-button')!.onclick = () =>
    showBufferFormulaTemplates()


const container = D('formula-template-container')!
function showBufferFormulaTemplates() {

    const buttons =
        Object.keys(presets).map(name => 
            E('div',{
                className: 'list-btn',
                text: name
                }))

    const list = E('span', {
        className: 'window show preset-list',
        children: buttons
        })
    
    container.appendChild(list)

    window.addEventListener('mousedown', clickBufferTemplateOrNot)
}

function clickBufferTemplateOrNot(e : MouseEvent) {
    if (e.target instanceof HTMLElement && e.target.innerText in presets) {
        formulaInput.value = 
            presets[e.target.innerText as keyof typeof presets]
    }

    window.removeEventListener('mousedown', clickBufferTemplateOrNot)
    container.innerHTML = ''
}