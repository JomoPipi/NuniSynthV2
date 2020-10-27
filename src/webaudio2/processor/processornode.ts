






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
        const div = E('div')
        // div.attachShadow
        const editorID = `editor${ID++}`
        div.innerHTML = `
<div id='${editorID}' style="width: 162px; height: 100px;">function foo(items) {
    var x = "All this is syntax highlighted";
    return x;
}</div>`
        requestAnimationFrame(() => {
            const editor = ace.edit(editorID)
            // editor.setTheme("ace/theme/monokai")
            // editor.session.setMode("ace/mode/javascript")
            editor.setValue('Hello, world!')
            console.log('editor =', editorID, editor)
        })

        return div.children[0] as HTMLDivElement
    }
}