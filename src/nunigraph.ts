
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
     * It knows nothing about other NuniGraphNodes, but the AudioNode
     * that it holds gets connected to other NuniGraphNodes' AudioNodes
     */
    id: number
    type: NodeTypes
    audioNode:  Indexible
    x:number
    y:number
    audioNodeType: string
    audioParamValues: Indexible
    
    constructor( id : number, type : NodeTypes, options : {
            display: {x:number, y:number},
            audioParamValues: Indexible
            audioNodeType: string
        } ) {

        const { display: {x,y}, audioParamValues, audioNodeType } = options

        this.id = id
        this.type = type
        this.x = x
        this.y = y


        this.audioNode = audioCtx[createAudioNode[type]]()
        this.audioNodeType = audioNodeType || this.audioNode.type
        this.audioNode.type = this.audioNodeType
        this.audioParamValues = audioParamValues

        if (MustBeStarted[type])
            this.audioNode.start(0)

        for (const param of AudioNodeParams[type]) {

            const value = audioParamValues[param] || DefaultParamValues[param]
            this.setValueOfParam(param, value)
        }
    }
    setValueOfParam(param : string, value: number) {
        
        this.audioParamValues[param] = value
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
              audioParamValues: Indexible,
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

    const setConnection = (connectionType : ConnectionType) => 
        (x : Indexible) => connectionType === 'channel' ? x : x[connectionType]

    const oneWayConnections :
        { [id1 : number] : ConnecteeData }  = {}

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

    const selectedNode : any = null
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
// {"3":[Āidă0,"connectiĎTypeăČhaďel"}]ċ5ăą"ćă6ċčĞĒĔnĖĘĚcĜĞĠĢċ6ĦĆĈ:3ĬĎĐįĕėę:"frequencyġ]}:Ŗħĩ:Ċ"tņĚgain"ċxĉ.3558ŪŬūŭŭŀ"ŒŚ.1848341232ƀ7Ź8ċaudĔParamValŎsăĀŠŢŧ5}},ĽăŲŝĳňoscillatorŤ"Ŧŵ207ƱƳƲƴƷċŴ0.4597156398104265ƅƇƉƋƍƏƑeƓ:ĀŊŌŎŐŴǇśdetuĐĉƛ"ƆƈoNoǟĲŇ"sŢęƛƝ:ǌŜŞƢƤƦƨƪƬťŧƳƿ2ȂȄȁ7ƹƘ3080ǂ8Ƶ379ǁǍǨƊƌƎƐƒƔŉŋōŏőƞċǟǡǣŚǥǧĔǪǬǸǯǱġƜĨľīǷơ"Ɩţǿŵ495ȼȾȽȿȿǶƺƼ7ǃ033175ũȾǶȩoȗǑȚǔȜȸă50ƚ]

// {"1":[Āidă0,"connectiĎTypeăČhaďel"}]ċ2ăą"ćă1ċčĞĒĔnĖĘĚfrequencyġģ"3ĦĆĈ:2ĬĎĐįĕėę:ěĝĐĠĢċ4łĨńņČňđēŋĳŎcĜĞŒ]}:ŧħĩ:Ċ"tŌĚgain"ċxĉ.5ċĽū.12ź"audĔParamValĹsăĀűųŸ5}},ŃĪċŮş"oscillatorŵ"ŷŽ6806722Ʈ907563ŻŸ47045ǁǃǂǅ46ċƃƅoƇƉƋƍƏƑ"ĵķĹĻż44ŬdetuĐĉƘƂƄĔNoǜĲō"sųęƘƚŅƜůŎƓŴŶƽ1830ư5359ƾ7ſƁż0.488ƺȌ3ȍȌƁǊƆƈƊƌƎeƐ:ƒŲŴ:1ǼƗƙŗăƻŭǳƟơƣƥƧƩǷŽ1ƺ0ƀ2ȟ08ǚ3ȎřȆȈƶȾ0ȿɁǉǤǌȔǏȗșĀǔĸĺļăřǜǞǠūǢȒoǦǨȧsĸƈǮȢŪ4ǲƞƠƢƤƦƨƪƬȇǹ3193277ɭɀ24ȎƼŽɶɲɱɽƲɿɱɡǣǋǍȕǐȘǒɋǖɎ:ȥɑǟō0ɕɄɘeǩĚɛuɝľ

// this one doesn't seem to work in FireFox:
// {"1":[Āidă2,"connectiĎTypeă"frequency"}]ċ2ăą"ćă4ċčďđēĕėę:ČhaĲlĥħ"4ĪĆĈ:0İĎĐĒĔnĖĘĚcĺļĥ,ŃĉŇĲŊĵŎĸĜĞĠĢĤ}ŔĬń5ŗŉĴŌĶĚŝğġģľċ5łŤă1ŧĳŋōķĹĻĐĽŢŕ:įČňŹŚżgainű"6ŴĭƃŸřŪś"ƊƌƎ7Ƒń6ƔũŻŏőſƎ1ĂĄƂƟƅŘơūĸƙƍĦċ1ĩƩŵ:ƧƠźƯŽŒĦ}:ǂīƒņ"tƽƱ"ċxă0.103Ƨ28404669260ƫĤŅǐǝ385809ǓǤǦ7ċaudĔParamValĠsăĀǊǢ0Ȃ05}ƁƸŷǇǉƋƍǌǎ.420233Ǚ3ǒ5019ǙċǡǏ57649ǚ7ǗȢȤ9Ǯ"ǰǲoǴǶǸǺǼǾƘȌŶȃȆţƒĊȊƗoscillatorǋ"ǍǢ54Ȣ87ɐɒɔɑȭȠ.ǥǨǝǞɔɜȓȤǯǱǳǵǷǹǻeǽ:ĀŭşŰ:8ċdetuĐǎŢȮɥoNoɵƢĸsƌęȇƒƄǈƗǊȎǢȑ4Ƶɑ13618677ǒȟȏʑ16Ǧ14ʐ2ʐʠƫȯɦȳɩȶɭȸƚ:ȘȂȼƂŦɀżɂɄɆɈɊɌɎǏǕț55ȤȒȔȖ63ʜǢ3ȝʘǖǜȔˎ7ɳɼȰȲɨȵɫȷɯůǡ˕ɵɷɹŅɻʩɾʀeʂ"ʄɹʇƞċʊƉȹʍǏ7ȕȗșțȝ˃ȿɚʓȘ3ȣȝțȕǒȣɤ˗ɧȴɪɬǿȹƹȂ1.ȃ̔̔ȕʴƸȭ˱ĚʹɅɇɉɋ˴.˶˶ɐ0ǦǞǓƵ9ˋȡʘ62Ȩȝɑ̯̱̈ʪ˙̌˜ĝŮŠăˠɶɸķ0˥ɽɿʁƽtriĻglʆȽńƺʷĚʌɍȏ88ʓ229ȢȜǖ4ʔ̭ɛ21ȚʙǞ53ͦȚ˕˦˘̋ʭ̎ʰʲ̈́ˮŶȿ̛ĸ̝ʻ̠ʾ͘ɓͧ̅͞˶ǜ9̬"ɚ˄ɐǑȜ͞Όʐ̷ȱ̊ʬ˛ʮ˝̾ɲɴ́ˣ̈́Γ͇˩ƽˬʆ]

// {"1":[Āidă0,"connectiĎTypeăČhaďel"}]ċ2ăą"ćă1ċčĞĒĔnĖĘĚfrequencyġģ"3ĦĆĈ:2ĬĎĐįĕėę:ěĝĐĠĢċ4łĨńņČňđēŋĳŎcĜĞŒ]}:ŧħĩ:Ċ"tŌĚgain"ċxĉ.5039123630672926ċĽū.1Ƃ82Ż9ŽƎ0Ɛ05ċaudĔParamValĹsăĀűųŸ4}},ŃĪċŮş"oscillatorŵ"ŷƌ51685ż32584ƈ97ƊŸƀ80709Ǌ4ǖǘǘƚƜƞƠƢƤƦeƨ:ĀĵķĹĻƋ101.żƓǶǷ9ǏċdetuĐĉư"ƛƝoNoǼĲō"sųęưƲŅƴůŎƫŴŶǕ5Ɠ3740219ǚſ3ǔƌ34ǎǹ004ǝȩ8ǹǡȅƟơƣƥƧƩ"Ȗă55.ƑȬɂɃȬ3ƯƱŗăȥŭȔƷƹƻƽƿǁȘƌ1787Ǌ8ƂǝƇſǓ"Ƌ0.4Ɓ356ǒǵ5271ɘȳǣȶǦȹǪ"ǬĸĺļɊǻǽǿō0ȂȄĔȇȉɍsĸƠȏɈŪ4ȓƶƸƺƼƾǀǂǄɣɯ3ȡǌ77ʚȣǝƉɡŸ24ʝɭʨƅʪɭʎȃǢoȵǥȸǨȺɸǮɻȒ"ǼǾȀūʂʯʅeȊĚʈuʊľ

// {"1":[Āidă2,"connectiĎTypeăČhaďel"},ĆĈ:3ċčĞĒĔnĖĘĚpĝġ]ċ2ăą"ćă4ĨĎĐīĕėę:"frequencyġģĹĥ6ĽĪēŁįńınĳċ3ķĤă0ŔĿŖĭłĚcĜĞĠ}Ĵ"4şőăħČľđťĮŃěĝĐŬŐĺ:œŵŕĬŹŨŪŽŜ"6űƀŢƃŤƅŧńũżğĳ}:ƚĸƎċtƓ"gaiśċxš.49663137ƭ233879ċŎ:0.097192ǃ46ǃ0302ļ"audĔParamValŊsăĀƢƤƨǊ}ĢŠĦƞƠŚĐr"Ʀƨƴ3ƿƪ759Ƶ4ǊŴƺƼ285ƾǀǂǄǆ20ǌǎǐoǒǔǖǘǚǜ"Śă-1ǢſĥǌƟŘ"oscillatoǪǬƻƩ7353Ǆ25Ƕ9Ȅ7ƹƨ552915Ʊ6Ȩ8ƬƾċȆǑǓǕǗǙeǛ:ĀņňŊŌƺȃƏdetuĐšĢǍǏĔNoɓƆńtriĝglęǣŲƁǦșǨeȤ"ƧȦ6410ɷƫǋƭȰƱȳȦ3ɵȭ269ƿ8Ƕ1ȨɁɛȈɄȋɇɉĀȐ:ȓɩƀ1ɬźțȝȟȡȣǫɱȴƯ9ȵ7ʃȿȭǊɾǺȼ81Ǽ7451ǶƵƸɚȇȉɅȌɈȎɌŉŋōăǽċɓɕɗƻəɂoɝɟƠsƤɨȕĉʙĚǞƥʡȦʲƴȃǽȄʮƳǁƂǹ.ǯƾǻʦȺ0ǁ4ƵȲʸɃȊɆȍɊơƣśʔʀ.ʄʅ˽˾98ȔǤŴȘźfȞtɯʠɲƼ0ɴʳ61ȷǈǃ58̎ʫ˥ʲȺƳȮ211Ƭǉ5ʋʹʎ˳ʽ˵ʿɎ˂:4ǶċQăʘ˶ǟȦ̤"ˆɖŃ0ˊʌˍeɠ"lowısǛʖȖ˕ń̇l̉ɰ̌.Ǵʲ̎ȩƵ̑ǁȭ̙ȩ4̡̟ƭ̎ʄȮƂˋʺʏ˴ɋŇˀɏĻ̰"̲ʔċ˗ȴ˅ɔ̻ɘ̥ɜɞ́Ơ̈́͆a͈ĳ

// {"1":[Āidă14,"connectiďTypeăčhaĐel"}]Č2ăą"ćĉČĎğēĕnėęěcĝğġ},ĆĈ:8ĬďđįĖĘĚ:ĜĞđĸĤ"5ħĻă6ĿĮĔŃĳņĵňĠĢĺĩļ1ŒŁŔıńĴĶŉśŏ:şčŀĒŢĲŅ"dĠayTimĚģČ6Ŏŝă2ŠŮİŰěfrequencyĢŋ8žĪ:0ƂłţŖŇķƐČ10ƓŞƗůŤņųlŵŷŹƝāĂĄũƟƣƄƥƛŧŻā3ơăƖŬœƳƚŘƜƷĊƺŪ3Ʋŕűǁƶŋ1ōƯſǆǈƙűpĞƐ}:ǚĨƔƼtƴgain"Čxƻ.50251Ǭ628Ċ070Ǉ"Əƕ.133Ƕ76940ǼǾ3ȀČaudĕParamValƋsăĀǡǣǨ5}ĹưČǟƚƧŵǥ"ǧǺǼ0653266ǽ1Ȭ8Ƿǹ0.3Ɵ42Ǯ86ǶȻȽǷȊȌoȎȐȒȔȖȘŲŴŶŸŅȸȝȟǑƁ"ȢűoscilƨtorȦȨɓǫǭǯǱǳǵȶǨȺ0ȼȾɀɯɱɄȋȍȏȑȓȕeȗ:ĀƇƉƋƍǹ20ƼųtuđƻĹ"ɅĕNoųƅņsǣźŜƔ5ȡƴɛɝɟaɡɣǦǨ88Ȃ472361809ɰʜǸȜʭ58ȭȴʺʸőʏɷɇɹɊɼɾʀƈƊƌƎȜČʉʋɒʎʐoʒʔƴʗʌɕƔʾəěȚǤʥǺʧ1ʲ95ʪ73ȿ93ʴȷȹɂɲɁɰɃȉˀɈɺɋɽɍ˝ă˧.ʆʇ̀́ȄȞʚļľɘǠǢ˞ȧʦʨ4ʪʬʮʰʲ4ˬǨ˰ɴȽǱɳ˴Ɇ˶˃Ɍɿ"˻ȩ̄ưǞ̉ț˟ȸǼ567ȵ9ˢ59799Č˭˥Ȁ7ʯȃ˫ʪ̯ɗˑ̟ɻ̡ș̊Ǩ̃˘Şū˛ņʟɞɠɢɤȜǮ̮ɪȃɬǭ̺̇49ʧ̲˫Ǭ͟ʨ̝ɸɉ͆˹̢ʁˈʄĉʾˍʌƕːˀ˓eʕ"˖ʙưǷ͏"ǖğʤ̌ǺǾȬȮȰȲȴ2̸ʵǺʱ̵̰2ǵǪ̷7̰ɶ̞˂ͪ˅΀Ǘʹ͌ĉċ̈ƚ˻̫ǻɩǲ͚Ƕǭ7ʸ̹̗4ˢȫ8˧ʮβʲ7ͧˁͩ˸Ν̤ɓ̦Ǒǎʝƚ͑ʡʣ͕΅1ǎ5Η̏͡ʫʭɭǺ2β6ʹĊβϖȳʹΙͨ˷˄ɍͭʃˊĽˌeʊͳ0͵Ɇͷ͹ͻƐ

// binuaral beat
// {"5":[Āidă7,"connectiĎTypeăČhaďel"}]ċ6ăą"ćă8ċčĞĒĔnĖĘĚcĜĞĠĢċ7ĦĆĈ:0ĬĎĐįĕėę:ěĝĐĸģ"8ļĨľŀČłđēŅĳňĵŊğġ]}:šħĩĿċtņĚgain"ċxă0.5ċyű.12Ŵ"audĔParamValuesăĀŪŬŷ2}},ĽăŻŧř"oscillatorŮ"ŰĿ.4474934036ƮƮ14ŵŷ55ƫƺ043227665ĊżžƀƂƄƆƈƊƌ"freqƉncŶ:50œdetuĐűƓǈſoNoǞĲŇ"sŬęƓƕ:6ŦŨňƛƝƟơƣƥƧŲ5Ǆ7ƻ61Ƭƶ24ī"ǙǿȀ1959ǅ4ȅ86ƬċŽǦƁƃƅƇƉƋ:ĀǒǔǖǘƖ0ŻǞǠǢĿǤȚĔǨǪǶǭǯġƔőĉǵƙpŜƤůŷƪ583ɅɆɇɅǴȋƐ7809798ǂ08Ʈ3ǇȰoȜǌȟǏȢ"Ƚŭ:-1ƒȸŤȊƘǬɢĐȿƦƹ6ƾ1ǄɵɶȗƸƨǂǄǆ0ɲ5187ǀșǉɛǋȞǎȡĀɢăɦĢ

        fromString: function(s : string) {
            s = decompressGraphString(s)
            this.clear()
            const [connections, nodes] = s.split(':::').map(s => JSON.parse(s))
            
            if (nodes[0].id !== 0) throw 'Oh, I did not expect this.'
            this.nodes[0].x = nodes[0].x
            this.nodes[0].y = nodes[0].y
            this.nodes[0].setValueOfParam('gain', nodes[0].audioParamValues.gain)
            this.nodes[0].audioNode.disconnect()
            this.nodes[0].audioNode.connect(audioCtx.destination)

            // recreate the nodes
            for (const node of nodes.filter(
            (node : NuniGraphNode) => node.id !== 0)) {
                
                const options = {
                    display: {x: node.x, y: node.y},
                    audioParamValues: node.audioParamValues,
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
    const dictionary : { [key:number]:string } = {};
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