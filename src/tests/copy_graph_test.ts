






import { NuniGraph } from "../nunigraph/model/nunigraph.js"
import { GraphController } from "../nunigraph/init.js"







function cycleGraph(input : string) {
    // GraphController.save()
    // GraphController.closeAllWindows()
    // GraphController.fromString(input)
    // GraphController.renderer.render()
    // return GraphController.g.toRawString()
}

const graphs = //[
    [] as string[]

test_graph_copy: {
    let passed = 0, failed = 0
    for (const code1 of graphs) 
    {
        const code2 = cycleGraph(code1)
        // const g = new NuniGraph()
        // log('0')
        // g.fromRawString(graphJSON)
        // log('1')
        // const code1 = g.toRawString()
        // log('2')
        // g.fromRawString(code1)
        // log('3')
        // const code2 = g.toRawString()
        // log('4')

        
        // if (code1 !== code2) { 
        //     failed++
        // } else {
        //     passed++
        // }
    }
    console.log(`${passed}/${passed + failed} tests passed`)
}