import { VolumeNodeContainer } from "./volumenode_container.js";
export class NuniGraphAudioNode extends VolumeNodeContainer {
    constructor(ctx) {
        super(ctx);
        this.canvas = E('canvas', { className: 'nunigraph-canvas--module' });
        if (NuniGraphAudioNode.createController)
            this.controller = NuniGraphAudioNode.createController(this.canvas, this.volumeNode);
        else
            throw 'Why is create controller undefined';
        this.inputs = {};
        this._windowIsOpen = false;
    }
    activateWindow() {
        this.controller.activateEventHandlers();
        this._windowIsOpen = true;
    }
    deactivateWindow() {
        this.controller.deactivateEventHandlers();
        this.controller.closeAllWindows();
        this._windowIsOpen = false;
    }
    get graphCode() {
        return this.controller.g.toString();
    }
    set graphCode(code) {
        this.controller.fromString(code);
    }
    addInput({ id, audioNode }) {
        const inputNode = this.controller
            .g.nodes
            .find(node => { var _a; return ((_a = node.INPUT_NODE_ID) === null || _a === void 0 ? void 0 : _a.id) === id; });
        if (inputNode) {
            audioNode.connect(inputNode.audioNode);
        }
        else {
            const inputNode = this.inputs[id]
                = this.controller.g.createNewNode(NodeTypes.GAIN, { x: Math.random() < 0.5 ? 0.05 : 0.95,
                    y: Math.random(),
                    audioParamValues: { gain: 1 },
                    audioNodeProperties: {},
                    title: `INPUT (id-${id})`,
                    INPUT_NODE_ID: { id }
                });
            audioNode.connect(inputNode.audioNode);
        }
        if (this._windowIsOpen) {
            this.controller.renderer.render();
        }
    }
    removeInput({ id }) {
        const inputNode = this.inputs[id];
        inputNode.audioNode.disconnect();
        this.controller.renderer.removeFromConnectionsCache(inputNode.id);
        this.controller.g.deleteNode(inputNode);
        delete this.inputs[id];
        if (this._windowIsOpen) {
            this.controller.renderer.render();
        }
    }
    replaceInput({ id, audioNode }, newNode) {
        const inputNode = this.controller
            .g.nodes
            .find(node => { var _a; return ((_a = node.INPUT_NODE_ID) === null || _a === void 0 ? void 0 : _a.id) === id; });
        if (inputNode) {
            audioNode.disconnect(inputNode.audioNode);
            newNode.audioNode.connect(inputNode.audioNode);
            inputNode.title = `INPUT (id-${newNode.id})`;
            inputNode.INPUT_NODE_ID.id = newNode.id;
            this.inputs[newNode.id] = this.inputs[id];
            delete this.inputs[id];
        }
        else {
            throw 'inputNode should be there';
        }
        if (this._windowIsOpen) {
            this.controller.renderer.render();
        }
    }
}
//# sourceMappingURL=nunigraph_audionode.js.map