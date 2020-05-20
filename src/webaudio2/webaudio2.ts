






import { BufferNode2 } from './buffer2.js'
import { OscillatorNode2 } from './oscillator2.js'
import { Destination, AudioParam2 } from './nuni_source_node.js'
import { NuniGraphNode } from '../nunigraph/nunigraph_node.js'


class AudioContext2 extends AudioContext {
    /** con·text    /ˈkäntekst/ 
     *  noun
     *      "the circumstances that form the setting for an event, 
     *      statement, or idea, and in terms of which it can be 
     *      fully understood and assessed."
     */
    constructor() {
        super()
    }

    createBuffer2() {
        return new BufferNode2(this)
    }

    createOscillator2() {
        return new OscillatorNode2(this) 
    }
}

export function connect_node_to_destination(node1 : NuniGraphNode, destination : Destination) {
    if (destination instanceof AudioParam2) 
    {
        node1.audioNode.connect(destination.src.offset)
    } else {
        node1.audioNode.connect(destination)
    }
}

export function disconnect_node_from_destination(node1 : NuniGraphNode, destination : Destination) {
    if (destination instanceof AudioParam2) 
    {
        node1.audioNode.disconnect(destination.src.offset)
    } else {
        node1.audioNode.disconnect(destination)
    }
}

export const audioCtx = new AudioContext2()