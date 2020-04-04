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
















class NuniGraph {
    /**
     * The job of the NuniGraph is to keep track of nodes and their connections.
     * It has a list of nodes and a connection map.*
     */
    
    nodes: NuniGraphNode[]
    oneWayConnections: { [id1 : number] : ConnecteeData }
    nextId : number
    selectedNode : NuniGraphNode | null

    constructor() {
        this.nodes = []
        this.oneWayConnections = {}

        this.nextId = 0
        this.selectedNode = null

        this.initialize()
    }

    initialize() {
        const options = { 
            audioParamValues: { [NodeTypes.GAIN]: 0.5 },
            display: {x:0.5,y:0.125},
            audioNodeType: ''
            }

        this.newNode(NodeTypes.GAIN, options).audioNode.connect(audioCtx.destination)
    }

    newNode(type : NodeTypes, options : null | { display: { x:number, y:number }, 
                                                audioParamValues: Indexible,
                                                audioNodeType: string
                                                }
    ) {
        if (!options) {
            options = {
                display: {x:0.5, y:0.5},
                audioParamValues: {},
                audioNodeType: ''
            }
        }

        const node = new NuniGraphNode( this.nextId++, type, options )
        this.nodes.push(node)

        return node
    }
    
    connect(node1 : NuniGraphNode, node2 : NuniGraphNode, connectionType : ConnectionType) {

        if (G.oneWayConnections[node1.id]?.find(data => data.id === node2.id && data.connectionType === connectionType)) {
            // if this connection already exists, ignore it.
            return;
        }

        const destination = this.setConnection(connectionType)(node2.audioNode)
        
        node1.audioNode.connect(destination)
        
        const destinationData = {
            id: node2.id, 
            connectionType
            }

        if (!this.oneWayConnections[node1.id] || this.oneWayConnections[node1.id].length === 0)
            this.oneWayConnections[node1.id] = [destinationData]
        else
            this.oneWayConnections[node1.id].push(destinationData)
    }

    disconnect(node1 : NuniGraphNode, node2 : NuniGraphNode, connectionType : ConnectionType) {
        if (!G.oneWayConnections[node1.id]) throw 'check what happened here'
        const connectionIndex = G.oneWayConnections[node1.id].findIndex(data => data.id === node2.id && data.connectionType === connectionType)
        G.oneWayConnections[node1.id].splice(connectionIndex,1)
        // delete G.oneWayConnections[node1.id] as empty array if it ever becomes undesired

        const destination = this.setConnection(connectionType)(node2.audioNode)
        // node1.audioNode.disconnect(destination)
        disconnect(node1, destination)
    }

    selectNodeFunc () {}

    setConnection (connectionType : ConnectionType) {
        return (x : Indexible) => 
            connectionType === 'channel' ? x : x[connectionType] 
    }

    selectNode (node : NuniGraphNode) {
        this.selectedNode = node
        this.selectNodeFunc()
    }

    unselectNode() {
        this.selectedNode = null
        this.selectNodeFunc()
    }

    deleteSelectedNode() {
        const node = this.selectedNode
        if (!node) return;
        if (D('connection-type-prompt')!.style.display === 'block') {
            alert("Please finish what you're doing, first.")
            return;
        }

        if (node.id === 0) {
            alert('cannot delete this!')
            return;
        }
        // disconnect from others
        node.audioNode.disconnect()

        // remove from this.nodes
        const idx = this.nodes.findIndex(_node => 
            _node === node)
        this.nodes.splice(idx,1)

        // remove from oneWayConnections
        delete this.oneWayConnections[node.id]
        for (const id in this.oneWayConnections) {
            this.oneWayConnections[id] = 
            this.oneWayConnections[id].filter(({ id }) => id !== node.id)
        }

        GraphCanvas.render()
    }

    clear() {
        for (const node of [...this.nodes]) {
            if (node.id === 0) continue
            this.selectedNode = node
            this.deleteSelectedNode()
        }
        this.selectedNode = null
        GraphCanvas.render()
    }

