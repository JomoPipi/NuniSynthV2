






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

type Destination = AudioNode | AudioParam | AudioParam2

const audioCtx = new AudioContext2() as Indexed
const nBuffers = 10

initBuffers(nBuffers, audioCtx as AudioContext2) 

function connect_node_to_destination(node1 : NuniGraphNode, destination : Destination) {
    if (destination instanceof AudioParam2) 
    {
        node1.audioNode.connect(destination.src.offset)
    } else {
        node1.audioNode.connect(destination)
    }
}

function disconnect_node_from_destination(node1 : NuniGraphNode, destination : Destination) {
    if (destination instanceof AudioParam2) 
    {
        node1.audioNode.disconnect(destination.src.offset)
    } else {
        node1.audioNode.disconnect(destination)
    }
}