






import { audioCtx, AudioNodeMap } from '../../webaudio2/internal.js'

export class NuniGraphNode<T extends NodeTypes = NodeTypes> {

    readonly id : number
    readonly type : T
    readonly audioNode : InstanceType<typeof AudioNodeMap[T]>
    x : number
    y : number
    audioParamValues : Indexable<number>
    title? : string
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

        if (this.type !== NodeTypes.COMPRESSOR)
        shit: {
        // CompressorNode throws error
            Object.assign(this.audioNode, JSON.parse(JSON.stringify(audioNodeProperties)))
            
            // ! PAINFUL BUG FIX >:(
            // Fixing bug: Sequencer channelVolume doesn't get copied over because it's a gain node.
            // requestAnimationFrame is needed because GateSequencer's input(s) need to be remmapped..
            // TODO: put this in a function: audioNode.doBadCode()
            requestAnimationFrame(() => {
                
                if (this.isOfType(NodeTypes.S_SEQ) || this.isOfType(NodeTypes.G_SEQ))
                {
                    if (this.isOfType(NodeTypes.S_SEQ))
                    { // This fixed a bug:
                        this.audioNode.channelVolumes = {}
                    }
                    const { channelVolumes, channelData } = this.audioNode
                    for (const key in channelData)
                    {
                        if (!channelVolumes[key])
                        {
                            if (this.isOfType(NodeTypes.G_SEQ)) throw 'Oh, okay. Do it for SGS as well.'
                            this.audioNode.createChannelVolume(+key)
                        }
                        channelVolumes[key].gain.value = channelData[key].volume
                    }
                    this.audioNode.refresh()
                    this.audioNode.play()
                    this.audioNode.hasDoneTheDirtyWork = true
                }
            })
        }

        if (this.isOfType(NodeTypes.NUM)) this.audioNode.start(0)

        this.audioParamValues = JSON.parse(JSON.stringify(audioParamValues))

        for (const param of AudioNodeParams[this.type]) 
        {
            const value = audioParamValues[param] ?? DefaultParamValues[param]
            this.setValueOfParam(param, value)
        }
    }

    setValueOfParam(param : ParamsOf<T>, value: number) {
        this.audioParamValues[param] = value
        this.audioNode[param].value = value
    }

    is<T extends NodeTypes> (types : Record<T, boolean>) : this is NuniGraphNode<T> { 
        return types[this.type as unknown as T]
    }

    isOfType<T extends NodeTypes> (type : T) : this is NuniGraphNode<T> { 
        return this.type as NodeTypes === type
    }
}