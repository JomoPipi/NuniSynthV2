






import { NuniGraph } from "../../nunigraph/nunigraph.js"
import { SubgraphSequencer } from "./subgraph-sequencer.js"





let activated = false


// API
const MasterClock = {
    tempo: 120,
    attachToGraph: function (g : NuniGraph) {
        if (activated) 
            throw 'MasterClock has already been attached to a graph.'
        activated = true
        checkForNotesToSchedule(g)
    }
}
export default MasterClock


function checkForNotesToSchedule(g : NuniGraph) {
    const tempo = MasterClock.tempo
    for (const { audioNode: an } of g.nodes) {
        if (an instanceof SubgraphSequencer) {
            an.scheduleNotes(tempo)
        }
    }

    const goAgain = checkForNotesToSchedule.bind(null, g)

    window.setTimeout(goAgain)

    // More efficient, but sequencer stops when tabs are switched.
    // window.requestAnimationFrame(goAgain)
}