/**
 * NuniSynth
 */

type Destination = AudioNode | AudioParam | AudioParam2

const audioCtx = new AudioContext2() as Indexible
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