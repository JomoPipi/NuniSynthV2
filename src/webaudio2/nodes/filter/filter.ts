






export class NuniFilterNode extends BiquadFilterNode implements AudioNodeInterfaces<NodeTypes.FILTER> {
    getNodeIcon() { return this.type as SVGIconKey }
}