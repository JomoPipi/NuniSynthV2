






/**
 * The Provider of undo/redo functionality
 */

class Invoker<T> {
    oldModel  : T;
    curModel  : T;
    actions   : Action<T>[];
    redos     : Action<T>[];
    undoLimit : number
    constructor(model : T) {
        this.oldModel = model
        this.curModel = JSON.parse(JSON.stringify(model))
        this.actions = []
        this.redos = []
        this.undoLimit = 69
    }
    execute(action : Action<T>) {
        this.curModel = action.execute(this.curModel)
        this.actions.push(action)
        if (this.actions.length === this.undoLimit+1) {
            const head = this.actions.shift()!
            this.oldModel = head.execute(this.oldModel)
            this.actions.unshift(head)
        }
    }
    undo() {
        const action = this.actions.pop()
        if (action?.inverse) {
            this.curModel = action.inverse(this.curModel)
        } else {
            this.curModel = this.actions.reduce((model : T, action) => 
                action.execute(model)
                , this.oldModel)
        }
    }
}

class Action<T> {
    execute  : Endofunction<T>
    inverse? : Endofunction<T>
    constructor(execute : Endofunction<T>, inverse? : Endofunction<T>) {
        this.execute = execute
        this.inverse = inverse
    }
}