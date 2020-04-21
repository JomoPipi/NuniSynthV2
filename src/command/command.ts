






// Implementation of the Command Design Pattern
class Invoker {
    private command : Command;
    constructor(command : Command) {
        this.command = command
    }
    setCommand(command : Command) {
        this.command = command
    }
    execute() {
        this.command.execute()
    }
    unexecute() {
        this.command.unexecute()
    }
}

interface Commando {
    execute : () => void;
    unexecute : () => void;
}

type CommandType = ''
type CommandOptions = {}


class Command implements Commando {

    constructor (type : CommandType, options? : CommandOptions) {

    }

    execute(){}
    unexecute(){}
}