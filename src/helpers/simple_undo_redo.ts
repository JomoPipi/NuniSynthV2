






export class UndoRedoModule {
    
    private undos : string[]
    private redos : string[]
    private getState : () => string
    private setState : (state : string) => void

    constructor(getState : () => string, setState : (state : string) => void) {
        this.undos = []
        this.redos = []

        this.getState = getState
        this.setState = setState
    }

    save() {
        this.undos.push(this.getState())
        this.redos = []
    }

    undo() {
        this.undo_redo(false)
    }

    redo() {
        this.undo_redo(true)
    }

    tryInput(e : KeyboardEvent) {
        if (e.ctrlKey && e.keyCode === 90) {
            e.shiftKey ? 
                this.redo() :
                this.undo() 
            return true
        }
    }

    private undo_redo(redo : boolean) {
        const [a,b] = ((a,b) => redo ? [b,a] : [a,b])(this.undos, this.redos)
        const lastState = a.pop()

        if (lastState) {
            b.push(this.getState())
            this.setState(lastState)
        }
    }
}