






import { SubgraphSequencer } from '../../webaudio2/sequencers/subgraph-sequencer.js'
import { NuniGraphNode } from '../nunigraph_node.js'

export function sequencerControls(node : NuniGraphNode) {
    const an = node.audioNode
    const controls = E('div')

    addPlayButton: {
        const btn = E('button')
        btn.innerText = 'play'
        btn.classList.add('kb-button')
        btn.classList.toggle('selected', an.isPlaying)
        btn.onclick = () => {
            const play = !an.isPlaying
            if (play) 
                an.play()
            else 
                an.stop()
            btn.classList.toggle('selected', play)
        }
        controls.appendChild(btn)
    }

    changeStepLength: {
        const text = E('span')
        text.innerText = an.nSteps.toString()
        ;['-','+'].forEach((op,i) => {
            const btn = E('button'); btn.innerText = op
            btn.classList.add('top-bar-btn')
            btn.onclick = () => {
                const v = clamp(0, 
                    an.nSteps + Math.sign(i - .5), 64)
    
                text.innerText = v.toString()
                an.updateSteps(v)
                an.gridSetup()
            }
            controls.appendChild(btn)
        })
        controls.appendChild(text)
    }

    toggleSyncPlay: {
        const text = E('span')
        text.style.marginLeft = '30px'
        text.style.marginRight = '5px'
        text.innerText = 'sync'
        const box = E('input') as HTMLInputElement
        box.type = 'checkbox'
        box.onclick = function() { an.isInSync = box.checked }
        controls.append(text, box)
    }

    changeSubdivision: {
        const text = E('span')
        text.innerText = 'Subdivision'
        text.style.marginLeft = '30px'
        text.style.marginRight = '5px'
        const input = E('input') as HTMLInputElement
        input.type = 'number' 
        input.min = '1'
        input.max = '128'
        input.value = an.subdiv.toString()
        input.oninput = function() { 
            an.subdiv = +input.value 
            an.updateTempo()
        }
        controls.append(text, input)
    }
    
    an.gridSetup()
    controls.appendChild(an.HTMLGrid)

    return controls
}

