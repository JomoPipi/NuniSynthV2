
/**
 * The job of the NuniGraph is to keep track of nodes, their values, and their connections
 * 
 * The graph should include:
 *      A list of NuniNodes
 *      A connection map
 *      functions to add, update, connect, delete nodes
 * 
 */

class NuniGraphNode {
    /**
     * Each NuniGraphNode holds and updates an AudioNode.
     * It knows nothing about other NuniGraphNodes
     */
    id: number
    type: NodeTypes
    audioNode: any// AudioNode & {[param:string]:AudioParam}
    x:number
    y:number
    audioNodeType: string
    [param: string]: any
    
    constructor( id : number, type : NodeTypes, options : {
            display: {x:number, y:number},
            audioParamValues: { [param:string]: number }
            audioNodeType: string
        } ) {
        this.id = id
        this.type = type
        const { display: {x,y}, audioParamValues, audioNodeType } = options

        this.x = x
        this.y = y

        this.audioNode = audioCtx[createAudioNode[type]]()
        this.audioNodeType = audioNodeType || this.audioNode.type
        this.audioNode.type = this.audioNodeType

        if (MustBeStarted[type])
            this.audioNode.start(0)

        for (const param of AudioNodeParams[type]) {

            const value = audioParamValues[param] || DefaultParamValues[param]
            this[param] = { value: value } 

            this.setValueOfParam(param, value)
        }
    }
    setValueOfParam(param : string, value: number) {
        
        this[param].value = value
        this.audioNode[param].setValueAtTime(value, 0)
    }
}

