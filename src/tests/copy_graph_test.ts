






import { GraphController } from "../nunigraph/init.js"
import { NuniGraphNode } from "../nunigraph/model/nunigraph_node.js"







export {}

function cycleGraph(input : string) {
    GraphController.fromString(input)
    return GraphController.g.toRawString()
}

// Legacy tests are importing for checking if new changes could break old graphs
const tests =
    { legacy0_subgraphSequencerTest: `{"connections":{"2":[{"id":31,"connectionType":"channel"},{"id":32,"connectionType":"channel"}],"10":[{"id":31,"connectionType":"channel"},{"id":32,"connectionType":"channel"}],"14":[{"id":31,"connectionType":"channel"},{"id":32,"connectionType":"channel"}],"21":[{"id":31,"connectionType":"channel"},{"id":32,"connectionType":"channel"}],"31":[{"id":0,"connectionType":"channel"}],"32":[{"id":0,"connectionType":"channel"}]},"nodes":[{"id":0,"type":"gain","x":0.2356020942408377,"y":0.2256,"title":"OUTPUT","audioNode":{},"audioParamValues":{"gain":0.11026455634455669},"audioNodeProperties":{},"oldId":0},{"id":2,"type":"oscillator","x":0.4439463034421015,"y":0.8471842732802983,"audioNode":{},"audioParamValues":{"frequency":616.273818350148,"detune":0},"audioNodeProperties":{"type":"sine","kbMode":false},"oldId":2},{"id":10,"type":"oscillator","x":0.2839463034421015,"y":0.8471842732802983,"audioNode":{},"audioParamValues":{"frequency":401.5382747706823,"detune":0},"audioNodeProperties":{"type":"sine","kbMode":false},"oldId":10},{"id":14,"type":"oscillator","x":0.6039463034421009,"y":0.8471842732802983,"audioNode":{},"audioParamValues":{"frequency":945.8461199016966,"detune":0},"audioNodeProperties":{"type":"sine","kbMode":false},"oldId":14},{"id":21,"type":"oscillator","x":0.12394630344210147,"y":0.8471842732802983,"audioNode":{},"audioParamValues":{"frequency":261.6255653005987,"detune":0},"audioNodeProperties":{"type":"sine","kbMode":false},"oldId":21},{"id":31,"type":"subgraph-sequencer","x":0.7002388535031847,"y":0.25098554533508544,"audioNode":{},"audioParamValues":{},"audioNodeProperties":{"subdiv":6,"isInSync":false,"nSteps":6,"adsrIndex":1,"stepMatrix":{"2":[1,0,0,0,0,0],"10":[false,true,0,0,0,true],"14":[false,0,true,0,true,0],"21":[false,0,0,true,0,0]},"phaseShift":0.0498046875,"channelData":{"2":{"volume":1.3906547464430332},"10":{"volume":1.2373575009405613},"14":{"volume":1.2191278676036745},"21":{"volume":1.165646020323038}}},"oldId":31},{"id":32,"type":"subgraph-sequencer","x":0.865843949044586,"y":0.38107752956636004,"audioNode":{},"audioParamValues":{},"audioNodeProperties":{"subdiv":4,"isInSync":false,"nSteps":4,"adsrIndex":2,"stepMatrix":{"2":[1,0,0,0],"10":[false,true,false,0],"14":[false,0,true,0],"21":[false,0,0,true]},"phaseShift":0.0791015625,"channelData":{"2":{"volume":1.3315911928657442},"10":{"volume":1.8361374773085117},"14":{"volume":1.612959299251088},"21":{"volume":1.3413019362051273}}},"oldId":32}]}`
    , subgraphSequencerTest: `{"connections":{"2":[{"id":31,"connectionType":"channel"},{"id":32,"connectionType":"channel"}],"10":[{"id":31,"connectionType":"channel"},{"id":32,"connectionType":"channel"}],"14":[{"id":31,"connectionType":"channel"},{"id":32,"connectionType":"channel"}],"21":[{"id":31,"connectionType":"channel"},{"id":32,"connectionType":"channel"}],"31":[{"id":0,"connectionType":"channel"}],"32":[{"id":0,"connectionType":"channel"}]},"nodes":[{"id":0,"type":"gain","x":0.2356020942408377,"y":0.2256,"title":"OUTPUT","audioNode":{},"audioParamValues":{"gain":0.11026455634455669},"audioNodeProperties":{},"oldId":0},{"id":2,"type":"oscillator","x":0.4439463034421015,"y":0.8471842732802983,"audioNode":{},"audioParamValues":{"frequency":616.273818350148,"detune":0},"audioNodeProperties":{"type":"sine","kbMode":false},"oldId":2},{"id":10,"type":"oscillator","x":0.2839463034421015,"y":0.8471842732802983,"audioNode":{},"audioParamValues":{"frequency":401.5382747706823,"detune":0},"audioNodeProperties":{"type":"sine","kbMode":false},"oldId":10},{"id":14,"type":"oscillator","x":0.6039463034421009,"y":0.8471842732802983,"audioNode":{},"audioParamValues":{"frequency":945.8461199016966,"detune":0},"audioNodeProperties":{"type":"sine","kbMode":false},"oldId":14},{"id":21,"type":"oscillator","x":0.12394630344210147,"y":0.8471842732802983,"audioNode":{},"audioParamValues":{"frequency":261.6255653005987,"detune":0},"audioNodeProperties":{"type":"sine","kbMode":false},"oldId":21},{"id":31,"type":"subgraph-sequencer","x":0.7002388535031847,"y":0.25098554533508544,"audioNode":{},"audioParamValues":{},"audioNodeProperties":{"subdiv":6,"subdivisionSynced":false,"isInSync":false,"nSteps":6,"adsrIndex":1,"stepMatrix":{"2":[1,0,0,0,0,0],"10":[false,true,0,0,0,true],"14":[false,0,true,0,true,0],"21":[false,0,0,true,0,0]},"phaseShift":0.0498046875,"channelData":{"2":{"volume":1.3906547464430332},"10":{"volume":1.2373575009405613},"14":{"volume":1.2191278676036745},"21":{"volume":1.165646020323038}}},"oldId":31},{"id":32,"type":"subgraph-sequencer","x":0.865843949044586,"y":0.38107752956636004,"audioNode":{},"audioParamValues":{},"audioNodeProperties":{"subdiv":4,"subdivisionSynced":false,"isInSync":false,"nSteps":4,"adsrIndex":2,"stepMatrix":{"2":[1,0,0,0],"10":[false,true,false,0],"14":[false,0,true,0],"21":[false,0,0,true]},"phaseShift":0.0791015625,"channelData":{"2":{"volume":1.3315911928657442},"10":{"volume":1.8361374773085117},"14":{"volume":1.612959299251088},"21":{"volume":1.3413019362051273}}},"oldId":32}]}`
    }