    toString() {
        
        return compressGraphString(
        JSON.stringify(this.oneWayConnections) + ':::' +
        JSON.stringify(this.nodes).replace(/,"audioNode":{}/g, ""))
    }

// some graphs:
//_____________//_____________//_____________//_____________//_____________//_____________//_____________//_____________//_____________//_____________//_____________

// {"3":[Āidă0,"connectiĎTypeăČhaďel"}]ċ5ăą"ćă6ċčĞĒĔnĖĘĚcĜĞĠĢċ6ĦĆĈ:3ĬĎĐįĕėę:"frequencyġ]}:Ŗħĩ:Ċ"tņĚgain"ċxĉ.3558ŪŬūŭŭŀ"ŒŚ.1848341232ƀ7Ź8ċaudĔParamValŎsăĀŠŢŧ5}},ĽăŲŝĳňoscillatorŤ"Ŧŵ207ƱƳƲƴƷċŴ0.4597156398104265ƅƇƉƋƍƏƑeƓ:ĀŊŌŎŐŴǇśdetuĐĉƛ"ƆƈoNoǟĲŇ"sŢęƛƝ:ǌŜŞƢƤƦƨƪƬťŧƳƿ2ȂȄȁ7ƹƘ3080ǂ8Ƶ379ǁǍǨƊƌƎƐƒƔŉŋōŏőƞċǟǡǣŚǥǧĔǪǬǸǯǱġƜĨľīǷơ"Ɩţǿŵ495ȼȾȽȿȿǶƺƼ7ǃ033175ũȾǶȩoȗǑȚǔȜȸă50ƚ]

// {"1":[Āidă0,"connectiĎTypeăČhaďel"}]ċ2ăą"ćă1ċčĞĒĔnĖĘĚfrequencyġģ"3ĦĆĈ:2ĬĎĐįĕėę:ěĝĐĠĢċ4łĨńņČňđēŋĳŎcĜĞŒ]}:ŧħĩ:Ċ"tŌĚgain"ċxĉ.5ċĽū.12ź"audĔParamValĹsăĀűųŸ5}},ŃĪċŮş"oscillatorŵ"ŷŽ6806722Ʈ907563ŻŸ47045ǁǃǂǅ46ċƃƅoƇƉƋƍƏƑ"ĵķĹĻż44ŬdetuĐĉƘƂƄĔNoǜĲō"sųęƘƚŅƜůŎƓŴŶƽ1830ư5359ƾ7ſƁż0.488ƺȌ3ȍȌƁǊƆƈƊƌƎeƐ:ƒŲŴ:1ǼƗƙŗăƻŭǳƟơƣƥƧƩǷŽ1ƺ0ƀ2ȟ08ǚ3ȎřȆȈƶȾ0ȿɁǉǤǌȔǏȗșĀǔĸĺļăřǜǞǠūǢȒoǦǨȧsĸƈǮȢŪ4ǲƞƠƢƤƦƨƪƬȇǹ3193277ɭɀ24ȎƼŽɶɲɱɽƲɿɱɡǣǋǍȕǐȘǒɋǖɎ:ȥɑǟō0ɕɄɘeǩĚɛuɝľ

// this one doesn't seem to work in FireFox:
// {"1":[Āidă2,"connectiĎTypeă"frequency"}]ċ2ăą"ćă4ċčďđēĕėę:ČhaĲlĥħ"4ĪĆĈ:0İĎĐĒĔnĖĘĚcĺļĥ,ŃĉŇĲŊĵŎĸĜĞĠĢĤ}ŔĬń5ŗŉĴŌĶĚŝğġģľċ5łŤă1ŧĳŋōķĹĻĐĽŢŕ:įČňŹŚżgainű"6ŴĭƃŸřŪś"ƊƌƎ7Ƒń6ƔũŻŏőſƎ1ĂĄƂƟƅŘơūĸƙƍĦċ1ĩƩŵ:ƧƠźƯŽŒĦ}:ǂīƒņ"tƽƱ"ċxă0.103Ƨ28404669260ƫĤŅǐǝ385809ǓǤǦ7ċaudĔParamValĠsăĀǊǢ0Ȃ05}ƁƸŷǇǉƋƍǌǎ.420233Ǚ3ǒ5019ǙċǡǏ57649ǚ7ǗȢȤ9Ǯ"ǰǲoǴǶǸǺǼǾƘȌŶȃȆţƒĊȊƗoscillatorǋ"ǍǢ54Ȣ87ɐɒɔɑȭȠ.ǥǨǝǞɔɜȓȤǯǱǳǵǷǹǻeǽ:ĀŭşŰ:8ċdetuĐǎŢȮɥoNoɵƢĸsƌęȇƒƄǈƗǊȎǢȑ4Ƶɑ13618677ǒȟȏʑ16Ǧ14ʐ2ʐʠƫȯɦȳɩȶɭȸƚ:ȘȂȼƂŦɀżɂɄɆɈɊɌɎǏǕț55ȤȒȔȖ63ʜǢ3ȝʘǖǜȔˎ7ɳɼȰȲɨȵɫȷɯůǡ˕ɵɷɹŅɻʩɾʀeʂ"ʄɹʇƞċʊƉȹʍǏ7ȕȗșțȝ˃ȿɚʓȘ3ȣȝțȕǒȣɤ˗ɧȴɪɬǿȹƹȂ1.ȃ̔̔ȕʴƸȭ˱ĚʹɅɇɉɋ˴.˶˶ɐ0ǦǞǓƵ9ˋȡʘ62Ȩȝɑ̯̱̈ʪ˙̌˜ĝŮŠăˠɶɸķ0˥ɽɿʁƽtriĻglʆȽńƺʷĚʌɍȏ88ʓ229ȢȜǖ4ʔ̭ɛ21ȚʙǞ53ͦȚ˕˦˘̋ʭ̎ʰʲ̈́ˮŶȿ̛ĸ̝ʻ̠ʾ͘ɓͧ̅͞˶ǜ9̬"ɚ˄ɐǑȜ͞Όʐ̷ȱ̊ʬ˛ʮ˝̾ɲɴ́ˣ̈́Γ͇˩ƽˬʆ]

// {"1":[Āidă0,"connectiĎTypeăČhaďel"}]ċ2ăą"ćă1ċčĞĒĔnĖĘĚfrequencyġģ"3ĦĆĈ:2ĬĎĐįĕėę:ěĝĐĠĢċ4łĨńņČňđēŋĳŎcĜĞŒ]}:ŧħĩ:Ċ"tŌĚgain"ċxĉ.5039123630672926ċĽū.1Ƃ82Ż9ŽƎ0Ɛ05ċaudĔParamValĹsăĀűųŸ4}},ŃĪċŮş"oscillatorŵ"ŷƌ51685ż32584ƈ97ƊŸƀ80709Ǌ4ǖǘǘƚƜƞƠƢƤƦeƨ:ĀĵķĹĻƋ101.żƓǶǷ9ǏċdetuĐĉư"ƛƝoNoǼĲō"sųęưƲŅƴůŎƫŴŶǕ5Ɠ3740219ǚſ3ǔƌ34ǎǹ004ǝȩ8ǹǡȅƟơƣƥƧƩ"Ȗă55.ƑȬɂɃȬ3ƯƱŗăȥŭȔƷƹƻƽƿǁȘƌ1787Ǌ8ƂǝƇſǓ"Ƌ0.4Ɓ356ǒǵ5271ɘȳǣȶǦȹǪ"ǬĸĺļɊǻǽǿō0ȂȄĔȇȉɍsĸƠȏɈŪ4ȓƶƸƺƼƾǀǂǄɣɯ3ȡǌ77ʚȣǝƉɡŸ24ʝɭʨƅʪɭʎȃǢoȵǥȸǨȺɸǮɻȒ"ǼǾȀūʂʯʅeȊĚʈuʊľ

// {"1":[Āidă14,"connectiďTypeăčhaĐel"}]Č2ăą"ćĉČĎğēĕnėęěcĝğġ},ĆĈ:8ĬďđįĖĘĚ:ĜĞđĸĤ"5ħĻă6ĿĮĔŃĳņĵňĠĢĺĩļ1ŒŁŔıńĴĶŉśŏ:şčŀĒŢĲŅ"dĠayTimĚģČ6Ŏŝă2ŠŮİŰěfrequencyĢŋ8žĪ:0ƂłţŖŇķƐČ10ƓŞƗůŤņųlŵŷŹƝāĂĄũƟƣƄƥƛŧŻā3ơăƖŬœƳƚŘƜƷĊƺŪ3Ʋŕűǁƶŋ1ōƯſǆǈƙűpĞƐ}:ǚĨƔƼtƴgain"Čxƻ.50251Ǭ628Ċ070Ǉ"Əƕ.133Ƕ76940ǼǾ3ȀČaudĕParamValƋsăĀǡǣǨ5}ĹưČǟƚƧŵǥ"ǧǺǼ0653266ǽ1Ȭ8Ƿǹ0.3Ɵ42Ǯ86ǶȻȽǷȊȌoȎȐȒȔȖȘŲŴŶŸŅȸȝȟǑƁ"ȢűoscilƨtorȦȨɓǫǭǯǱǳǵȶǨȺ0ȼȾɀɯɱɄȋȍȏȑȓȕeȗ:ĀƇƉƋƍǹ20ƼųtuđƻĹ"ɅĕNoųƅņsǣźŜƔ5ȡƴɛɝɟaɡɣǦǨ88Ȃ472361809ɰʜǸȜʭ58ȭȴʺʸőʏɷɇɹɊɼɾʀƈƊƌƎȜČʉʋɒʎʐoʒʔƴʗʌɕƔʾəěȚǤʥǺʧ1ʲ95ʪ73ȿ93ʴȷȹɂɲɁɰɃȉˀɈɺɋɽɍ˝ă˧.ʆʇ̀́ȄȞʚļľɘǠǢ˞ȧʦʨ4ʪʬʮʰʲ4ˬǨ˰ɴȽǱɳ˴Ɇ˶˃Ɍɿ"˻ȩ̄ưǞ̉ț˟ȸǼ567ȵ9ˢ59799Č˭˥Ȁ7ʯȃ˫ʪ̯ɗˑ̟ɻ̡ș̊Ǩ̃˘Şū˛ņʟɞɠɢɤȜǮ̮ɪȃɬǭ̺̇49ʧ̲˫Ǭ͟ʨ̝ɸɉ͆˹̢ʁˈʄĉʾˍʌƕːˀ˓eʕ"˖ʙưǷ͏"ǖğʤ̌ǺǾȬȮȰȲȴ2̸ʵǺʱ̵̰2ǵǪ̷7̰ɶ̞˂ͪ˅΀Ǘʹ͌ĉċ̈ƚ˻̫ǻɩǲ͚Ƕǭ7ʸ̹̗4ˢȫ8˧ʮβʲ7ͧˁͩ˸Ν̤ɓ̦Ǒǎʝƚ͑ʡʣ͕΅1ǎ5Η̏͡ʫʭɭǺ2β6ʹĊβϖȳʹΙͨ˷˄ɍͭʃˊĽˌeʊͳ0͵Ɇͷ͹ͻƐ

// binuaral beat
// {"5":[Āidă7,"connectiĎTypeăČhaďel"}]ċ6ăą"ćă8ċčĞĒĔnĖĘĚcĜĞĠĢċ7ĦĆĈ:0ĬĎĐįĕėę:ěĝĐĸģ"8ļĨľŀČłđēŅĳňĵŊğġ]}:šħĩĿċtņĚgain"ċxă0.5ċyű.12Ŵ"audĔParamValuesăĀŪŬŷ2}},ĽăŻŧř"oscillatorŮ"ŰĿ.4474934036ƮƮ14ŵŷ55ƫƺ043227665ĊżžƀƂƄƆƈƊƌ"freqƉncŶ:50œdetuĐűƓǈſoNoǞĲŇ"sŬęƓƕ:6ŦŨňƛƝƟơƣƥƧŲ5Ǆ7ƻ61Ƭƶ24ī"ǙǿȀ1959ǅ4ȅ86ƬċŽǦƁƃƅƇƉƋ:ĀǒǔǖǘƖ0ŻǞǠǢĿǤȚĔǨǪǶǭǯġƔőĉǵƙpŜƤůŷƪ583ɅɆɇɅǴȋƐ7809798ǂ08Ʈ3ǇȰoȜǌȟǏȢ"Ƚŭ:-1ƒȸŤȊƘǬɢĐȿƦƹ6ƾ1ǄɵɶȗƸƨǂǄǆ0ɲ5187ǀșǉɛǋȞǎȡĀɢăɦĢ

// cool delay graph
// {"0":[Āidă5,"connectiĎTypeăČhaďel"}]ċ1ăą"ćă0ċčĞĒĔnĖĘĚcĜĞĠĢċ2ĦĆĈ:3ĬĎĐįĕėę:ěĝĐĸ,Ľă4ŁĮēŅĳňpĝġģ"3ļĨľ1őŃœıņĚfrequencyřċ4ŝĩ:īČłđţĲŇŉķŰ"5ųľŐŷŒİŻĴĶŋř}:ƎħŴŶtťňgain"ċxĪ.592773437Ċ"ůŵ.1486ƮưƯƱƱ6ċaudĔParamValūsăĀƖƘƝ5}}ōŞăŠ"Ɠŕ"oscillatorƚ"Ɯƫ6Ɵ17968Ƨċƪ0.4540ǱǳǲǴǱǑƸƺoNodeƈňsƘęƷƹƻƽƿǁǃeǅ:Āŧũūŭƪ50ŶǿtuĐĪǌǎŴ2ċǓżǖǘǚǜǞǠǢǮ47851562ƨǭ.8ǵȹǷǶƄǺĔǽǿȁ"sawǝothǠȾoƼƾǀǂǄǆ"ȑŪŬŮƝȴċșțŇ0ȞŎĿȢƔ"ǈƙƛƝ6357421ǪȵƝ71ȳɵɯɶɹȡ"ɌɎȊɑȍɓɦă2ȗɠǏ:ƄȣĚŗĞǟɨƫƮ04ǩǫƩƝ4ƥ2ʚʜ3ʛʞ7ȆǻɾɐȌȎĀʍȝǍɡƨʋňǿǛůʐǮƦ01Ǧɰʖȶ28ƦʽȮʾˁƢʢȈɏȋɒȏ"ʰayTimɞ.2ǌ]

// giant test graph (str length 6581):
// {"1":[Āidă14,"connectiďTypeăčhaĐel"}]Č2ăą"ćĉČĎğēĕnėęěcĝğġ},ĆĈ:8ĬďđįĖĘĚ:ĜĞđĸĤ"5ħĻă6ĿĮĔŃĳņĵňĠĢĺĩļ1ŒŁŔıńĴĶŉśŏ:şčŀĒŢĲŅ"dĠayTimĚģČ6Ŏŝă2ŠŮİŰěfrequencyĢŋ8žĪ:0ƂłţŖŇķƐČ10ƓŞƗůŤņųlŵŷŹƝāĂĄũƟƣƄƥƛŧŻā3ơăƖŬœƳƚŘƜƷĊƺŪ3Ʋŕűǁƶŋ1ōƯſǆǈƙűpĞƬ2ƠǐƔƼĭšƿǊŦŚĹưǓƅŗǢŊČ77ǅƱƽǟǉťřĸŜƔ4ċǰƃǲǨǴŨǑ3ūǞǻǔǳǂ]}:ȊĨǜČtƴgain"Čxƻ.50251Ȝ628Ċ070Ǉ"Əƕ.133Ȧ76940ȬȮ3ȰČaudĕParamValƋsăĀȑȓȘ5}ǤǑūȏƚƧŵȕ"ȗȪȬ0653266ȭ1ɜ8ȧȩ0.ȁ042Ȟ86ȦƟɬȬȹȻȽȿɁɃɅeɇ:ĀɔŶŸŅɨɍɏƔƁ"ɒűoscilƨtorɖɘʄțȝȟȡȣȥɦȘɪɳȡɰʠɭȧȺȼoNoųǧ"sȓĚɵʨȾɀɂɄɆɈ"ƇƉƋƍȩǙƼųtuđƻɎǶļ5ȎƴʌʎʐaʒʔȖȘ88Ȳ472361809ɫˊȨɌ˛58ɝɤ˨˦ő"ʧĕʪʬƴʯ˅ʲɷʵɺʸɾʺƈƊƌƎɌČ˂˄ʃˇũˬʊěɊȔ˓Ȫ˕1ˠ95˘73ɯ93ˢɧɩɲɭʢɱɫʥ˵oʴɹʷɼʹ̊ă̔.ˀ0̮̯̯1̅ǑľʉȐȒ̋ɗ˔˖Ǹ˙˛˝˟ˡČ̚ɮʣ̜ͅȦ̢̤ʶɻɽɉ̸Ș̲ʆŞƼ̈ņ̩̌ɨȬ567ɥ9̏59799̓Ɍ˘͝˝ȳ̘ͩ˙͊ɸ͌˹͏ɋȪȴ̳Ɣ1ɑˌʍʏʑʓʕ˔9ͪ̿Ț˚˘4ū̚Ȱ274˗͜ΌΎͦ˭ɶʩʫeʭ˳ʱΕʳͱ˸̧˺ʻ˽ʾĉˬ̂˅ƕ͸Şȧ͖"ǖğ˒̺ȪȮɜɞɠɢɤ2Δ̚˟ͣ͞΍0ȚͥǬɥͰ˷̦͎ίǗΪ͓ĉǹή͘γ͚ʚȢȳʝȝ7˦ͧəΉˠ68̔˜ϞȤχ̨̥͍͐Ȫʅˈĉˢήˍ;ː΀̛͙ǎ5υ̼˘˚ɡϜɨ2ΉϠȝǸȞЁ˧ʦΖ˰Ι˲ʰɖˮ̣ΟωʹΣʽ˿Ľ́e˃Ω0ΫΦˋƚΰđβʖ.ȥ̔55ЀȟɜƟʈ̚˞ȥ̑34˛а˟ˬЏ͋ΠϊΰˆώŪ7Пűʀ΁Ȫλɟ̽ϸдг˖φˣȪȱȠȮ͢ɯё˚ūйБϨ˺ʀƪʃ̬Ϭư̵ήСeУʟɠ̏7˝Ȯ9˧͜͠Ͼș˚ʛ͢64Щɞ8ʈљψћĀнύϭŪΔήfʏtѦхʄȵțȦǸȡ̙ͤȘ˜ɯȜ΍ѫҕȠиЉΘʭlowǖsɇϦͲΡĀД˾ȩǸƼQī"̩ϫИК̄пǙтƆ҈Ҋϵ̒˜ɤ8ϞȳɝЮҔѻ9ɟӇӉчсΝ˯ҞƴҠҢaҤЎΖкВ΢˼ЕҬȳČүŪČҲʄҴ̃о҃ɭҹņϱˏˑҋɩ̗̑ͺɬΉ̮ǎɜѲΓǸΑȠӺѸ̢ЊΚЍҦлГӛҫăҭӥЛН:2ʈϰͽӭϴϓ.Ё΍̒ȶ̗͢ΎѲ˜Ѫȭӈ4ԟͣЈʨԁЌ˴ӎАѾͳ˻ʼԈ:ԊŲЙӦ҂ũ˚Ӫұ͐ϵ˙Ċ3ͣΏɰϡɡӍ̚Шд˚˙ȚՈɞǹѽϧԮӣșԍЀԺϒФɮɞШ0ɯȤ̏ϡǹ΋ȝɠλѫ1ϚɣϽԫӘѿԻ͵ʄՕϯͼˎͿѧцϻ˜г˦Щ˖ЃѲ˖͛ȜΏ˕̘͠Ԧӏ˱ƚΛӖΞԭҨԯΤЖԳΨҶӨ̇մϲӮϵǸֆӈ˞Ȟȝ̑ˬ̚Ӳɟ̕˦˟ȁшԀӐ֋ԃլњԮҪΥԲӞԴҵӧԸӍԑյϳշʄϚ˖ѮдՌ̓ʞ̍ȭȥȡѻ4ɥȷ͉ԫԨ֯ԪՐҧϊִַֺ֓֕ǑȡԺ҇l҉׀ȫȡ՛Ț՞ѫѮԝяɨ˕Ѐ׏׋ׯ׎ֈΗ֊űӒңҥֱ֏טԇֵԳӠūՓˢלԷמ҅ƴѥפȭѷɡԏȷϡɣϚրֆЩ̒ѮցևԄәҀόМпȮԺ؋ӯ˜ͣѬ˟ѯǎΏԞ̟ʡ՞ɪˢזԅ˺ҁؠ҃ȁԺфԽɡȱɞЦ̘ЩдԞͤ͠ɰ՝̖ը΃؜ծѝʂȘȜԍɞغŴƏϵȜȦ͠ϼε˙ӈՆȘ׎͞ɫϡ˞١˞زӗֲ֐َƫцѡȀέ؊řפ˝Ƞȡ׎ˀ֫ѮμҔȠاըդپѫٌԮضْϐƴסףӯ˚ȁȰɥ̎ɛЁ׈Ͽ̘Ȧ՛Ȳ˚ȚȭՏҝ׷ě׹Ӕ׻س؝֑Ӝԉַ؂ӢϪӤָԶطũ̘נһפȢζΎ͝ȥʘӁѲгʝ̏ɡ˘ɱًג֮׸ҡ׺֍˶Ց֐יӝҮҰ؄ԋ֖ڱ֘ƚӬնإɰȳϠ˧ׂͥڼ׭ɩ˕țɠȤɝۤ֬ۅڟņ֌ڄۍ׿ךˁԵԌءּ֙ԓפȰؗѻǎ΃ЀΉբِ״א׌װ׊ѼڞЋהΜڤծێڨ۳ֹ؇Ɣ̕՗Լԕ̗˖΄˜ΆھѲӃȰՂ͝ܡӸ׼یϊ؄ْ؉ƚ՘٠ɛ˕ϸ˦ׅ۠ɫѲՊ٘ՍܸՌۯܩڬՔпַֽ֚ԔФ˫˧Ǹهܚ΃ٟцȴǬ̘̕ӈݏ׬ЏדűۮܧחԆ԰؀כ۴۔ǑΉԺֿۘӯՀȞ˛ٜчѷԣڽԢԤ̔ՀЀ˜֭۬ʮְ܎ֳ۱ۏۓםǷԐډڴڌڶˠȣӁȚȥǸڽՋςԙܻގݶ܋ۇӓӕܽݜ֒ݽ"ڪկȔҳڮ۵҃ك̶ƚڊҼԕպѸ˧ȡ̑Ċɯݍɨد̠͆ͅޒҟۈڢۊԬܨޘڧֶېӡޝ̀ޠݡǷڈޥރϵҍǙгɬϡȲͥڔԖջэ̮Ǹߔۄݖۆڠ޸ޖݚشҩݼܑӟۑܿ؅ݠݿļӿޤǕٳݧĊШՀϟƟѺ֤ɌɥޮШϡ˦ȁ׎ޗص؟ԍݮ߬ěؤٗٷѻ̮ٺ˖͂ۢȰѫӁȦ̒ࠏͫ߿؞ޞڰݢ۷Р߮֜٥ͫ̕θ˨ǬրȤ˟ɝдϠࠦߙ٩׽ʹچ݁ѣƴػިѫ΅țھΉͤԞ͞ΏؐȲ͝ӁӈࠖԴƨʁ٭ϿٯǷܬуٕӯȢԏɛϸ΍ȱвѲъ΍ԜѰΎ࡙ࡄ٬џّпȚأࠝԕվޮɠͣ΃Шͯۢɜӵ̏̑̒͜Эࡄ࠰҃ȝࡤαࡏɫࠠӁࠢ˛ࠤۢжвࠩࢄҜ֎޼ࠀ࠘ԍЩڳעާФ˕࢓࢔࢕˕ԞЬ˕ۂɛ̵࢙ߚݷڡߞݺ۰ݝ۲ߤ߁ے߄ߩăɝ࢏ڋϵڒɣԘдࠒߑްșѮࡩђςࢹȱ޶ӑߝڣ࠭ࢊߡࢥޚޜࢩ؆࠙Ɣ̒ݤԒۙࢰдȢࡿɡࠣΌܠĊہࣙгࣛڝԧߛۭݹࣃݛӚࣆߣࢪܔˉճܭܘФȲ˛ئࠐѭѯܷɟɣϗѮԏҿࣞۋࣤʹ࠘݀ࡸۖűܮϫ٧ࡀͤٵԏ˧ࡗժզͺթθࡄܪࡢࠛʋ࣏ݦϵީռެЃޯӹǙȠ՝ɬࡓɛ܉ࣟݷݙࢣ׾ࣦ޿ݾࣩࢬ࠲߈࢐ۺԙࢵԜȳɭټ̍̑͞࠶΃վाࢿƚࢡࣂࢉࣾڦԱ؁ߥհșय࣋ˉࡌҺऴࡏͬϚ݇̒ԣȴѲؖփؙढ़࢈։ޓߜޕॆࣽߠॉݞ߀؃ߦॏԍɰࢮ࢑ٽɠॴॵॶܷࣻȤࣹࣶѷј܊޷॥޺խݻभोࢨ७ࣨॐŐͻࠜࡻचࡪɜϸȞς̮͞ѲȞ͡ঘޭऺʙࡶࠁпȠࡺТӯݐ՝λɬ˟׋ܦ̈́Ԡݳԣͺԥࣼ޻ैࡷ̆ٱɓࡎࠇӁࠉɱλࠌ߫বЩߑьͺূ̗࡞ٕўِࡊļѷٔࡆӯনͣۥۛܰɯগǎλ̗ৄ৙ߑৈࡆ৊ٮ९࣫ࡍ৐ࢰȠ͢٢ˠȰϠѴܷƟѷȮϷɭڒ׵ঃ٫৉ُৢঠःࠅࡥФԣࣕࢁΌ՚΍لࢻєࢺїঞࢌঠख৾঎ԕঔȤ׍˙छ݈րͬࠓͪࠑف਌ࢫ:ϠॱٴͤीȥƟ̑যফ˔۾ѷѹѵ΃লݗ।ۉࡄܐमޛौऀߧܓঊਡ॒ņަפقЫȝݏɭދۢӈ˚ईࡂ࠿ਲ࣠"ॅং٪बޙࣧࣈঈ࣊ԍȥ࣎־֛ܙˡݑΉǎइ܂̍ȱيه˕੩࠻۫ॣ࣡וࣣ२਷֔ߨर:ڃࠄӫघ੠࢒͢ثӈऽڸ߾ۢत˙दणȜઈॡ׶ੰݸੲेੴߢਸਜ਼п࡭ϑ࣭Șई͠ҖࠈӅͶбࠨеࠫࠨओߦੜষऄચцɥȜרɰתա߶δȢȷϻצશΎ٨઒ڥऔ҃׬݃۹ݧषષț̏˟Թઆںɠȝ࢚ૌӍ࢟એपੳڥੵݟ਽ੜ৤ěݥ੾ˤͥɛߴʢ֨ܠॺѻॼࣸѻृݘ࣢ઽ܏ઔ੶૙ગ৽ੁ߉ԕȥ˖Ǚ˝Ǭ̗ɬ࡭̚ԣࣜଁ܁઼ࣚॢঀਵߟ૖૰ک਺߃ખીਏ૵॔चࡓȰͥɝςࣷ੧ɨ્࢛࢝˝ۡ૒ଈ޹ਸ਼ଌ५ګ਼्گੜलűੂإɫ৖ܲ׃Ӂߒ֨˞֦ɡ˧ହ૫਴ଥଊ૯অ଍ইପ८ગੀϋ਑਀̮২ͣହȤɠюՇࢽۿѓ୕ਟ੸˞ঢॲδૠ˜Ȧૣࡂؔۢ˥Ї˩୦˨୙ਾȢ৏ɕϵ؍ଁؐाؓғȪѸѴȢѶ୸Ѻয়Ʃ৺ࡉԍ૪੻ࡅ୯ԕӂςɞ՝ȬǬǎܠΐ͝ӽΏӻ͝୾ࡇࡠৌăюѤ৿٠˧ߋҏߎنࡗڙږȭȜ஥ଆ঳२঵̴߇ग੟݅ɌࣷȁԢׯپΊҔ͜வλɫɜ؏ାੱ܍૕ୂ੗ક੷୬૛੼ற੃஠ߍґ̑Ԟࢴ৳ৰ௓ઍਲ਼ூ੔࠮ࣥெ૱ବпৗ஄अɨȷߺЂ̮̗݉ऻʄքؚؗքΔफϩପஂ଒߂Խ˚ߖȱ״͜˞̵଀̒ఁѸఃంࢭୁՒન௠ମ૜੽லȪΎըਝॗɯ˧୶௬ƟࡱШ࡯ࡵ੯Ԃઑ१ଋୃܒ௟҃˖ਫ਼݄פࡕଙդд̏Ѐ௫ɩϣૈϠϢĊ̏ுઐ௃૮঄௝૘తũˠଡ଼఩˘˕̔ੌࠩড୥நɬ஦ژɬ୫ԍ͠୮ٖި̕ΏۻȜ۽Ѷڽȶଗȳҍȷ૑௄Ԯ࡟ো౑ށস০ިࢳԚࢶहڽސܺȷȜ஖ৡ஁пে஄࠴ФͤΏӈڀ΍̕঑ݯ͠ɚࠉ߲ͺ৶੕ʹ౥৻҃௑௢બଝౄϡɞՀైઠޱ઻ȴƟɯΈȚॾ఻֐િీ૴௷ԕъڜэ΍˧ɰಙ̬ୗѕୖࢼ௡௲˺ತǑͣܗɋࠞѻஸ૦ȞडڽࢆથгеಡఠծಸƔѮ಻̹݆ఘԾдՁ΃˟ܠౄ̗ׄ͜೘гધ௴౸୉௣ॎۢப৷ܾ೟҃Ɵ̷಼͕ನࡗೞ਻ԍఘ೎ӯఖೣಶࣿɌೲț೴ҽ೯ఇಣఉ೩בઙ೭݆೿೸߂ϫ೻ய̉ಒೣՇ೰೺пƟொಧഇ೤ഒഋഔɛ೽೮ങഀ೧ೱജ௶ೢ೶೥ಋಷംư՝ഞഘ഑ഡ௳ണഃೡഏധചձഔǯഅ೏߃രഉೋŞͺമാ߃ീഫɐȞൄޟിౣഁ೨ưɴ಑ആ൅ޟേ൐൉഍͗ശഈൎഢഓ೩எ൓ഽൌെ൞ലൠ൑ದദ൝ಢൟഛൡഥ൜ഠൗള൑ఋ൛ൔ൥ൖ൧പ൘͹షൣ೵൭೉ఈൿŞҸං೾൴ൽ೹൰ưөඊട്൮൨ඏɐԏോڭඔඅ൏൶඘પഎൺඛ൦ඕൾඟ͹Ֆඒയඥඝ൯ഹ೩౴ණൕڭ൵൩඘൫൳ග஫ાൈඩ൲ඣഐත඼ೊ඾ඈ൸ഗප೷ඍഊධඐവශഷറටභ͹آඳൻඵ෌ുĉعෘඤർඦඎ෎ɐٓෟෂ෡ථඖ෤ූඡ൹൤෠ේ෢෍ँưೝ෧ිබ඗ූഖ൬ඌෳොǆඹෑ඄හආඨάව෰෨ෲ෪ු෻ά෈෾ර೦෫෵෥ැซ෹ෛෆϏ೫࣬ค෿ฎ෣ท͹ݣ෸ฅตฏ෬Ş౏ศยฆඞ෕อ෮෉ෙ෋฀ฝŪ੉഼ඃะสฤங฻෽යසเ෴โࣙකฌุร่ೲ˘๋ปูඇϏฒๅ෩ัදลอน฾ดഩแೲࡣฯ๠௛๢ഔࡹ๥ๆ๡๏๩౨ફม๦ࣄ๮೩ఆ฽උ๳ैกث๒ษ๭๼Ш๾฿຀ฺӷ຃๺२ກช๟๬๧๵ưϛ๫๙็ກ๞๹ຎ๴๼॰ຓญ๚ถ้ݵຝํຟห๜Φ๰ජบ๿ຏປีณນ๻ຆৎຣനອຳไ๲ັຊຳฃຫຄື๕Ūகີസວໃ๗຺ດ຅ໂɣທඓົලໍ੝໅ී๨೩੺๸໐໋ແจĉઘ೬຿ຉ໒ໞрຯ๘ພຕຆુ໡ຍໜບ໫ູ໢໑ළ໓຾໮໩໌໥ըຌຘ໯າ໓້໳໿ຼ໓໏ඬ༄໤ำĉ୛໕෺ฬ༌ঌ๱༃໹ໝ་Ūஃ໚༈༕໰ໍ஛໭໾༜ༀ໻ۡ༚්ຶ༝༤໲໸຤໪༞໷༡༭໺༗ૻຈ໴ง༴ࢗ༎ผ༞༇༧ໆ้ు༻๔໻౒གྷ๎๼ࡃཇລ໗ư౹༦ื༨༣༴Ȳ༶༉໵ཅ༫༱དྷ༅ཅ༰໛༢ཝཔ໽འ༲༖ฐĉ್ཋ༮ཅ༾དཀՕ̮བཡ༊ཨԎज़ཫ༳ྲྀǙຩ෯༬ཛྷཱུ༐ཷ໧໊ུམ༗Ǚ൚ึ෱ས༩ྈςཱིྍནཻഝཹཧྂǙཤ༛ྒརྔ༂ཿ཰ҷೖྖྎ഻ཻ༠ཥྀ྇ྦ༒ສྠ໖ຐמൊྤྒྷ྘൒ཐྌྪ༸ྦྊະབྷྻྶཚྩྡӨɣྑྺาྦྚ༿ྰกɭྟཛ࿄Ըඁྸ์࿈๛โࡑ࿇࿒מඑ࿕๓཈ฺԏཽྋ࿖࿜ʇ૊࿟ຬྥ྘ඪ࿪ເ࿬໇ԏ࿂ྛ࿗ຠՕɟ࿛࿍࿢ਆྴྜྷ࿭࿐࿃࿻ໂԏ཮ྐྵ࿧ļ௹࿺༏࿲ෞ࿯໣ྫ྘෦ဏ༷࿉ဒ྄༔ྜཱྀဍ྽໨ယထဍ࿴࿌ဌ࿙˛ဋ༼໥Պဧངྈܖ࿾ရဥဆ࿦ဃဩ݂ྨ࿵ဈƀวန྿ဖ࿲ฮြ྆࿀ဿဘྯဤՕ฼့ဣဨྈ߫၁ဟ၃࿙ࠃ၏࿶຦ၒ࿋཯ဴ၍ခးၚཻجုဠ࿙๤ၔ္Ԏ๪ၥၞ྘ࢎၡၑղ၅࿑ၪ࿲࣍ၭှၣဢၙ၇ҷѱၵ࿘ղၘဇၲၣၜ။ာཻ͢ါ࿡ငຜၩၺ֗ྭཾၱႎԸ౉ႍ၌ཻի႖ႆ྘ິႚႊဩܦ႞ཌྱʇɠႉႣ࿎ໄႢཬྈਢၽ࿷ҷࢾႯၖՕ໔Ⴋེ྘໙၊ၹ႗Ⴙ࿤྾၂ၶႵၰဂ႓מ໬ภမၕཌྷჇၸႁ჆ʇȸႳ჌ბႀဳაဉখდႤკဲ࿠Ⴈ࿢།Ⴗྗ࿲୭მ࿎༙Ⴛ჏ႽქჄၝიƀ༥ცთწ࿙ऌყსཟჯჵՕϡႧႬཻ༺უ࿱ჶპ࿫ྵ࿲གᄃᄈ࿙ཆᄋ࿿ᄉႿသ჋ნƀཏჳჟᄀ྘ཕჸငಐᄏူՕۄᄠၢᄢზᄙႸᄉႄႼႛᄉᄆ࿰ᄌْིᄝ໥৲ჿᄩโȮᄒ྅ၐჂءഄᄘᄇᄐᄹܶᄴ༗ѓᄷფᅄჺႅ႟ᅇϥᅆྲྀȮᄫძᄭᅄᄯတၮءྦྷ჉၆ჼᅛ႐࿥ᄨᅊْླᄤᅚظྷᅁᄰᅃᅥဝᄼᄔกȁ჎ჴᅖᅥᅌᄬᅎᅒըᅉ떠ᅔᅵᅺྂவᅽᄱءඉᅧᄾظ࿞ᅫᅙᆊڱ඙ᅑᆃ࿩ᆍပၾᆇᅯ჊ၦ՛ᆅᅭᆇᅸᅕᆂ໇ؿᆝᄡᆇᆀᅣᅾᆇᅘᆖႰظ෗ᆉᆗᆯᅡჀᄽᆲڱဓᆕွᆷٰხᅍრໂڜᆥᄥءڲᆒᆣဦᇇᄹȷᇃᅨᆸᆨᅂᆦᆯᆬᆻᆮڱံᅝ႒ᅟظျᆺჁᆼܕ၀ᇞᆶᇖȀޣᆱᇥᇡᆙᅞᅶء၎ᇣᅱฺгᆠᆁᇀᄵ๑ᇊڇᇐᅬᇒᇗᇔᇟᇩļږᇍᆏȀၨᇰᆛၬᇨႴء๷ለႂْၴላეሂຂᇹልᇴᆩᆆظϸሄᇠሕᇻᆎሟăݒሞሁሤႌሏჰ:̿ሦሌظ႕ሪᇛەᆾᅹᇶᅇႝሲᇭሰᅴሚᆞሰሙᇑᇄሰᄧቂᇎȀႮሓᄕሬႲቊᅲႶሺᆢᄹႺᇙჅሳȀ໠ቕ჻ሻڱ̔ሮሔሤ჈༓ᇬቒْ୤቎ᇲგቨᇁࢂቫᄵლቮᅇ੮ቱᅒტቑሷትᆴᄓᆛჩቚᆿᄚᆣ༟ቾሶኀᄹჲኃᆡቸᆃჷቴኋቁᇼቃڱჾሗظᄂቷኅْదኔڱᄊኗᄸܫቺᅰᆛཊኍᆣᄗኈᇵኘءᄜእᄹᄟኞᅤካ኏ሢሧሬ಺ኛȀཪክܫᇿᇤሯũȳฟባᇚቜݢླྀኻ݁೼ኸǷᅀከሾᇽ዆ᇫዄብዉሽቆህዌኳᆭ኿዆ቅነቇዌሡዛበԲྣወޢᅜዃቖዅǷൃዋߪᅦኰᆪየስ኉ኪየዒያዔየዖዟዘደዚᇕዜይዞኴጃደዢጂዤϞ቟ቋনግกɳጐฺɬᄻᆚሐ݁ᆔዎ዗ሣԲ࿮ዲማዀ඲ዧጢጁሀጇԉ࿽ጤݢןዯጩኽᇱໂࢴጓጲဎጠሿዀᆹጛዾጝыጴ໥дዹቛዻጹዽጆጋᇉጫǷᇌጮԲီፊߪՀጿ༗Գፐڨኡ጗ራҐፓྲྀߗ፜ྂǸፂቿኟ݁ᇯጻፇጎၓጷዐ߆ጅዣ፩ጉጧጋၠፖԲၤ፫ኑݢሇ፧፯጑ሊ፸ዠߪሎ፼ጊጎሒᎀዿԉሖ፵Ѹጦኾጋምፍު፟໇Ѹጰၦग़᎔โয᎚ࠂሱᎄ፲ጎ႙ᎈጽሹᎠᎏᎢፆ፽ጔႦ᎒ႪᎤኵԣ፱Ꭸ጑ቍᎰጨԲቐᎧጱፀቔዪፃኊ᎕቙Ꮏ፣኱ޢ቞᎒ቢྮዓᏁ᎛ቧᎷጋቪᏐጎቭᏓ጑ተᏖጔታᏙጲቶᎻ᎘ღᎌችᏄኄ፤ޢኂᏤዶᏦዀኇᏩኩᏫݢኌᏜፀ௡Ꮲ፮ᎅ጑ኖᏟጘᏧ᎗ᏼዀኝᏻፚᄎᏳፔኤᐅ፝ኧᏮዏ፹ࡋ።ᏥᏆ᐀Ꭺᏸጔᄣᐈ፠኷ᎌኺᐗ᎕ͥ᎝ࡢᄳ፵ಠᐟࡸዊᐢውᐋጜኵȚᐏᏪᐑǑܼፍȚᎎᎼ༗މᐤũרᐸᐰዦᐜโ੆ᐻ࣌ዮᐢዱᐂ቗ᑂድᏯᐯᑂᐭᑊዳᐹൢᑄᐴၦϙᑁˉ˝ᑖࢬ࿔ᐾࢍᆈᑜࡢᆌᑆዬˉᆑᐢጚᐩጼᐫጟᑢፄᐰጣᑟࡸ࿹ᐲጪᑰᐹጭᑦ᏾ራଙᑙ:ɝፘቤᏍࢍጺᑨ፨กɝᑉᐌᎁࢬ෷ᐢᇆᒍᑓ᏿ᐰፌᒍᎳᐵྲྀɝᑹᑇˉᇘᒄᎫໂࡴᑼ̒጖ᒀዷᐹᇧᑵᐰ၉ᑬᒁࡢ፦ᒝᐔᒟ፪ᒫᒥᒩ᏷Ꭱᒆઅᐢ፴ᒨ࣌፷ᒳᏰᒽᑿᏌᒴᒽᒣᓃᓀ࣪ᒈᐪᎸՈᒡᎋᒼ࣪ᒐᑺ᎑ᐢຒᓕᒙᑣࢬሩᒿᑋˉຢᐢ᎟ᒯᒷฺ஻ᒡᎦᓢᎴᓤႡᓐᓚᓒᒚᓚᒶᓩᒟ቉ᓬᑽᎶᓜᑏᐰᎺᓨᒖྂ঒ᒡᏃᏋዺᒬࡸᏈᐢᏊ႑ᔃᓄˉᏏᓸጡᓺᓮᓙᑽᏕᔎጸᓺᒕᑔᏛᔕ፬ˉᏞᓼᑔᏡᓵ˦ᓆᔊᓈऱᓊᑩᓌᏭᔂᏀᔋऱᐓᓣᒟᏵᔢናᐢᏺᔟᒑ࣌ኚᐢᐁᔸᑺᐄᔛᐍ॑ᔤᔭᔦᑽᐊᔬᏅᓹ࣌ኬᔢኯᕁᒊᕇᔑᑭᕌᓱᓽ໇єᒡᐞፍهᑼɰᓂᔥᓝŐᐦᓵʣᕞᅅ፵ɰᔰᓲ໥ɰᕓᔄ̆ᅐᕩഭᕜᐽᕐᎉਡዩᕉᐐᕋ্ᑃᕥᑅᔾᓯᕹᔨᒅฺϣᕞᑑᖀᕯᔮᕹᕖၦҕᖉᓘᕔ্ᑞᕷጝȠᕠᕅᕢਡᑥᕥᑧᕻᐮᕽŐᑫᖂᔒ২ᕞᑲᕩᑴᖗኵȠᔘᔹᖕᖓᕰǑɡዂᖡᑎᔏƔɡᖚᕊᖺ্ᒃᖸᒉᕸɡᖅᒞᕭᒌᕥᒎᗊᖌᕆՅᕞፏᗊᖳᖍѷᖷᔉᖛᖣਡᇝᖭᎸѷᕄᖾᔖᖻᒧᗜዤݭᕞᒮᗂᓋᗥᒲᖦᖔŐᇸᕩᒹᕥᒻᗤቋɜᗖᅢᗪᗶ፻ᗭᖴᖻ፿ᗵกζᕞᎇᘁᖇᓏᘆໂிᘄᖏᖱŐᓖᕥႈᕜᓛᗽᗔᓟᕥᓡᗩᔩᗥᎣᘉᕭᓧᘚᖆᘊᓫᘞ༗ॴᕞᎯᘥྲྀ୒ᘨᗓᗎᓻᘡᗇᘦᎾᘱᒰᕭᔁᗗᗠᔜŐᔆᕥᔈᗹᘛᗶᔍᘕᘯᗍᖜڹᕞᏘᘪྂ͝ᘮᙇᔞᘵᔱᕭᔡᙋ໇৭ᕞᏨᙑᕬᘦᔫᘹᕼᖿŐᏲᙕโϠᙆᗙఴᙘᖰራϠᙎᙧᔽᙚᕗᙤᕀᙄᙇᐇᙣ९ᕈᙞᖢᙠਿᑍᗃᖘᕏᙴ᙮ᙦᙼȱᘍᙫᐛᙷঠᕛ፵ںᑼਧᚏᕤᚊીᐨᙰၦފᚑᕫᙱੜྕᚍᕲᓵ૸ᚑ᙭ᙼѫᗸᆵ᚛ગᕿᚓũѫᗟᙟᗡļ࠶ᚏĊᚳᚚᚗ࿆ፍѫᚇᖃࠐᚳᚣᚰ̪ᖖᚂᚤᑡᛃᛀ੹ᖞᚫǑ̾ᚏᖥᚖᘎᛈᚶᛐਖᛍᚻᔒ˙ᙪᚼλᚏᆰᚠጶᛊƔెᛜᗆᘶ༗̔ᙾᗺกЧᛜᚄᛇ̔ᛖᗮ੹ᗑᛠᚱፒᚹᒜᛏራఐᚏᇢᛴ̪ᗣᛆᘻ੹ᒪᜁᕂ᛿ᛒ᛺ᗬ᛹ᚼᗰᚠᗲ᛾ᜃᚿᜂϚᚦቻᛓᗼᜋᛗᘀᜅᕑϚᛤᙒᛦᘅ᜜ᕸॗᚏၼᚍᓔᚠᘐᜐϚᜒᜆ੹ᘔ᜙ᛱȰᖽᚯᜓᘙᙺᖹᛮᘝᜣጝܢᚏᘤ᜽ኵ৬ᝀᛰᗾᚱᓴᜬᓷᝂᎸǬ᜕ኢᛓᘴ᜹ᙿᝃᘸᙀᘢ໥ݐᚏᘿᚧᚗᙃᜲᝇ̪Ꮢᜬᔔᝌዤυ᝛ᜮ᜝ᙐᝓᛩฺ͞᜵ᙻᛮᏣᝠᖍ͞ᜟᙛྲྀ࠽ᚏᙢᝦቋ͞᛭ᜓᔵᚠᔷ᝵ᕆ͞ᝪᜤᙯ᝭ᙁᛪᙳឆᖜͤᚮᝲᜓᙹ᝗ᘲ᝺ᕍᜬᚁថᗙணᚹᐙᚠᚉ᝾ណញጝ˞ᝏፙᖃ֠ᑼ˞ន᜺ᜂ˞᝸ᚨథᕨᓵ٧ឭ᚝ិ᚟ᜐ௾ឹឦኵȢឩᒤᕆȢ᝱ឰᜯࡐឭᅪួᚴፍ୺់ខ៉ᅼ៏ᑘ៕ៀᎸࠉឭᛅឝᙼ૧៛ឳၦ׍៛ᜈឫᖪិᖬឤฺѻᛙᔒӇឭᛝួᛟ៪ໂમ៰១ᛐɥᛨឍ៫ᗋ៲្ᕑɥᝆᖍڐ៰៘ዤࠑឭᗛ៴໥Ӂឯ᝔៙ᜀ៝ᛇӁ៻᝘༗ވ᠊᠀ᕸӁ᠃ៅᜏ᠌᠘ᗴᠡྲྀ˧ៃᓇᖜடឭ᜛᠓ឱᎃᠤྂਘ៏ᘈᠰ໇ಭᠫ᠞ᠩᜫᠵโࣴ៏ᜱឌ᠗ᠥᘗួ᜸ភᛥᡃ៸ራಞឭᝁᠭ៉Ꭽ፵टᠿ៭ᛱ̖ឭᘰᡁមᠱᝒᡇᜠᠥ᝖᝝៹ᘽួ᝜᜖ᡋ᝟ᡚᡈᡜ᠛ឧᝥᡏ᠁ᙊᠼ௵᠇ቋۤឭᙔᡳఊ᠏ᝮ៵ᙙᡪᡟᠱᙝᡞ᝹ᢂ៥៮ᔳួឃᢊᡕᝡĽᔻិឋᢄ឴ũցឭᙶ᡺థពᡢᡋរᢙᢕវᢀᢅᠶᐖួឡᢦᢍ᠄ᚌᓵˠᠧᕡᗙކᑼˠ᡼៼ໂˠᡊᖃˠ᠖ᡛ໇ˠᢇᛱϟᢲូᢟಹᕴ፵̐ᢲᕺᢢᢔಹᚪᣄೌᖁᡰᕸֆᣉᢻᡫᢽᖊᜐ͠ᡭኵمᣉᢩᕆ͠ᡵกݓᢲៜᣋၦੋᣦᢸᔒԢᣦᢿᢎӈᣜᎸٞᣦᣠᖜંᢲ៱ᣏļӲ᣺ᢴᡂྂ৛᣺ᣖᢁᢽ៾᣼ă̗ᣳዤԜ᣺᣷ᢰᛶᣇᛸᣨᛐȲះ᠐ᤍ᛽ᤉ:࣯ᢲᜄᣒጝȲᣰᖍࡀ᤟ᠹᢰᠠᤡᣝᠣᤫᣴᒾᤜޭᢲᠬᤕራࡖፍ਩ᤳᤤᣡᜧ᢬ᜩᣚᠻ᤮ᤍᘒᣇᡀᢓᣩᡄᤱᡆᢜᢹ᜼᥂ቋ਱ᢲᡎᤵ᥍ᤌᥐᘩ᥊ᤐᙼ΃ᣣฺ৓ᢲᡝ᥌ᣭᡡᡧᢹᡤᤱᡦᝐᤶᡩ᥇ᤖᝣᥨᤨᥛᡲ᥏ᣤᔚᤱᝬᥭᤶ᡹ᥴᥞ᝴ᥔᣭ᡿᥹ᢹᢃᥢᣀ᝽᥼ᢶᢉ᥷ᥱᛇؙᢲᢐᣚᢒᦅᣱត᥿ᣀᢘᦈ໥৞ᤸᢞᦙ༗ଘᢲᢥᤱᢧᦣᥚᦍ᢫ᜐ೪᢮ᗘᙼ೪ᤘ᡽໻̮ᤀᢼ้ࠊᑼ೪ᤅᢣᦵྐፍ೪ᥖ๼কᦷ̮ᦦᜂ೪ᥝໍȴᦫᘺᜯఘ᦯ᢵᦱᣑᦖᢎఘᣬᛱఘᦹᣌ͹ȴ᤻ᖜఘᦿຆݏᧂ៖፵ఘᧇᦱᛂᦞྲྀЭ᧎ᤁ໇Эᦳᣗᦵᖠ᧒ᖍЭ᧘ၦЭ᧜ᗙЭ᧟ᧈ៩᧩ྂЭᧄ᧌ț᧦༴Ȧ᧊᜶ᨄ៳ᨀ᧮ୡᧂȭᨐ᧷ᛐߴ᧺᦭Ȧ᧽ᦱᒓᓵߴᨃᕑߴᨆ᧪ଲᧂ᠋ᨍᦵᤛᨦഌ᧕᧓ɫᨓራɲᨖᛇɲᨙᨇᜍᦩ٣ᨤᨡᨁঔᧂ᜘᧴ᕆക᧰ᤆᦵᠯᨩജᜢᩆഃᠴᩉബ᤽ᨷ᤿ᤜക᨞ᕸകᨺᨎ᥆ᦓ᧵ૡᧂ᥋ᥥᔒৰᨫᩚᘠᨿ᧝ࡒᩜᨴᨢᥘᩌɐܰᩜᩖᦵᡙᦂ᩟՟ᧂᥤᥪᖃƟᥧᩫ᧚ᥩឪᩳᥬᩙᩀ୑᩵ᦌᧅਔ᩵ᩯ೻᥸᪁ᩥ᥻ᩤ᧻দᧂᦁ᪌᪐ᦄᩞ᧖՝ᨱ᪆ᦊ͔᩻ᢋᩑو᪒᪉ജᦒ᪗ᨬᦕᩲ᪘ᦘ᪏ᨗᢛ᪦ᩚᦝ᪬ᆞ]
//_____________//_____________//_____________//_____________//_____________//_____________//_____________//_____________//_____________//_____________//_____________

    fromString(s : string) {
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
        this.nextId = 
            Math.max(...this.nodes.map(node=>node.id)) + 1

        GraphCanvas.render()
    }
    
}
const G = new NuniGraph()

















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
