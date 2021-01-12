






console.log('sfdgkpjsdfgjklsdfgjkl')

interface AudioWorkletProcessor {
    readonly port : MessagePort;
    process(inputs : Float32Array[][], outputs : Float32Array[][], parameters : Map<string, Float32Array>) : void;
}

declare var AudioWorkletProcessor : {
    prototype : AudioWorkletProcessor
    new (options? : AudioWorkletNodeOptions) : AudioWorkletProcessor
}

declare function registerProcessor(name : string, _class : typeof BypassProcessor) : void

class BypassProcessor extends AudioWorkletProcessor {
    process(inputs : any, outputs : any, parameters : any) {
        // By default, the node has single input and output.
        const input = inputs[0];
        const output = outputs[0];
        // console.log("inside process")
        for (let channel = 0; channel < output.length; ++channel)
        {
            for (let i = 0; i < output[0].length; i++)
            {
                output[channel][i] = Math.random() * 2 - 1;
            }
        }

        // return true;
    }
}
  
registerProcessor('bypass-processor', BypassProcessor);
console.log('hello hello');