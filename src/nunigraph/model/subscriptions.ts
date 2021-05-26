






import { AudioNodeMap } from "../../webaudio2/audiocontext2.js";
import { KB, MasterClock } from "../../webaudio2/internal.js";
import { NuniGraphNode } from "./nunigraph_node.js";

export const PerformanceIterationSubscription = {
    apply(node : NuniGraphNode) {
        if (node.is(ClockDependent))
        {
            this.lists.ClockDependent.push(node.audioNode)
        }
        if (node.is(TakesKeyboardInput))
        {
            this.lists.TakesKeyboardInput.push(node.audioNode)
        }
    },
    
    terminate(node : NuniGraphNode) {
        this.lists.TakesKeyboardInput = this.lists.TakesKeyboardInput.filter(an => an !== node.audioNode)
        this.lists.ClockDependent = this.lists.ClockDependent.filter(an => an !== node.audioNode)
    },

    lists:
        { ClockDependent: [] as InstanceType<typeof AudioNodeMap[ClockDependent]>[]
        , TakesKeyboardInput: [] as InstanceType<typeof AudioNodeMap[keyof typeof TakesKeyboardInput]>[]
        }
}




KB.attachToGraph(function(keydown : boolean, key : number) {
    for (const audioNode of PerformanceIterationSubscription.lists.TakesKeyboardInput) 
    {
        audioNode.takeKeyboardInput(keydown, key)
    }
})




let lastSchedule = Date.now()
console.log('we here')
MasterClock.setSchedule(
{
    scheduleNotes() {
        const now = Date.now()
        const delta = now - lastSchedule
        const skipAhead = delta > 20000
        lastSchedule = now
        if (skipAhead) console.log(`${delta / 1000} seconds elapsed`)
        for (const audioNode of PerformanceIterationSubscription.lists.ClockDependent)
        {
            if (audioNode.isPlaying)
            {
                audioNode.scheduleNotes(skipAhead)
            }
        }
    },
    setTempo(tempo : number) {
        for (const audioNode of PerformanceIterationSubscription.lists.ClockDependent)
        {
            audioNode.setTempo(tempo)
        }
    },
    sync() {
        for (const audioNode of PerformanceIterationSubscription.lists.ClockDependent)
        {
            if (audioNode.isPlaying) audioNode.sync()
        }
    }
})