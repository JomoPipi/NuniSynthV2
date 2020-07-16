export class NuniAudioParam extends ConstantSourceNode {
    constructor(ctx) {
        super(ctx);
        this.offset.value = 0;
        this.start(ctx.currentTime);
    }
    set value(value) {
        this.offset.value = value;
    }
}
//# sourceMappingURL=nuni_audioparam.js.map