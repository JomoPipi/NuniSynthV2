






import { BufferNode2 } from './note_in/buffer2.js'
import { OscillatorNode2 } from './note_in/oscillator2.js'
import { SubgraphSequencer } from './sequencers/subgraph-sequencer.js'


export class AudioContext2 extends AudioContext {
    /** con·text    /ˈkäntekst/ 
     *  noun
     *      "the circumstances that form the setting for an event, 
     *      statement, or idea, and in terms of which it can be 
     *      fully understood and assessed."
     */

    createBuffer2() {
        return new BufferNode2(this)
    }

    createOscillator2() {
        return new OscillatorNode2(this) 
    }

    createSubgraphSequencer() {
        return new SubgraphSequencer(this)
    }
}

export const audioCtx = new AudioContext2()