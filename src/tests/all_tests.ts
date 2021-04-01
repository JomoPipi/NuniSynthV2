






import { GraphController } from "../nunigraph/init.js"
import { NuniGraphNode } from "../nunigraph/model/nunigraph_node.js"




export {}




function cycleGraph(input : string) {
    GraphController.fromString(input)
    return GraphController.g.toRawString()
}

// Legacy tests are importing for checking if new changes could break old graphs
const tests =
    { legacy_veryold_test: `{"connections":{"1":[{"id":5,"connectionType":"channel"}],"3":[{"id":4,"connectionType":"channel"}],"4":[{"id":0,"connectionType":"channel"}],"5":[{"id":0,"connectionType":"channel"}],"6":[{"id":3,"connectionType":"frequency"},{"id":8,"connectionType":"channel"}],"7":[{"id":6,"connectionType":"channel"}],"8":[{"id":10,"connectionType":"channel"}],"9":[{"id":10,"connectionType":"gain"}],"10":[{"id":3,"connectionType":"detune"},{"id":1,"connectionType":"detune"},{"id":22,"connectionType":"channel"}],"11":[{"id":12,"connectionType":"channel"},{"id":13,"connectionType":"channel"}],"12":[{"id":14,"connectionType":"channel"}],"13":[{"id":14,"connectionType":"channel"}],"14":[{"id":16,"connectionType":"channel"}],"15":[{"id":10,"connectionType":"gain"}],"16":[{"id":0,"connectionType":"channel"}],"17":[{"id":16,"connectionType":"detune"}],"18":[{"id":17,"connectionType":"channel"}],"22":[{"id":9,"connectionType":"detune"},{"id":15,"connectionType":"detune"}],"23":[{"id":24,"connectionType":"channel"}],"24":[{"id":22,"connectionType":"delayTime"}]},"nodes":[{"id":0,"type":"gain","x":0.44,"y":0.2714881780250348,"title":"OUTPUT","audioNode":{},"audioParamValues":{"gain":0.027871918041421816},"audioNodeProperties":{}},{"id":1,"type":"oscillator","x":0.5599999999999999,"y":0.4343810848400556,"audioNode":{},"audioParamValues":{"frequency":79.01640093601557,"detune":-1205},"audioNodeProperties":{"kbMode":false,"type":"triangle"}},{"id":3,"type":"oscillator","x":0.32,"y":0.4343810848400556,"audioNode":{},"audioParamValues":{"frequency":78.39877604635875,"detune":-1200},"audioNodeProperties":{"kbMode":false,"type":"triangle"}},{"id":4,"type":"panner","x":0.32,"y":0.2714881780250348,"audioNode":{},"audioParamValues":{"pan":-1},"audioNodeProperties":{}},{"id":5,"type":"panner","x":0.5599999999999999,"y":0.2714881780250348,"audioNode":{},"audioParamValues":{"pan":1},"audioNodeProperties":{}},{"id":6,"type":"subgraph-sequencer","x":0.19999999999999998,"y":0.4343810848400556,"audioNode":{"stepMatrix":{"7":[true,0,0,true,false,false,false,0]}},"audioParamValues":{},"audioNodeProperties":{"subdiv":8,"isInSync":true,"nSteps":8,"adsrIndex":0}},{"id":7,"type":"constant-source","x":0.08,"y":0.4343810848400556,"audioNode":{},"audioParamValues":{"offset":141.5625},"audioNodeProperties":{}},{"id":8,"type":"gain","x":0.19999999999999998,"y":0.5972739916550764,"audioNode":{},"audioParamValues":{"gain":21.582617187500002},"audioNodeProperties":{}},{"id":9,"type":"oscillator","x":0.32,"y":0.7601668984700973,"audioNode":{},"audioParamValues":{"frequency":97.97248721122742,"detune":0},"audioNodeProperties":{"kbMode":false,"type":"sine"}},{"id":10,"type":"gain","x":0.44,"y":0.5972739916550764,"audioNode":{},"audioParamValues":{"gain":0.5},"audioNodeProperties":{}},{"id":11,"type":"buffer","x":0.08,"y":0.2714881780250348,"audioNode":{},"audioParamValues":{"playbackRate":32,"detune":0},"audioNodeProperties":{"kbMode":false,"bufferKey":0}},{"id":12,"type":"subgraph-sequencer","x":0.19999999999999998,"y":0.2714881780250348,"audioNode":{"stepMatrix":{"11":[1,0,0,true,0,true,0,0]}},"audioParamValues":{},"audioNodeProperties":{"subdiv":16,"isInSync":true,"nSteps":8,"adsrIndex":0}},{"id":13,"type":"subgraph-sequencer","x":0.08,"y":0.1085952712100139,"audioNode":{"stepMatrix":{"11":[1,0,0,true,0,true,0,0]}},"audioParamValues":{},"audioNodeProperties":{"subdiv":16,"isInSync":true,"nSteps":8,"adsrIndex":1}},{"id":14,"type":"subgraph-sequencer","x":0.19999999999999998,"y":0.1085952712100139,"audioNode":{"stepMatrix":{"12":[1,true,true,true,true,true,true,false],"13":[true,0,true,false,true,false,true,true]}},"audioParamValues":{},"audioNodeProperties":{"subdiv":1,"isInSync":true,"nSteps":8,"adsrIndex":2}},{"id":15,"type":"oscillator","x":0.5599999999999999,"y":0.7601668984700973,"audioNode":{},"audioParamValues":{"frequency":97.97248721122742,"detune":700},"audioNodeProperties":{"kbMode":false,"type":"sine"}},{"id":16,"type":"filter","x":0.44,"y":0.1085952712100139,"audioNode":{},"audioParamValues":{"frequency":2191.24170449117,"Q":1,"gain":0.5,"detune":0},"audioNodeProperties":{"type":"lowpass"}},{"id":17,"type":"subgraph-sequencer","x":0.5599999999999999,"y":0.1085952712100139,"audioNode":{"stepMatrix":{"18":[1,0,true,0,true,0,true,0]}},"audioParamValues":{},"audioNodeProperties":{"subdiv":16,"isInSync":true,"nSteps":8,"adsrIndex":2}},{"id":18,"type":"constant-source","x":0.6799999999999999,"y":0.1085952712100139,"audioNode":{},"audioParamValues":{"offset":1217.203125},"audioNodeProperties":{}},{"id":22,"type":"delay","x":0.44,"y":0.7601668984700973,"audioNode":{},"audioParamValues":{"delayTime":0.5},"audioNodeProperties":{}},{"id":23,"type":"oscillator","x":0.6799999999999999,"y":0.5972739916550764,"audioNode":{},"audioParamValues":{"frequency":0.2636279140619098,"detune":0},"audioNodeProperties":{"kbMode":false,"type":"sine"}},{"id":24,"type":"gain","x":0.5599999999999999,"y":0.5972739916550764,"audioNode":{},"audioParamValues":{"gain":0.22617187500000002},"audioNodeProperties":{}}]}`
    , legacy0_subgraphSequencerTest: `{"connections":{"2":[{"id":31,"connectionType":"channel"},{"id":32,"connectionType":"channel"}],"10":[{"id":31,"connectionType":"channel"},{"id":32,"connectionType":"channel"}],"14":[{"id":31,"connectionType":"channel"},{"id":32,"connectionType":"channel"}],"21":[{"id":31,"connectionType":"channel"},{"id":32,"connectionType":"channel"}],"31":[{"id":0,"connectionType":"channel"}],"32":[{"id":0,"connectionType":"channel"}]},"nodes":[{"id":0,"type":"gain","x":0.2356020942408377,"y":0.2256,"title":"OUTPUT","audioNode":{},"audioParamValues":{"gain":0.11026455634455669},"audioNodeProperties":{},"oldId":0},{"id":2,"type":"oscillator","x":0.4439463034421015,"y":0.8471842732802983,"audioNode":{},"audioParamValues":{"frequency":616.273818350148,"detune":0},"audioNodeProperties":{"type":"sine","kbMode":false},"oldId":2},{"id":10,"type":"oscillator","x":0.2839463034421015,"y":0.8471842732802983,"audioNode":{},"audioParamValues":{"frequency":401.5382747706823,"detune":0},"audioNodeProperties":{"type":"sine","kbMode":false},"oldId":10},{"id":14,"type":"oscillator","x":0.6039463034421009,"y":0.8471842732802983,"audioNode":{},"audioParamValues":{"frequency":945.8461199016966,"detune":0},"audioNodeProperties":{"type":"sine","kbMode":false},"oldId":14},{"id":21,"type":"oscillator","x":0.12394630344210147,"y":0.8471842732802983,"audioNode":{},"audioParamValues":{"frequency":261.6255653005987,"detune":0},"audioNodeProperties":{"type":"sine","kbMode":false},"oldId":21},{"id":31,"type":"subgraph-sequencer","x":0.7002388535031847,"y":0.25098554533508544,"audioNode":{},"audioParamValues":{},"audioNodeProperties":{"subdiv":6,"isInSync":false,"nSteps":6,"adsrIndex":1,"stepMatrix":{"2":[1,0,0,0,0,0],"10":[false,true,0,0,0,true],"14":[false,0,true,0,true,0],"21":[false,0,0,true,0,0]},"phaseShift":0.0498046875,"channelData":{"2":{"volume":1.3906547464430332},"10":{"volume":1.2373575009405613},"14":{"volume":1.2191278676036745},"21":{"volume":1.165646020323038}}},"oldId":31},{"id":32,"type":"subgraph-sequencer","x":0.865843949044586,"y":0.38107752956636004,"audioNode":{},"audioParamValues":{},"audioNodeProperties":{"subdiv":4,"isInSync":false,"nSteps":4,"adsrIndex":2,"stepMatrix":{"2":[1,0,0,0],"10":[false,true,false,0],"14":[false,0,true,0],"21":[false,0,0,true]},"phaseShift":0.0791015625,"channelData":{"2":{"volume":1.3315911928657442},"10":{"volume":1.8361374773085117},"14":{"volume":1.612959299251088},"21":{"volume":1.3413019362051273}}},"oldId":32}]}`
    , legacy1_subgraphSequencerTest: `{"connections":{"2":[{"id":31,"connectionType":"channel"},{"id":32,"connectionType":"channel"}],"10":[{"id":31,"connectionType":"channel"},{"id":32,"connectionType":"channel"}],"14":[{"id":31,"connectionType":"channel"},{"id":32,"connectionType":"channel"}],"21":[{"id":31,"connectionType":"channel"},{"id":32,"connectionType":"channel"}],"31":[{"id":0,"connectionType":"channel"}],"32":[{"id":0,"connectionType":"channel"}]},"nodes":[{"id":0,"type":"gain","x":0.2356020942408377,"y":0.2256,"title":"OUTPUT","audioNode":{},"audioParamValues":{"gain":0.11026455634455669},"audioNodeProperties":{},"oldId":0},{"id":2,"type":"oscillator","x":0.4439463034421015,"y":0.8471842732802983,"audioNode":{},"audioParamValues":{"frequency":616.273818350148,"detune":0},"audioNodeProperties":{"type":"sine","kbMode":false},"oldId":2},{"id":10,"type":"oscillator","x":0.2839463034421015,"y":0.8471842732802983,"audioNode":{},"audioParamValues":{"frequency":401.5382747706823,"detune":0},"audioNodeProperties":{"type":"sine","kbMode":false},"oldId":10},{"id":14,"type":"oscillator","x":0.6039463034421009,"y":0.8471842732802983,"audioNode":{},"audioParamValues":{"frequency":945.8461199016966,"detune":0},"audioNodeProperties":{"type":"sine","kbMode":false},"oldId":14},{"id":21,"type":"oscillator","x":0.12394630344210147,"y":0.8471842732802983,"audioNode":{},"audioParamValues":{"frequency":261.6255653005987,"detune":0},"audioNodeProperties":{"type":"sine","kbMode":false},"oldId":21},{"id":31,"type":"subgraph-sequencer","x":0.7002388535031847,"y":0.25098554533508544,"audioNode":{},"audioParamValues":{},"audioNodeProperties":{"subdiv":6,"subdivisionSynced":false,"isInSync":false,"nSteps":6,"adsrIndex":1,"stepMatrix":{"2":[1,0,0,0,0,0],"10":[false,true,0,0,0,true],"14":[false,0,true,0,true,0],"21":[false,0,0,true,0,0]},"phaseShift":0.0498046875,"channelData":{"2":{"volume":1.3906547464430332},"10":{"volume":1.2373575009405613},"14":{"volume":1.2191278676036745},"21":{"volume":1.165646020323038}}},"oldId":31},{"id":32,"type":"subgraph-sequencer","x":0.865843949044586,"y":0.38107752956636004,"audioNode":{},"audioParamValues":{},"audioNodeProperties":{"subdiv":4,"subdivisionSynced":false,"isInSync":false,"nSteps":4,"adsrIndex":2,"stepMatrix":{"2":[1,0,0,0],"10":[false,true,false,0],"14":[false,0,true,0],"21":[false,0,0,true]},"phaseShift":0.0791015625,"channelData":{"2":{"volume":1.3315911928657442},"10":{"volume":1.8361374773085117},"14":{"volume":1.612959299251088},"21":{"volume":1.3413019362051273}}},"oldId":32}]}`
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
    console.log(`${passed}/${passed + failed} tests passed`)
}
runGraphWholeCopyTests()




