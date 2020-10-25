






interface AudioWorkletProcessor {
    readonly port: MessagePort;
    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Map<string, Float32Array>): void;
}

declare var AudioWorkletProcessor: {
    prototype: AudioWorkletProcessor;
    new(options?: AudioWorkletNodeOptions): AudioWorkletProcessor;
}

declare function registerProcessor(name : string, _class : typeof WhiteNoiseProcessor) : void

// white-noise-processor.js
class WhiteNoiseProcessor extends AudioWorkletProcessor {
    constructor() { super() }
    process (inputs : any, outputs : any, parameters : any) {
        const output = outputs[0]
        log('inputs, outputs, params =', inputs, outputs, parameters)
        output.forEach((channel : any) => {
            for (let i = 0; i < channel.length; i++) 
            {
                channel[i] = Math.random() * 2 - 1
            }
        })
        return true
    }
}
  
registerProcessor('white-noise-processor', WhiteNoiseProcessor)