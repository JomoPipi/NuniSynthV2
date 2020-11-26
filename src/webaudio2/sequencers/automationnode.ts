






export class AutomationNode {
    ctx : AudioContext

    constructor(ctx : AudioContext) {
        this.ctx = ctx
    }

    getController() {
        return E('div')
    }
}