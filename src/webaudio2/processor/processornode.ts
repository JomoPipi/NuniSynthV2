






type Destination = AudioNode | AudioParam

declare var ace : any

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
    }
    .editor {
        width: 100%;
        height: 100%;
    }
    * {
        font-family: monospace;
    }
</style>
<div id='${editorID}' class="editor">function foo(items) {
    var x = "All this is syntax highlighted";
    return x;
}</div>`
        requestAnimationFrame(() => {
            const codeEditor = D(editorID)
            const editor = ace.edit(codeEditor)
            editor.setTheme("ace/theme/gruvbox")
            editor.getSession().setMode("ace/mode/javascript")
            editor.getSession().setValue(`
function process() {
  
}
`)
            editor.setOptions({
                showPrintMargin: false, // hides the vertical limiting strip
                fontSize: 12,
                fontFamily: 'monospace',
                maxLines: Infinity,
                tabSize: 2,
                showGutter: false
            })

        })

        return div
    }
}