const G = (_ => {
    /**
     * The graph connects the nodes and keeps track of how they are connected
     * There will always be at least one node, the master gain
     */

    newId.id = 0; function newId() { return newId.id++ }
    
    const nodes = [] as NuniGraphNode[]

    const newNode = 
        (type : NodeTypes, 
        options : null | 
            { display: { x:number, y:number }, 
              audioParamValues: {},
              audioNodeType: string
            }
    ) => {
        if (!options) {
            options = {
                display: {x:0.5, y:0.5},
                audioParamValues: {},
                audioNodeType: ''
            }
        }

        const node = new NuniGraphNode( newId(), type, options )
        nodes.push(node)

        return node
    }

    const options = { 
        audioParamValues: { [NodeTypes.GAIN]: 0.5 },
        display: {x:0.5,y:0.125},
        audioNodeType: ''
        }

    const masterGainNode = newNode(NodeTypes.GAIN, options) 
    masterGainNode.audioNode.connect(audioCtx.destination)
    
    let selectedNode : any
    selectedNode = null

    const setConnection = (connectionType : ConnectionType) => 
        (x : any) => connectionType === 'channel' ? x : x[connectionType]

    const oneWayConnections :
        { [id1:number] : ConnecteeData }  = {}

    const connect = (node1 : NuniGraphNode, node2 : NuniGraphNode, connectionType : ConnectionType) => 
    {
        const destination = setConnection(connectionType)(node2.audioNode)
        
        node1.audioNode.connect(destination)
        
        const destinationData = {
            id: node2.id, 
            connectionType: connectionType
            }

        if (!oneWayConnections[node1.id] || oneWayConnections[node1.id].length === 0)
            oneWayConnections[node1.id] = [destinationData]
        else
            oneWayConnections[node1.id].push(destinationData)
    }

    const selectNodeFunc = function() {}

    return {

        nodes: nodes,
        oneWayConnections: oneWayConnections,

        selectedNode: selectedNode,

        newNode: newNode,
        connect: connect,
        isPromptingUserToSelectConnectee: false,
        selectNodeFunc: selectNodeFunc,

        selectNode: function(node : NuniGraphNode) {
            this.selectedNode = node
            this.selectNodeFunc()
        },

        unselectNode: function() {
            this.selectedNode = null
            this.selectNodeFunc()
        },

        deleteSelectedNode: function () {
            const node = this.selectedNode
            if (D('connection-type-prompt')!.style.display === 'block') {
                alert("Please finish what you're doing, first.")
                return;
            }

            if (node.id === 0) {
                alert('cannot delete this!')
                return;
            }
            // disconnect from others
            this.selectedNode.audioNode.disconnect()

            // remove from this.nodes
            const idx = this.nodes.findIndex(_node => 
                _node === node)
            this.nodes.splice(idx,1)

            // remove from oneWayConnections
            delete oneWayConnections[node.id]
            for (const id in oneWayConnections) {
                oneWayConnections[id] = 
                oneWayConnections[id].filter(({ id }) => id !== node.id)
            }

            GraphCanvas.render()
        },

        clear: function() {
            for (const node of [...this.nodes]) {
                if (node.id === 0) continue
                this.selectedNode = node
                this.deleteSelectedNode()
            }
            this.selectedNode = null
            GraphCanvas.render()
        },

        toString: function() {
            
            return compressGraphString(
            JSON.stringify(this.oneWayConnections) + ':::' +
            JSON.stringify(this.nodes).replace(/,"audioNode":{}/g, ""))
        },

// some graphs:
// {"3":[Āidă0,"connectiĎTypeăČhaďel"}]ċ5ăą"ćă6ċčĞĒĔnĖĘĚcĜĞĠĢċ6ĦĆĈ:3ĬĎĐįĕėę:"frequencyġ]}:Ŗħĩ:Ċ"tņĚgain"ċxĉ.3558ŪŬūŭŭŀ"ŒŚ.1848341232ƀ7Ź8ċŠŢăĀvalŎŧ5}},ĽăŲŝĳňoscillatorŤ"Ŧŵ207ƧƩƨƪƭċŴ0.4597156398104265ċaudĔNodeĲŇ"sŢęċŊŌŎŐŴƉƋƍ:ƽ0Ƒ"ǊtuĐƈ"ƊƌŇǝƑƓ:ǂŜŞƘƚƜƞƠƢťŧƩƵ2ǹǻǸ7ƯƎ3080Ƹ8ƫ379ƷǃǅǇǉǋǯǎǐƣǓōŏőǤǦǚ3ǞǠǢŇǘǧĉƐƒĨľīǮƗ"ƆţǶŵ495ȰȲȱȳȳǭưƲ7ƹ033175ũȲǭȬșǙŇ5ǩ]

// {"1":[Āidă0,"connectiĎTypeăČhaďel"}]ċ2ăą"ćă1ċčĞĒĔnĖĘĚfrequencyġģ"3ĦĆĈ:2ĬĎĐįĕėę:ěĝĐĠĢċ4łĨńņČňđēŋĳŎcĜĞŒ]}:ŧħĩ:Ċ"tŌĚgain"ċxĉ.5ċĽū.12ź"űųăĀvalĹŸ5}},ŃĪċŮş"oscillatorŵ"ŷŽ6806722Ƥ907563ŻŸ47045ƷƹƸƻ46ċaudĔNodeĲō"sųęċĵķĹĻżƆƈƊ:440Ǝ"ǆtuĐƅ"ƇƉōǚƎƐŅƒůŎƃŴŶƳ1830Ʀ5359ƴ7ſƁż0.488ưȄ3ȅȄƁǭǡǣǖ1ǴƍƏŗăƱŭǫƕƗƙƛƝƟǯŽ1ư0ƀ2Ȏ08Ǚ3ȆřǾȀƬȭ0ȮȰƿǁǃǅǇȖsĸaĶƠǏĸĺļȋǕō2ǛǝǟōǔǤĉȐǨ4ǪƔƖƘƚƜƞƠƢǿǱ3193277ɚȯ24ȆƲŽɣɟɞɪƨɬɞɎ"ǀǂoǄǆǈĚȸuȺǍ"ȽǑɀ:ɉǖ3ɅeǞǠʀǢɂɋĢ

// this one doesn't seem to work in FireFox:// {"1":[Āidă2,"connectiĎTypeă"frequency"}]ċ2ăą"ćă4ċčďđēĕėę:ČhaĲlĥħ"4ĪĆĈ:0İĎĐĒĔnĖĘĚcĺļĥ,ŃĉŇĲŊĵŎĸĜĞĠĢĤ}ŔĬń5ŗŉĴŌĶĚŝğġģľċ5łŤă1ŧĳŋōķĹĻĐĽŢŕ:įČňŹŚżgainű"6ŴĭƃŸřŪś"ƊƌƎ7Ƒń6ƔũŻŏőſƎ1ĂĄƂƟƅŘơūĸƙƍĦċ1ĩƩŵ:ƧƠźƯŽŒĦ}:ǂīƒņ"tƽƱ"ċxă0.103Ƨ28404669260ƫĤŅǐǝ385809ǓǤǦ7ċǊ:ĀvalĠǎ.0ǹ05}ƁƸŷǇǉƋƍǌǷ420233Ǚ3ǒ5019ǙċǡǏ57649ǚ7ǗȘȚ9ǮƘȃăǲǴǶƹǺǽţƒĊȁƗoscillatorǋ"ǍǢ54Ș87ɀɂɄɁȣȖ.ǥǨǝǞɄɌȉȚċaudĔNodeƢĸsƌęċŭşŰǱ"ǳǵķ8Ţ"ɛtuĐȦɧȨķ0ȬƂƄǈƗǊȅǢȇ4ƵɁ13618677ǒȕǷʁ16Ǧ14ʀ2ʀʐƫǰȧɩăȎǹɷƸŦȰżȲȴȶȸȺȼȾǏǕȑ55ȚȈȊȌ63ʌǢ3ȓʈǖǜȊʹ78ɔɖɘɚɜƽɟɱɢĝŮŠɲɨȩɫċɮɰķʚȩɶǾƒƫɺƉȥɽǏ7ȋȍȏȑȓʮȯɊʃȎ3șȓȑȋǒșǯȥɦˎķǑȑǸǺ˺Ǻȋʟƒȣ˛ĚʤȵȷȹȻ˞.ˠˠɀ0ǦǞǓƵ9ʶȗʈ62ȞȓɁ̗̕ˁɗoəɛɝǇriĻglɡěˊɤǡ˕ɪɬ˒ɱ˴ɴǎ˾ńƺʢĚɼȽǷ88ʃ229ȘȒǖ4ʄ̓ɋ21ȐʉǞ53͋ȐˀȤƚ̳ʛ:ʝ˗ȭ̷ȯ́ĸ̃ʦ̆ʩ̽Ƀ͌̓˯ˠǜ9̒"ɊʯɀǑȒ̓Ͱʀ̝˃̡ˆɠȼɣṷ̊ɳ͘ːɭeɯ̵̲̮Ħ

// {"1":[Āidă0,"connectiĎTypeăČhaďel"}]ċ2ăą"ćă1ċčĞĒĔnĖĘĚfrequencyġģ"3ĦĆĈ:2ĬĎĐįĕėę:ěĝĐĠĢċ4łĨńņČňđēŋĳŎcĜĞŒ]}:ŧħĩ:Ċ"tŌĚgain"ċxĉ.5039123630672926ċĽū.1Ƃ82Ż9ŽƎ0Ɛ05ċűųăĀvalĹŸ4}},ŃĪċŮş"oscillatorŵ"ŷƌ51685ż32584ƈ97ƊŸƀ80709ǀ4ǌǎǎċaudĔNodeĲō"sųęċĵķĹĻƋƞƠƢ:101.żƓǵǶ9ǅƦ"ǞtuĐƝ"Ɵơō0ƥƧŗăřƫǡƛŴŶǋ5Ɠ3740219ǐſ3Ǌƌ34ǄǸ004ǓȠ8ǸƚŲŴ:Ǭȃă55.Ƒȣȵȶȣ3Ȇƨ:ȜŭůŎƮưƲƴƶƸƺ0ƍ787ǀ8ƂǓƇſǉ"ƋɈ4Ɓ356ǈǴ5271ɋǗǙǛǝǟȿǢĸaĶƸǧĸĺļȀȂǮȹċǼǾōȮǮȅƦȻ4ƪɨɁƱƳƵƷȏƌɡ3Șǂ77ʊȚǓƉɔŸ24ʍɟʘƅʚɟɿ"ǘǚoǜǞǠĚsɪɬǦĶɯǪɲǭō2Ǻɷǿȭȁʮĉƥ]

// {"3":[Āidă0,"connectiĎTypeăČhaďel"}]ċ4ăą"ćă3ċčĞĒĔnĖĘĚcĜĞĠĢċ5ĦĆĈ:6ĬĎĐįĕėę:ěĝĐĸģ"6ļĨľĊČłđēŅĳňĵŊğġ]}:šħĩ:œtņĚgain"ċxĉ.5ċyű12ų"ŪŬăĀvaluŇ0.05}},ĽĪċŧř"pŜrŮ"Űť.3907603464870067ŹŵƗ285097192ƴƠƴ04ċƑŭ:žƀƂă-1ƈƊőăƹ"ƎŇ"oscillatoƓůűƙƛƝƟơƣƥƧƩű49ƧƝŸ917Ƴ65ơċaudĔNodeĲǋsŬęċfreqƂncƪƾƁŇ2ƥƉ"ǶtuĐŽ"ſȇĉǄƋ:ŹǊĚǍǏǑǓǕƔƖƄ6ǩƚ18Ƭ681424ǈƪƄǣǥ0ǧȥ2ǬǮ"ǰǲoǴǶǸĚǺȐǽǿȁeȃȅȒƿȈƆȋȍȏŇȆǀťȖǆĿƍŨňƻĐǖƕűȤ9ȨǠơǤ631ī"ȱ.2Ɯ457883369ɵƸ7ƺĝȑȓɔǃĢ

// {"1":[Āidă2,"connectiĎTypeăČhaďel"},ĆĈ:3ċčĞĒĔnĖĘĚpĝġ]ċ2ăą"ćă4ĨĎĐīĕėę:"frequencyġģĹĥ6ĽĪēŁįńınĳċ3ķĤă0ŔĿŖĭłĚcĜĞĠ}Ĵ"4şőăħČľđťĮŃěĝĐŬŐĺ:œŵŕĬŹŨŪŽŜ"6űƀŢƃŤƅŧńũżğĳ}:ƚĸƎċtƓ"gaiśċxš.49663137ƭ233879ċŎ:0.097192ǃ46ǃ0302ļơƣś:ĀvalŊƨǊ}ĢŠĦƞƠŚĐr"Ʀƨƴ3ƿƪ759Ƶ4ǊŴƺƼ285ƾǀǂǄǆ20ǌŚăǑǓǕ:-1ǘſĥǌƟŘ"oscillatoǠǢƻƩ7353Ǆ25Ǭ9Ǻ7ƹƨ552915Ʊ6Ș8ƬƾċaudĔNodeƆńtriĝglęċņňŊŌƺǾǔŃǹ0Ģ"ȸtuĐǽ"ǒɊšȄǚƂȈźǞeȔ"ƧȖ6410ɧƫǋƭȠƱȣȖ3ɥȝ269ƿ8Ǭ1ȘċǼǐɕǿŃȃǙŲ:1ǜȉȋȍȏȑȓǡɡȤƯ9ȥ7ɳȯȝǊɮǰȬ81ǲ7451ǬƵƸ"ȲȴoȶȸȺ"sƤɂŅŇŉŋōɔɖȀǳɎɐɒŃɉȀɍʂƀĊ"ɜĚƢƤʍɢƼʟƴǹǳǺʛƳǁƂǯ.ǥƾǱʓȪ0ǁ4ƵȢǍˇɽʶʀɰ.ɴɵ˨˩98əʃŴ˄ńfȎtɟˈǖɤʠ61ȧǈǃ580˓ǣʟȪƳȞ211Ƭǉ5ȱȳȵȷȹƠlowıssʍɄʲɇʵɿĻǬɎQ̞ɗʄɎˆǏʽŃƼ5ʹeɑɓˢ̟ƻ˭ƀȇƠ˲l˴ɠˉ.Ǫʟ́șƵ˺ǁȝʘ˕̇̉̋́ɴȞƂʦ̐ʪ̗̙̓̕ɃʱɆʴ̲̥4̡ċ̣͛Ȁȃċ̨̤ʾ.̭ċʺ̱̪ɘŭ
        
// {"1":[Āidă14,"connectiďTypeăčhaĐel"}]Č2ăą"ćĉČĎğēĕnėęěcĝğġ},ĆĈ:8ĬďđįĖĘĚ:ĜĞđĸĤ"5ħĻă6ĿĮĔŃĳņĵňĠĢĺĩļ1ŒŁŔıńĴĶŉśŏ:şčŀĒŢĲŅ"dĠayTimĚģČ6Ŏŝă2ŠŮİŰěfrequencyĢŋ8žĪ:0ƂłţŖŇķƐČ10ƓŞƗůŤņųlŵŷŹƝāĂĄũƟƣƄƥƛŧŻā3ơăƖŬœƳƚŘƜƷĊƺŪ3Ʋŕűǁƶŋ1ōƯſǆǈƙűpĞƐ}:ǚĨƔƼtƴgain"Čxƻ.50251Ǭ628Ċ070Ǉ"Əƕ.133Ƕ76940ǼǾ3ȀČǡǣăĀvalƋǨ5}ĹưČǟƚƧŵǥ"ǧǺǼ0653266ǽ1Ȣ8Ƿǹ0.3Ɵ42Ǯ86ǶȱȳǷȚŶŸŅȍȏȑǺȓȕǑƁ"ȘűoscilƨtorȜȞȮǪǬǮ5ǰǲȃǵȬǨȰ0ȲȴȶɠɢǷaudĕNoųƅņsǣĚČƇƉƋƍǹȿȐŅ200ĹŲetuđȌ"ȎɻƻȔŜƔ5ȗƴɊɌɎaɐɒǦǨ88Ȃ472361809ɡʎǸȒʟ58ȣȪʬʪő"ɨɪoɬɮƴɱʅɴƈƊƌƎʆʈɁɕʀųʃʅ:ɺˁʋũʰɈěȊǤʗǺʙ1ʤ95ʜ73ȵ93ʦȭȯȸɣȷɡȹȉǢǤˇʇɀŅ˙.ɽɾ˰˱ȄˊǑľɇǠ˧ɓʘʚ4ʜʞʠʢʤ4˞ǨˢɥȳǱɤ˦ȋ˩ˀŅȮ1˴ƔƱ˷ƚˏ˺ȟ˝67ȫ9˔59799Č˟˗Ȁ7ʡȃ˝ʜ̛Ɇ̗̍˫Ǩ˳Ʉ̓ūˍņʑɍɏɑ̘ɕɘɚǳɝǭ˶̦49ʙ̞˝Ǭ͇ʚČʲɫɭeɯ"ʸɳ"ɵʼɸʿ̲Ū6˃ʂʄȾ˪ʉƕ̒ŞǷ̸"ǖğʖȝɟȡȣȥȧȰȪ2̤ʧǺʣ̡̜2ǵǪ̣7̜Ƿͬͥ͜ɿ̵Şċ̕ű̗ˑ̐ǯǱ͂Ƕǭ7ʪ̥̅4˔ȡ8˙ʠΚʤ7̋˨ˈ̏ǩͧĉʦ̺ͪʓʕ̾ˠǎ5΂͉˽ʝʟɞǺ2Κ6ʫĊΚκȩʫɧɩ͑ʶƚ͖Ȝ͙ɷʾ̱ͥ8͠˅ͣ̎ʊģ
        
        fromString: function(s : string) {
            s = decompressGraphString(s)
            this.clear()
            const [connections, nodes] = s.split(':::').map(s => JSON.parse(s))
            
            if (nodes[0].id !== 0) throw 'Oh, I did not expect this.'
            this.nodes[0].x = nodes[0].x
            this.nodes[0].y = nodes[0].y
            this.nodes[0].setValueOfParam('gain', nodes[0].gain.value)
            this.nodes[0].audioNode.disconnect()
            this.nodes[0].audioNode.connect(audioCtx.destination)

            // recreate the nodes
            for (const node of nodes.filter(
            (node : NuniGraphNode) => node.id !== 0)) {

                const t : NodeTypes = node.type
                const values : {[key:string] : number} = {}
                for (const param of AudioNodeParams[t]) {
                    values[param] = node[param].value
                }
                const options = {
                    display: {x: node.x, y: node.y},
                    audioParamValues: values,
                    audioNodeType: node.audioNodeType
                }

                this.nodes.push(new NuniGraphNode(node.id, node.type, options))
            }

            // reconnect the nodes
            for (const id in connections) {
                for (const { id: id2, connectionType } of connections[id]) {
                    const node1 = this.nodes.find(node => node.id === +id)!
                    const node2 = this.nodes.find(node => node.id === id2)!
                    
                    this.connect(node1, node2, connectionType)
                }
            }
            newId.id = 
                Math.max(...this.nodes.map(node=>node.id)) + 1

            GraphCanvas.render()
        }
    }
})()


