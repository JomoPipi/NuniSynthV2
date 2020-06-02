






import { G, GraphController } from '../init.js'

export const GraphUndoRedoModule = {
    undos: <string[]>[],
    redos: <string[]>[],
    save: function() {
        this.undos.push(G.toRawString())
        this.redos = []
    },
    undo_redo(redo : boolean) {
        const [a,b] = ((a,b) => redo ? [b,a] : [a,b])(this.undos,this.redos)
        const last = a.pop()

        if (last) {
            b.push(G.toRawString())
            G.fromRawString(last)
            GraphController.renderer.render()
            GraphController.unselectNode()
            D('connection-type-prompt')!.classList.remove('show')
        }
    },
    undo: function() {
        this.undo_redo(false)
    },
    redo: function() {
        this.undo_redo(true)
    },
    tryInput: function(e : KeyboardEvent) {
        if (e.ctrlKey && e.keyCode === 90) {
            e.shiftKey ? 
                this.redo() :
                this.undo() 
            return true
        }
    }
}