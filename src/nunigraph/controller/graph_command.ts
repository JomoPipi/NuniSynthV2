






/**
 * The Provider of undo/redo functionality
 */

class Invoker {
    actions   : Command[]
    redos     : Command[]
    // undoLimit : number
    constructor() {
        this.actions = []
        this.redos = []
        // this.undoLimit = 69
    }
    execute(action : Command) {
        action.execute()
        this.actions.push(action)
        this.redos.length = 0
    }
    undo() {
        if (this.actions.length === 0) return;
        const action = this.actions.pop()!
        action.unexecute()
        this.redos.push(action)
    }
    redo() {
        if (this.redos.length === 0) return;
        const action = this.redos.pop()!
        action.unexecute()
        this.actions.push(action)
    }
}

class Command {
    execute  : Function
    unexecute : Function
    constructor(execute : Function, unexecute : Function) {
        this.execute = execute
        this.unexecute = unexecute
    }
}

// class ChangeValueOfNodeCommand { 
//     id : number
//     param : 
// }