function runGraphWholeCopyTests() {
    let passed = 0, failed = 0
    for (const name in tests) 
    {
        const code1 = (name.startsWith('legacy')
            ? (s : string) => cycleGraph(cycleGraph(s))
            : (x : string) => x
            )(tests[name as keyof typeof tests])
        const code2 = cycleGraph(cycleGraph(code1))

        if (code1 !== code2)
        { 
            console.warn(`Failed test: ${name}`)
            console.log('code1', code1)
            console.log('code2', code2)
            failed++
        } else {
            passed++
        }
    }
    GraphController.g.clear()
    GraphController.renderer.render()
    log(`${passed}/${passed + failed} tests passed`)
}
runGraphWholeCopyTests()




const g = GraphController.g // new NuniGraph()
;(function control_s_sgs_test() {
    g.clear()
    let passed = 0, failed = 0
    
    const sgs = g.createNewNode(NodeTypes.SGS, 
        { x: .1
        , y: .5
        , audioParamValues:{}
        , audioNodeProperties:{}
        })

    const osc = g.createNewNode(NodeTypes.OSC, 
        { x: .3
        , y: .5
        , audioParamValues:{}
        , audioNodeProperties:{}
        })
    
    g.makeConnection(osc, sgs, 'channel')

    // const vol = sgs.audioNode.channelData[osc.id].volume = 0.5
    const row = sgs.audioNode.stepMatrix[osc.id] = [0,1,0,1,0,0,1,0].map(Boolean)

    const [sgs2, osc2] = g.reproduceNodesAndConnections([sgs, osc]) as 
        [NuniGraphNode<NodeTypes.SGS>, NuniGraphNode<NodeTypes.OSC>]

    const tests = 
        { 'id remapped correctly': JSON.stringify(sgs2.audioNode.stepMatrix[osc2.id]) === JSON.stringify(row)
        // , 'id remapped correctly 2': JSON.stringify(sgs2.audioNode.channelData[osc2.id].volume) === JSON.stringify(vol)
        }

    let name : keyof typeof tests
    for (name in tests) 
    {
        if (tests[name])
        {
            passed++
        }
        else
        {
            failed++
            throw `failed test: ${name}`
        }
    }  
    
    const code1 = g.toString()
    const code2 = cycleGraph(cycleGraph(code1))

    if (code1 !== code2) 
    { 
        console.warn(`Failed to copy correctly`)
        failed++
    } else {
        passed++
    }

    g.clear()
    log(`${passed}/${passed + failed} tests passed`)
})()
