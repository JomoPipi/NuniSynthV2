import { audioCtx } from '../../webaudio2/internal.js';
export class NuniGraphNode {
    constructor(id, type, settings) {
        var _a;
        const { x, y, audioParamValues, audioNodeProperties, title, INPUT_NODE_ID } = settings;
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.title = title;
        this.INPUT_NODE_ID = INPUT_NODE_ID;
        this.audioNode = audioCtx[createAudioNode[type]]();
        if (MustBeStarted[type])
            this.audioNode.start(0);
        Object.assign(this.audioNode, audioNodeProperties);
        this.audioParamValues = audioParamValues;
        for (const param of AudioNodeParams[type]) {
            const value = (_a = audioParamValues[param]) !== null && _a !== void 0 ? _a : DefaultParamValues[param];
            this.setValueOfParam(param, value);
        }
    }
    setValueOfParam(param, value) {
        this.audioParamValues[param] = value;
        this.audioNode[param].value = value;
    }
}
//# sourceMappingURL=nunigraph_node.js.map