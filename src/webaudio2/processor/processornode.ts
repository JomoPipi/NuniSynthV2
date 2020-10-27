






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

let ID = 0

export class ProcessorNode {
    private audioWorkletNode : AudioWorkletNode

    constructor (ctx : AudioContext) {
        this.audioWorkletNode = new AudioWorkletNode(ctx, 'bypass-processor')
    }

    connect(destination : Destination) {
        this.audioWorkletNode.connect(destination as any)
    }

    disconnect(destination? : Destination) {
        this.audioWorkletNode.disconnect(destination as any)
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
<div id='${editorID}' class="editor"></div>`
        requestAnimationFrame(() => {
            const codeEditor = D(editorID)
            const editor = ace.edit(codeEditor)
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

        return div
    }
}