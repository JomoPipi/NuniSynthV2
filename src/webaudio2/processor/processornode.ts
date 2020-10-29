






type Destination = AudioNode | AudioParam

declare var ace : any

const INITIAL_CODE = 
`class CustomProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{ name: 'gain', defaultValue: 0.1}]
  }
  constructor() {
    super()
    this.sampleRate = 44100
  }
  process(inputs, outputs, parameters) {
    const speakers = outputs[0]
    for (let i = 0; i < speakers[0].length; i++)
    {
      const noise = Math.sin(Date.now()*(1+i))
      const gain = parameters.gain[0]
      speakers[0][i] = noise * gain
    }
    return true
  }
}`
// = `class CustomProcessor extends AudioWorkletProcessor {
//     static get parameterDescriptors() {
//       return [{ name: 'gain', defaultValue: 0.1}]
//     }
//     constructor() {
//       super()
//       this.sampleRate = 44100
//     }
//     process(inputs, outputs, parameters) {
//       const speakers = outputs[0]
//       for (let i = 0; i < speakers[0].length; i++)
//       {
//         const noise = Math.random() * 2 - 1
//         const gain = parameters.gain[i]
//         speakers[0][i] = noise * gain
//         speakers[1][i] = noise * gain
//       }
//       return true
//     }
// }`



// class CustomAudioNode extends AudioWorkletNode {
//     constructor(audioContext : AudioContext, processorName : string) {
//         super (audioContext, processorName, 
//             { numberOfInputs: 1
//             , numberOfOutputs: 1
//             , outputChannelCount: [2]
//             });
//     }
// }

export class ProcessorNode {
    audioWorkletNode : AudioWorkletNode
    code = INITIAL_CODE
    private ctx : AudioContext
    private volumeNode : GainNode
    private editorNeedsUpdate = false
    private editor? : any
    private UIComponent? : HTMLDivElement
    private url = ''

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

    resizeUI() {
        this.editor?.resize()
    }

    getUIComponent() {
        if (this.UIComponent) return this.UIComponent

        const div = this.UIComponent = E('div', { className: 'container' })
        const topRow = E('div')
        const codeEditor = E('div', { className: 'editor' })
        div.style.width = '486px'
        div.style.height = '300px'
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
        </style>`
        div.append(topRow, codeEditor)

        // We need to wait for the innerHTML to be parsed:
        requestAnimationFrame(() => {

        const options = 
            { showPrintMargin: false
            , fontFamily: 'Lucida Console'
            , maxLines: Infinity
            , tabSize: 2
            , wrap: true
            // showGutter: false
            }
        this.editor = ace.edit(codeEditor, options)

        const run = E('button', { text: 'Run' })
            run.onclick = this.playAudio.bind(this)

        topRow.append(run)

        this.editor.setTheme("ace/theme/gruvbox")
        this.editor.getSession().setMode("ace/mode/javascript")
        this.editor.getSession().setValue(this.code)

        })

        return div
    }

    private static _id = 0
    private createNewCodeId() { return ProcessorNode._id++ }

    updateCode(code : string) {
        if (this.editor) 
        {
            this.editor.getSession().setValue(code)
            return
        }
        this.code = code
        this.editorNeedsUpdate = true
    }
    
    runEditorCode() {
        if (this.editorNeedsUpdate) this.editor.getSession().setValue(this.code)
        else this.code = this.editor.getSession().getValue()
        const id = this.createNewCodeId().toString()
        const code = createProcessorCode(this.code, id)
        const blob = new Blob([code], { type: 'application/javascript' })
        log('url =',this.url)
        // window.URL.revokeObjectURL(this.url)
        this.url = window.URL.createObjectURL(blob)
        this.runAudioWorklet(id)
    }
    
    playAudio() {
        this.runEditorCode()
    }
        
    async runAudioWorklet(processorName : string) {
        await this.ctx.audioWorklet.addModule(this.url)
        // this.audioWorkletNode.disconnect(this.volumeNode)

        this.audioWorkletNode.disconnect()
        this.audioWorkletNode = new AudioWorkletNode(this.ctx, processorName)
        this.audioWorkletNode.connect(this.volumeNode)
    }
}
// ;(<any>window).CustomAudioNode = CustomAudioNode

function createProcessorCode(userCode : string, processorName : string) {
    return `${userCode}

    registerProcessor("${processorName}", CustomProcessor)`;
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




// let t = 0
// class CustomProcessor extends AudioWorkletProcessor {
//     static get parameterDescriptors() {
//       return [{ name: 'gain', defaultValue: 0.1}]
//     }
//     constructor() {
//       super()
//       this.sampleRate = 44100
//     }
//     process(inputs, outputs, parameters) {
//       console.log(inputs[0])
//       const speakers = outputs[0]
//       t++
//       for (let i = 0; i < speakers[0].length; i++)
//       {
//         const noise = Math.sin(((Math.sin(t)*1000**.4)*((t+i)/Math.E))/Math.PI ** Math.E)
//         speakers[0][i] = noise 
//         speakers[1][i] = noise
//       }
//       return true
//     }
// }