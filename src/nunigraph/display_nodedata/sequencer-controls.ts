






import { SubgraphSequencer } from '../../webaudio2/sequencers/subgraph-sequencer.js'
import { NuniGraphNode } from '../nunigraph_node.js'

export function sequencerControls(node : NuniGraphNode) {
    const an = node.audioNode
    const controls = E('div')

    {
        const btn = E('button')
        btn.innerText = 'play'
        btn.classList.add('kb-button')
        btn.classList.toggle('selected', an.isPlaying)
        btn.onclick = () => {
            const play = !an.isPlaying
            if (play) 
                an.play()
            else 
                an.stop()
            btn.classList.toggle('selected', play)
        }
        controls.appendChild(btn)
    }

    changeStepLength: {
        const text = E('span')
        text.innerText = an.nSteps.toString()
        ;['-','+'].forEach((op,i) => {
            const btn = E('button'); btn.innerText = op
            btn.classList.add('top-bar-btn')
            btn.onclick = () => {
                const v = clamp(0, 
                    an.nSteps + Math.sign(i - .5), 64)
    
                text.innerText = v.toString()
                an.updateSteps(v)
                an.gridSetup()
            }
            controls.appendChild(btn)
        })
        controls.appendChild(text)
    }
    
    an.gridSetup()
    controls.appendChild(an.HTMLGrid)

    return controls
}