// {"connectiăs":Ā2Č[ĀidČ31,āăąćĉnTypeČāhaĄel"},ĒĔ:32ĘĂħĜăğġģcĥħĩ}]Ę10ĐĭĕėęĴĈĶĠĢ:ĤĦąĽĬ"ēĕıŇěŉĞŋĹĻŐĪĿ"14ŃœĮĖĲĚĆřķŌŎļĪŒŔįŖĳŘĝŬŜŏĨşĘ21ŤŲŧŗŪŷśōĺźőńųŨňƅĸƇŝŻľĘĖƀŦ9ƍŶŊƐŮŞƔ"İƗĕ7ƚƄƜŭƈůƠ33ƣ:0ƦĵŚƝƪƟŠ3ţ:đťĕ3ƲūƆ"frequencyżơ6ƯƹǀƏƩƒƊƽįƥƃƳŸōpĦǍ37ǐƿǚǁƵǕǠ8Ư4ƱǥǓŹƫƸ9ǐ8ǒƨģǄǆǈǊǌƠǬƯǭŵƧƴǔƉǍ4ſƻƋ3ǵǮǷōǹǇǉǋȇďȊǗȈǶȄǰƷī"nodeċȗŲǭtǂgain"ĘĈtlŭȪȬȮ"xČ0.0ȍǌư.1707ŁȌ2513661ŖaudĉNȡŌ{ȞɏɑoParamValǈȤĀȴȭȿ0998046875}īƋŖȨƝoscillatorȶȰȲģɹɻɽɿʁȶȸȿ3ɪʐʑʒ9ǙȾȺ79ɋ484Ɉ73ɭ18ƙ"ɘɒɔČĀćʍĀtempoČɍ0ȞADSRɤ"ɋ642łč"ǅȲaseIĮ-1ɳĘvoɢmeɓȢʩȞMONOČʽʿǭkbMʨōȠąȶsourcȣʩʼʚˀˮĥsStɜʮĮtrǈˍ"˩tputȤ[Š_ɷŭsȬĢĘȢtu˦˂s˫˖ȞȑǻȔ̒̔čɳɗɐʧȢǜ"̊˦Ęʦɚɜɞɠɢ˭˂̗ȓȾɌ6.2ʟ8ʢ350Ţȍ̎̐ŌʵɴǗŁȯǂʇɼɾʀʂȯiȱŭ͇ʉ͊ʌȹ̴4Ęʖ.ʘʚʜʞʠȈʣ̦̟o˔ɕātʬ"ʮʰʲ:ʴʶʸʺˮ˝˱˂˄eˆˈˊˌȞˏˑ˓ˣɖĘ˘˚˜˰˟ˡˣȟặ̌˩˫̭ĀͳˁĀ˳˵˷e˹˻e˽˿́̃Đ̆̈ģ̤Ό̾̑Ā̓c̕Ę̯ǼˮΩ̞̕ə̢ͤΤȶ̧ɛɝɟɡɣˮέ̙Ǭ1.5Ɇ747ɂɯ2ǤΦ̀ˍƋŢͅɸɺ͈ʊ͍͋ͩʅō͉͐ʋĘʍȺ55ʓϤʤ͚͘ʾ͜Ɂ͞ʢʤ̧ͤˮʫˮͪʱʳˀͯʹʻΒˮͶ͸ˉČˋ˽ͽu˒ϰ̜΂˙˛:ΒĘˠˢ˕ˤ΋˧ΎˬϺΆ˲ˆΖr˸Č˺˼ȞΝ̂̄Ρǂζ̍ȅΧ̛̣ɖ̖ǅȒή̚Ϊ̜˽ϯɔε̋η͢ι̪μΐǃЯ̘Ⱦ9ʝ.ʜɌ1ɪ̻6ʙ6ЧЩώ͂Ųžϒ͏ϔ͑ϞϘ͎ʆїϝϗϠȻȽ͔Ϩʛʝϫʡ͠ʥ͢ІʪͧϳʯϵͭϷĘʷϹͲЗ͵ĨͷˇϿ:ЁͼːЄͿА΁"΃ЊЌ"ЎΉ˥Ό˨˪ЕѷʾʹΔЙ˶ЛΘНΚΜ̂ΞУĘ̇Хйя̿ίЬ˽οȾΨҧеѫзҢ̥Ѫəмλ̬ʻҩČ2Ɍ.6ɇ56τ00ϣɰҤ̑́űŦņ΢ōsubgɝph-ˇаˬϗʄ̉ӏӑaӓӕǺȓeџ͔2͖"͘ҿ90ƹ6ȼǡ8ɰɃ͡γ΀ͦͨϴͬͮѴͰʻȖĀϽѼͺȞŁϼѺϾԃŀƺԀԇԂЀˌŽȉԌ˅ԎѾͻˎҁЅ΀Ȟn˵epȤӧsʮpMɿriͨȖ[fɡˇ,ƱОe԰ŠԅƻԱΚ,ԭlԯ0ԵƺԬԮԳԲ԰ԴԑĐՄԻԽԴȞm̂ΘCǨ˂ȖՊԳšˁՕԊČՕԜoʮTi˒ʳ7ьσĘԣ˷ՠբưĲ˪ǅntԞpҹĘisPɾyȬgҚǈ͌ckӥ5ĘwȬdowIsOġɧՙ"HTMLGԨĮ֑҅֓Boxп2ư˖Žͭ֡"֟ӿȞ֟ƮЇ՗֠֫Ł֣֮0:֧ŀֲ֪҅Ţָ֭4ְֳַֹֻ֤֨1ֺ׃ֽ׆ִׂ֥ׄȞնIԝyǊսՖӎbɑvČ8βĉҴ̫νдӉŕѕΣӜӒӔӖ̘ӣʃϙӛӐצӠӗתϟ͔ʏϥʓʕ͔ӪӬɮӯ7ӱɂǙж҄ӷѯͫ϶ʵӼѶՓԆԔ͹ԏԄΓ˃ԍ؎ԖԄԋؒ؍ѽЁՇѹؙԃҀ;ѬԜղȤю̣ԤԦ˺ԩˮԫՉՂՅƱرԵˁՁԼՃԹՙرԺՂԿĐع,خضػقՕŠžĐƱؿفԯمՍՏdՑȆ֫Ƞ՟աŌɁեƭٚٛʏӦէҗtժ̀խrկձԤմœշչջדտցȿ1ʽٳٴٳքֆֈ֊֌ǉ՛د֐֖֤֒֔֙L֛֝Ӿׅ֢Ԓֿ֤֨֫֩֟ԋڌ5׀ֲΓֵׇؐڍֶָڕ:ڒښڔּ֮ڗԊڙšּ׉ׁ׀ּڠڨ:ڢ҅žډ׊ڧڳ׉ڳׂԑڟڐׄڱ˽׎אג:Մ̣ӏח϶כ̨κמΐϏǗƭףȐɼʮә׬Ǹ۔ײȷ׹Ŗ͘ɁɃɅ8ɇɉɋɍӴ̠ɕۊδǂlֈǞsċۧۋнҶξс̰Čʟ9ҼτİӬɍփ"QʳĘɦ׹ӆёסįӧӌ"܆͌ћō܏ۛȿ6ʘ׶ʑ͔͗۟ɄӬۢɈɊɌɎҮ҄ۊםоʻ܆ЋӂۏƁئ܍Ϝϖ׫ܑ˾ѝܲ׳ܕܗܘɪܚʎɫİʿɇ8Ӏˀфӧ؂ͥϲ˂ӹ؇ϸͱ˂ϻ؝ѻؔѿԘءԛЈ΄ЋΆЍΈАΊұҏΏЖғؑΕ٠ҙۄқРҝТΠҠ܍Ц"ύҦгЭά۷бҫݶ̝۲۫Ɲݲθ̩ҵןĀҸǘ.9ȌɪҺ1ϣ̵ʿ܈ȹܭŦǙ܍ǞħܴۖޘąӤȿ5۝״ܿӦ2݂݄ɩ4݇ܤ۩۲ܧ۵˂ޘޓђŦȍܰܶ͒ܐϚܵʈў͓ɨѢʎȈ˞դ̵̺İٞҲۨϱѮ݋ѰӺѳ"ѵݏΑѸԓݓؚԗ"ЃԚܥݙ҈ݜҊݞŭҍГҐпݑҕ˴ݨΙПĘСΟƻФƝتĦgʅޒвΫрӡݺЫݼҭӵ̡ǂߴn߶Όނیܨ۶߼̙ǭݴưޔĕʤ܍ܓӚģܓѠȼܽϡь׻Ӯ8ӰӲ؁ޫ֤ࠈ۴ޅ܎ȫɧ̺ӈƋǬےࠩȵ޹ȳࠪ޾Ⱥ̵ܻʐ׸߁Ţˀ߄0߆ޥުࠁެ߉۳ބпܪȺך޳Čșͩȩ࠵࠳ࠗࡒܔȺщ࠹ɪ߀Ⱥʝޠ̵ɯܖӬɩӀݾݘࡆޮࠨܪɪࠑڟɶ͆޷љࠖϛࡰޞȺɊࠛ.࡝ޥդ݃ɂʠʙ܁݈ߋӸߎݍ؉ߓ˯ݥ،ߗ؟ݖ҂آߞ΅ݥݝЏߣВէДߧߕ"ݧΗ߬Λݬ̀ݮ߱ݰҰΥШҥ߹נ߻ӗҪ߾αࡥࠂހңࡧރۍҷݹࠍȻɇ߸́]}
