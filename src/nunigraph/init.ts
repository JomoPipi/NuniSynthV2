






const G = new NuniGraph()

KB.attachToGraph(G)
Buffers.attachToGraph(G)

// const GraphRenderer = 
//     createGraphCanvas(G, D('nunigraph-canvas') as HTMLCanvasElement)


const GraphController = 
    new NuniGraphController(
        G, 
        D('node-value-window')!,
        D('connection-type-prompt')!,
        new NuniGraphRenderer(
            G, 
            D('nunigraph-canvas') as HTMLCanvasElement,
            D('snap-to-grid') as HTMLInputElement
            )
        )