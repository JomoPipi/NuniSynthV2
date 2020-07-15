"use strict";
class Invoker {
    constructor() {
        this.actions = [];
        this.redos = [];
    }
    execute(action) {
        action.execute();
        this.actions.push(action);
        this.redos.length = 0;
    }
    undo() {
        if (this.actions.length === 0)
            return;
        const action = this.actions.pop();
        action.unexecute();
        this.redos.push(action);
    }
    redo() {
        if (this.redos.length === 0)
            return;
        const action = this.redos.pop();
        action.unexecute();
        this.actions.push(action);
    }
}
class Command {
    constructor(execute, unexecute) {
        this.execute = execute;
        this.unexecute = unexecute;
    }
}
//# sourceMappingURL=graph_command.js.map