






const G = new NuniGraph()

const bufferController = new BufferController(G)

KB.attachToGraph(G)

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