export class UndoRedoModule {
    constructor(getState, setState) {
        this.undos = [];
        this.redos = [];
        this.getState = getState;
        this.setState = setState;
    }
    save() {
        this.undos.push(this.getState());
        this.redos = [];
    }
    undo() {
        this.undo_redo(false);
    }
    redo() {
        this.undo_redo(true);
    }
    tryInput(e) {
        if (e.ctrlKey && e.keyCode === 90) {
            e.shiftKey ?
                this.redo() :
                this.undo();
            return true;
        }
    }
    undo_redo(redo) {
        const [a, b] = ((a, b) => redo ? [b, a] : [a, b])(this.undos, this.redos);
        const lastState = a.pop();
        if (lastState) {
            b.push(this.getState());
            this.setState(lastState);
        }
    }
}
//# sourceMappingURL=simple_undo_redo.js.map