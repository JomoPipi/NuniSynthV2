






import { bufferController } from './internal.js'
import { audioCtx } from '../webaudio2/webaudio2.js'

export function formulateBuffer(index : number) {
    
    const formula = D('buffer-formula') as HTMLInputElement
    const seconds = bufferController.nextBufferDuration
       
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
        bufferController.buffers[index] = buffer
        bufferController.refreshAffectedBuffers()
        log('buffer formulation complete')
    }
    

    function validateExp(expression : string) {
        const {
            sin, cos, tan, log, log2, exp
            } = Math
        try {
            eval(`for (let channel = 0; channel < buffer.numberOfChannels; channel++) {  
                const nowBuffering = buffer.getChannelData(channel)
                for (let n = 0; n < buffer.length; n++) {
                    nowBuffering[n] = clamp(-1, ${expression}, 1)
                }
            }`)
                    
        } catch (e) {
            return e
        }
        
        return undefined
    }
}