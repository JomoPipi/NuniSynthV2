
// class NuniSourceNode {
//     /** Parent interface for Sampler nodes and Oscillator nodes
//      */
//     kbConnection: 'none' | 'mono' | 'poly'
//     // sources: { [key:number]: /AudioBufferSourceNode | OscillatorNode }
//     ctx: AudioContext2
//     constructor(type: NodeTypes.OSC | NodeTypes.SAMPLER, ctx: AudioContext2) {
//         this.kbConnection = 'none'
//         this.ctx = ctx
//         // this.sources = { 0: type === NodeTypes.OSC ? ctx.createOscillator : ctx.createBufferSource() }
//     }

//     refresh() {

//     }
// }