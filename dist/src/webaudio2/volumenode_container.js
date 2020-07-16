export class VolumeNodeContainer {
    constructor(ctx) {
        this.ctx = ctx;
        this.volumeNode = ctx.createGain();
        this.volumeNode.gain.value = 1;
    }
    connect(destination) {
        this.volumeNode.connect(destination);
    }
    disconnect(destination) {
        if (!destination) {
            this.volumeNode.disconnect();
            return;
        }
        this.volumeNode.disconnect(destination);
    }
    refresh() {
        throw 'This should be implemented in a child class.';
    }
}
//# sourceMappingURL=volumenode_container.js.map