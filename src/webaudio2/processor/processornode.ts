






type Destination = AudioNode | AudioParam

declare var ace : any

const INITIAL_CODE = `class CustomProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
      return [{ name: 'gain', defaultValue: 0.1}]
    }
    constructor() {
      super()
      this.sampleRate = 44100
    }
    process(inputs, outputs, parameters) {
      const speakers = outputs[0]
      for (let i = 0; i < speakers[0].length; i++) {
        const noise = Math.random() * 2 - 1
        const gain = parameters.gain[i]
        speakers[0][i] = noise * gain
        speakers[1][i] = noise * gain
      }
      return true
    }
}`

class CustomAudioNode extends AudioWorkletNode {
    constructor(audioContext : AudioContext, processorName : string) {
        super (audioContext, processorName, 
            { numberOfInputs: 0
            , numberOfOutputs: 1
            , outputChannelCount: [2]
            });
    }
}

let ID = 0
let newCodeId = 0

export class ProcessorNode {
    private audioWorkletNode : AudioWorkletNode
    private ctx : AudioContext
    private volumeNode : GainNode

    constructor (ctx : AudioContext) {
        this.audioWorkletNode = new AudioWorkletNode(ctx, 'bypass-processor')
        this.ctx = ctx
        this.volumeNode = ctx.createGain()
        this.audioWorkletNode.connect(this.volumeNode)
    }

    connect(destination : Destination) {
        this.volumeNode.connect(destination as any)
    }

    disconnect(destination? : Destination) {
        this.volumeNode.disconnect(destination as any)
    }

    getUIComponent() {
        const div = E('div', { className: 'container' })
        div.style.width = '162px'
        div.style.height = '100px'
        const editorID = `editor${ID++}`
        div.innerHTML = `
        <style>
            .container {
                width: 100%;
                height: 100%;
                overflow-y: scroll;
                max-height: 500px;
            }
            .editor {
                width: 100%;
                height: 100%;
            }
        </style>
        <div id="${editorID}-top-row"></div>
        <div id='${editorID}' class="editor"></div>`

        // We need to wait for the innerHTML to be parsed:
        requestAnimationFrame(() => {

        const codeEditor = D(editorID)
        const editor = ace.edit(codeEditor)

        const run = E('button', { text: 'Run' })
            run.onclick = playAudio.bind(null, editor)

        D(`${editorID}-top-row`).append(run)

        editor.setTheme("ace/theme/gruvbox")
        editor.getSession().setMode("ace/mode/javascript")
        editor.getSession().setValue(INITIAL_CODE)
        editor.setOptions({
            showPrintMargin: false,
            fontSize: 12,
            fontFamily: 'monospace',
            maxLines: Infinity,
            tabSize: 2,
            // showGutter: false
        })

        })
        const _this = this
        return div

        function runEditorCode(editor : any) {
            ++newCodeId
            const userCode = editor.getSession().getValue()
            const code = createProcessorCode(userCode, editorID + ":" + newCodeId)
            const blob = new Blob([code], { type: 'application/javascript' })
            const url = window.URL.createObjectURL(blob);
        
           _this.runAudioWorklet(url, editorID + ":" + newCodeId);
        }
        
        function playAudio(editor : any) {
            runEditorCode(editor);
        }
    }
        
    runAudioWorklet(workletUrl : string, processorName : string) {
        this.ctx.audioWorklet.addModule(workletUrl).then(() => {
            this.stopAudio();
            this.audioWorkletNode = new CustomAudioNode(this.ctx, processorName);
            this.audioWorkletNode.connect(this.volumeNode);
        });
    }
    stopAudio() {
        this.audioWorkletNode.disconnect(this.volumeNode);
    }
    
}
;(<any>window).CustomAudioNode = CustomAudioNode

function createProcessorCode(userCode : string, processorName : string) {
    return `${userCode}

    registerProcessor("${processorName}", CustomProcessor);`;
}


// class CustomProcessor extends AudioWorkletProcessor {
//     static get parameterDescriptors() {
//       return [{ name: 'gain', defaultValue: 0.1}]
//     }
//     constructor() {
//       super()
//       this.x = this.y = 0
//       this.sampleRate = 44100
//     }
//     process(inputs, outputs, parameters) {
//       const speakers = outputs[0]
//       if (this.x % 200 > 99) this.y++
//       if (this.y > 34) this.y = 0
//       for (let i = 0; i < speakers[0].length; i++)
//       {
//         const noise = Math.sin(this.x++/(((this.y *= 1.0001) % 100) + 694.0));
//         const gain = parameters.gain[0]
//         speakers[0][i] = noise 
//         speakers[1][i] = noise
//       }
//       return true
//     }
// }