// const compressionMap : string[] = 
// // this doesn't help much and therefore gets commented out
// `connectionType,channel,value,oscillator,gain,filter,frequency
// audioNodeType,sine,triangle,square,sawtooth,detune,lowpass`
//     .replace('\n',',').split(',')

// function preCompress(s : string) : string {
//     return compressionMap.reduce((a,v,i) => 
//         a = a.replace('"' + v + '":', '~' + i), s)
// }

// function postDecompress(s : string) : string {
//     return compressionMap.reduce((a,v,i) => 
//         a = a.replace('~' + i, '"' + v + '":'), s)
// }



function compressGraphString
(uncompressed : string) : string {
    // Build the dictionary.
    const dictionary : { [n:string]:number } = {};
    for (let i = 0; i < 256; i++)
    {
        dictionary[String.fromCharCode(i)] = i;
    }

    let word = '';
    let dictSize = 256;
    const result = [];

    for (let i = 0, len = uncompressed.length; i < len; i++)
    {
        let curChar = uncompressed[i];
        let joinedWord = word + curChar;

        // Do not use dictionary[joinedWord] because javascript objects 
        // will return values for myObject['toString']
        if (dictionary.hasOwnProperty(joinedWord)) 
        {
            word = joinedWord;
        }
        else
        {
            result.push(dictionary[word]);
            // Add wc to the dictionary.
            dictionary[joinedWord] = dictSize++;
            word = curChar;
        }
    }

    if (word !== '')
    {
        result.push(dictionary[word]);
    }

    return result
        .map(c=>String.fromCharCode(c))
        .join('')
}








function decompressGraphString(compressedStr : string) : string
{
    const compressed = 
        compressedStr.split('').map((c:string)=>c.charCodeAt(0))
    // Initialize Dictionary (inverse of compress)
    let dictionary : any = {};
    for (let i = 0; i < 256; i++)
    {
        dictionary[i] = String.fromCharCode(i);
    }

    let word = String.fromCharCode(compressed[0]);
    let result = word;
    let entry = '';
    let dictSize = 256;

    for (let i = 1, len = compressed.length; i < len; i++)
    {
        let curNumber = compressed[i];

        if (dictionary[curNumber] !== undefined)
        {
            entry = dictionary[curNumber];
        }
        else
        {
            if (curNumber === dictSize)
            {
                entry = word + word[0];
            }
            else
            {
                throw 'Error in processing'
            }
        }

        result += entry;

        // Add word + entry[0] to dictionary
        dictionary[dictSize++] = word + entry[0];

        word = entry;
    }

    return result;
}