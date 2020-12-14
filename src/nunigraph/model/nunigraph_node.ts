






import { audioCtx, AudioNodeMap } from '../../webaudio2/internal.js'

const is
    = <T extends NodeTypes>(node : NuniGraphNode, type : T)
    : node is NuniGraphNode<T> => node.type === type

export class NuniGraphNode<T extends NodeTypes = NodeTypes> {

    readonly id : number
    readonly type : T
    readonly audioNode : InstanceType<typeof AudioNodeMap[T]>
    x : number
    y : number
    audioParamValues : Indexable<number>
    title? : string
    graphLabel : string | number
    readonly INPUT_NODE_ID? : { id : number }
    
    constructor(id : number, type : T, settings : NodeCreationSettings) {
        const 
            { x
            , y
            , audioParamValues
            , audioNodeProperties
            , title
            , INPUT_NODE_ID
            } = settings

        this.id = id
        this.type = type
        this.x = x
        this.y = y
        this.title = title
        this.INPUT_NODE_ID = INPUT_NODE_ID
        this.audioNode = audioCtx.createNode(type)
        this.graphLabel = NodeTypeGraphIcon[type]

        // TODO: make an AudioNode class for it.
        if (is(this, NodeTypes.NUM)) this.audioNode.start(0)




        if (this.type !== NodeTypes.COMPRESSOR)
        shit: {
        // CompressorNode throws error
            Object.assign(this.audioNode, JSON.parse(JSON.stringify(audioNodeProperties)))
            
            // ! PAINFUL BUG FIX >:(
            // Fixing bug: Sequencer channelVolume doesn't get copied over because it's a gain node.
            // requestAnimationFrame is needed because GateSequencer's input(s) need to be remmapped..
            // TODO: put this in a function: audioNode.doBadCode()
            requestAnimationFrame(() => {
                if (is(this, NodeTypes.S_SEQ) || is(this, NodeTypes.G_SEQ))
                {
                    if (is(this, NodeTypes.S_SEQ))
                    { // This fixed a bug:
                        this.audioNode.channelVolumes = {}
                    }
                    const { channelVolumes, channelData } = this.audioNode
                    for (const key in channelData)
                    {
                        if (!channelVolumes[key])
                        {
                            if (is(this, NodeTypes.G_SEQ)) throw 'Oh, okay. Do it for SGS as well.'
                            this.audioNode.createChannelVolume(+key)
                        }
                        channelVolumes[key].gain.value = channelData[key].volume
                    }
                    this.audioNode.refresh()
                    this.audioNode.hasDoneTheDirtyWork = true
                }
            })
        }

        this.audioParamValues = JSON.parse(JSON.stringify(audioParamValues))

        for (const param of AudioNodeParams[this.type]) 
        {
            const value = audioParamValues[param] ?? DefaultParamValues[param]
            this.setValueOfParam(param as ParamsOf<T>, value)
        }
    }

    setValueOfParam(param : ParamsOf<T>, value: number) {
        this.audioParamValues[param] = value
        this.audioNode[param].value = value
    }
}