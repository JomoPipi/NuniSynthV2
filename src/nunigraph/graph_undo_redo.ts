






const UndoRedoModule = {
    undos: <string[]>[],
    redos: <string[]>[],
    save: function() {
        this.undos.push(G.toRawString())
        this.redos = []
    },
    undo_redo(redo : boolean) {
        const [a,b] = (<any>[this.undos,this.redos])[redo ? 'reverse' : 'map'](id)

        const last = a.pop()
        if (last) {
            b.push(G.toRawString())
            G.fromRawString(last)
            GraphCanvas.render()
            G.unselectNode()
            D('connection-type-prompt')!.style.display = 'none'
        }
    },
    undo: function() {
        this.undo_redo(false)
    },
    redo: function() {
        this.undo_redo(true)
    }
}

window.addEventListener('keydown', (e : KeyboardEvent) => {
    if (e.ctrlKey&& e.keyCode === 90) {
        e.shiftKey ? 
            UndoRedoModule.redo() :
            UndoRedoModule.undo() 
    }
})