const g = GraphController.g // new NuniGraph()
;(function control_s_sgs_test() {
    g.clear()
    let passed = 0, failed = 0
    
    const sgs = g.createNewNode(NodeTypes.G_SEQ, 
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
        [NuniGraphNode<NodeTypes.G_SEQ>, NuniGraphNode<NodeTypes.OSC>]

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
    console.log(`${passed}/${passed + failed} tests passed`)
})()







;(function copyingPianorollShouldNotThrowError() {
    g.createNewNode(NodeTypes.PIANOR)
    try 
    { 
        cycleGraph(g.toString()) 
    }
    catch (e)
    {
        console.warn('test failed! :( \n\n', e)
    }
    g.clear()
})()






//! Async
;(async function runSampleSequencerTests() {
    const node = g.createNewNode(NodeTypes.S_SEQ)
    const id = node.audioNode.addInput()
    let passed = 0, failed = 0
    try
    {
        node.audioNode.removeInput(id)
        passed++
    } 
    catch(e)
    {
        console.warn('Failed SampleSequencer channel-removal test: \n\n', e)
        failed++
    }

    try
    {
        g.clear()
        GraphController.closeAllWindows()
        const node = g.createNewNode(NodeTypes.S_SEQ)
        const id0 = node.audioNode.addInput()
        node.audioNode.removeInput(1) 
        
        // g.reproduceNodesAndConnections([node])
        GraphController.selectNode(node)
        ;(GraphController as any).keydown({ ctrlKey: true, keyCode: 83 })
        
        await wait(2)
        
        GraphController.closeAllWindows()
        passed++
    }
    catch(e)
    {
        console.warn('Sample Sequencer failed to be copied after deleting rows.', e)
        failed++
    }

    console.log(`${passed}/${(passed + failed)} tests passed`)
    g.clear()
})()

async function wait(ms : number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}