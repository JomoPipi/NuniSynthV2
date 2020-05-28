






import { BufferNode2 } from './buffer2.js'
import { OscillatorNode2 } from './oscillator2.js'
import { SubgraphSequencer } from './sequencers/subgraph-sequencer.js'
import { Destination, NuniSourceAudioParam } from './nuni_source_node.js'
import { NuniGraphNode } from '../nunigraph/nunigraph_node.js'


export class AudioContext2 extends AudioContext {
    /** con·text    /ˈkäntekst/ 
     *  noun
     *      "the circumstances that form the setting for an event, 
     *      statement, or idea, and in terms of which it can be 
     *      fully understood and assessed."
     */
    tempo : number

    constructor() {
        super()
        this.tempo = 120
    }

    createBuffer2() {
        return new BufferNode2(this)
    }

    createOscillator2() {
        return new OscillatorNode2(this) 
    }

    createSubgraphSequencer() {
        return new SubgraphSequencer(this)
    }
    
    connect_node_to_destination(node1 : NuniGraphNode, destination : Destination) {
        if (destination instanceof SubgraphSequencer) {
            destination.addInput(node1)
        }
        else if (destination instanceof NuniSourceAudioParam) {
            node1.audioNode.connect(destination.src.offset)
            
        } else {
            node1.audioNode.connect(destination)
        }
    }
    
    disconnect_node_from_destination(node1 : NuniGraphNode, destination : Destination) {
        if (destination instanceof SubgraphSequencer) {
            destination.removeInput(node1)

        } else if (destination instanceof NuniSourceAudioParam) {
            node1.audioNode.disconnect(destination.src.offset)

        } else {
            node1.audioNode.disconnect(destination)
        }
    }
}

export const audioCtx = new AudioContext2()