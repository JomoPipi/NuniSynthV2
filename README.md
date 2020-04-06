# Welcome to NuniSynth!

Let's play with **NuniSynth**, an audio routing graph synthesizer based on the [Web Audio Api](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).

Linking together basic **audio nodes** gives us the flexibility to create various complex audio functions with dynamic effects.



# Node Types

**Gain** nodes can be used to amplify the output data from other nodes.

**Oscillator** nodes output a specified frequency of a given periodic wave.

**Filter**s can be of different [types](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode#Properties).

**Panner**s can be used to pan audio streams left or right.

**Delay** nodes cause a delay between the arrival of input data and its propagation to the output.

**Sampler** nodes are special. They allow you to play loaded or recorded samples using the alphanumeric keys on your keyboard.

# Connections
If you try to make a connection to any node besides the **master gain**, you will be asked to specify the connection type. 

**Channel** connections are used to pass sound data from the `from` node to the `to` node (the arrow points from `from` to `to`). 

Any other connection type uses the `from` node's sound data to automatically change the values of the `to` node's parameters, over time.

## Some Example Graphs:
Paste any of these where it says "paste it here":

-- binaural beat:
```
{"5":[Āidă7,"connectiĎTypeăČhaďel"}]ċ6ăą"ćă8ċčĞĒĔnĖĘĚcĜĞĠĢċ7ĦĆĈ:0ĬĎĐįĕėę:ěĝĐĸģ"8ļĨľŀČłđēŅĳňĵŊğġ]}:šħĩĿċtņĚgain"ċxă0.5ċyű.12Ŵ"audĔParamValuesăĀŪŬŷ2}},ĽăŻŧř"oscillatorŮ"ŰĿ.4474934036ƮƮ14ŵŷ55ƫƺ043227665ĊżžƀƂƄƆƈƊƌ"freqƉncŶ:50œdetuĐűƓǈſoNoǞĲŇ"sŬęƓƕ:6ŦŨňƛƝƟơƣƥƧŲ5Ǆ7ƻ61Ƭƶ24ī"ǙǿȀ1959ǅ4ȅ86ƬċŽǦƁƃƅƇƉƋ:ĀǒǔǖǘƖ0ŻǞǠǢĿǤȚĔǨǪǶǭǯġƔőĉǵƙpŜƤůŷƪ583ɅɆɇɅǴȋƐ7809798ǂ08Ʈ3ǇȰoȜǌȟǏȢ"Ƚŭ:-1ƒȸŤȊƘǬɢĐȿƦƹ6ƾ1ǄɵɶȗƸƨǂǄǆ0ɲ5187ǀșǉɛǋȞǎȡĀɢăɦĢ
```
-- weird rhythm:
```
{"1":[Āidă14,"connectiďTypeăčhaĐel"}]Č2ăą"ćĉČĎğēĕnėęěcĝğġ},ĆĈ:8ĬďđįĖĘĚ:ĜĞđĸĤ"5ħĻă6ĿĮĔŃĳņĵňĠĢĺĩļ1ŒŁŔıńĴĶŉśŏ:şčŀĒŢĲŅ"dĠayTimĚģČ6Ŏŝă2ŠŮİŰěfrequencyĢŋ8žĪ:0ƂłţŖŇķƐČ10ƓŞƗůŤņųlŵŷŹƝāĂĄũƟƣƄƥƛŧŻā3ơăƖŬœƳƚŘƜƷĊƺŪ3Ʋŕűǁƶŋ1ōƯſǆǈƙűpĞƐ}:ǚĨƔƼtƴgain"Čxƻ.50251Ǭ628Ċ070Ǉ"Əƕ.133Ƕ76940ǼǾ3ȀČaudĕParamValƋsăĀǡǣǨ5}ĹưČǟƚƧŵǥ"ǧǺǼ0653266ǽ1Ȭ8Ƿǹ0.3Ɵ42Ǯ86ǶȻȽǷȊȌoȎȐȒȔȖȘŲŴŶŸŅȸȝȟǑƁ"ȢűoscilƨtorȦȨɓǫǭǯǱǳǵȶǨȺ0ȼȾɀɯɱɄȋȍȏȑȓȕeȗ:ĀƇƉƋƍǹ20ƼųtuđƻĹ"ɅĕNoųƅņsǣźŜƔ5ȡƴɛɝɟaɡɣǦǨ88Ȃ472361809ɰʜǸȜʭ58ȭȴʺʸőʏɷɇɹɊɼɾʀƈƊƌƎȜČʉʋɒʎʐoʒʔƴʗʌɕƔʾəěȚǤʥǺʧ1ʲ95ʪ73ȿ93ʴȷȹɂɲɁɰɃȉˀɈɺɋɽɍ˝ă˧.ʆʇ̀́ȄȞʚļľɘǠǢ˞ȧʦʨ4ʪʬʮʰʲ4ˬǨ˰ɴȽǱɳ˴Ɇ˶˃Ɍɿ"˻ȩ̄ưǞ̉ț˟ȸǼ567ȵ9ˢ59799Č˭˥Ȁ7ʯȃ˫ʪ̯ɗˑ̟ɻ̡ș̊Ǩ̃˘Şū˛ņʟɞɠɢɤȜǮ̮ɪȃɬǭ̺̇49ʧ̲˫Ǭ͟ʨ̝ɸɉ͆˹̢ʁˈʄĉʾˍʌƕːˀ˓eʕ"˖ʙưǷ͏"ǖğʤ̌ǺǾȬȮȰȲȴ2̸ʵǺʱ̵̰2ǵǪ̷7̰ɶ̞˂ͪ˅΀Ǘʹ͌ĉċ̈ƚ˻̫ǻɩǲ͚Ƕǭ7ʸ̹̗4ˢȫ8˧ʮβʲ7ͧˁͩ˸Ν̤ɓ̦Ǒǎʝƚ͑ʡʣ͕΅1ǎ5Η̏͡ʫʭɭǺ2β6ʹĊβϖȳʹΙͨ˷˄ɍͭʃˊĽˌeʊͳ0͵Ɇͷ͹ͻƐ
```
-- arpeggio (use keyboard)
```
{"1":[Āidă0,"connectiĎTypeăČhaďel"}]ċ2ăą"ćĉċčĞĒĔnĖĘĚcĜĞĠĢċ4ĦĆĈ:2īĎĐĮĕėę:"playbackRatęĸ"5ĻĨĽ6ŀĭēńĲŇĴĝĐķ,ļă4ŜłŞİŅĳĵŤġģ"6Řĩ:ũČŁđŬıņěţğġŦřă1ŪżįžĚŉŋōŏőœŲċ7ŶŚƈŃŭŠƀĶŲ}:ƠħŷĊ"tŮŇgain"ċxĉ.5ċyư12Ʋ"audĔParamValuesăĀƩƫư5}}ƄŷƇƥƧ"sǁŉerƭ"Ư:0.454687Ƹƴǟ.39740820734ǵƶ53ċƺƼoNodņĀĬūeǇĻŕbuffǚInȁǞƤloopăfǄseċȁtuĐǉ"nǁſȞȠęċsrcǉǏċƍŌŎŐŒȂȣȥƌŊȲƐȵǜȫȭ:{ȯǔƛȔȖǜĒǞɂȪouȬȇĄɋɒǐɓŦɔɗɖəɕɛɘɜɚɝɠɟɢɞɤĢǐƹƻĔǿȁƋŇɆȗǻɩoƾǀǂǄǆǈɁňȺƏȴƒ:ǓȧȡǟȯŧľċƦƛǗmǙǛƮǍǹ906ƷƳưǬ5248380ƶ9589śɨǽɫȶȄżȆɹąȉȋȍrȏȑĪ"ɯȘȚȜ"ʂȶȤmȦeȟȡȪȬȮɧȱɽƑʽȸŇˈȳˊȾ˅ɁɃʉſʷītɊɧsɍɏʭɥɣɡˠˣˢ˥ˡ˧ˤɖ]ɧǼɪȀeɭʶȕɰʦƽƿǁǃǅɐĀˎȼɿʁˁȨĉʅƅŸʈǕǋƬʏǪ35ǳ8ǸʖǪ617710ʢ31ǹǵ̖ɱǽɴ˸ɷ˻"̉ă2.8̫2̐Ʒ0̰̱04̄ŷƸ˕ĚoscilŊtoʎǝưǲʔǨư63ʓ6ʡǤǶʔ85Ǔ˭Ǿ˯˱squƿȩ˵ɳ˷ɶ˺ɹĀfre͙encǩ̀˂ņ0̵ƗɄſ̧̋Ǡ̛ʛǶǧ̒ǠǤ2ǲ͊23ǧʞ99̠̍˶ɵ˹ɸȢ̧Ǫ̕8Ͱă7̇ƛ̺̼̾Œ́ǜȒ.;ǵ΂͇Ǫ4276Ǣ7̫33͌ΫʓΈ͕ɬǕ͚ͥ͘ǜ̢͔͠ΌɺͤͦǆͩǩǺʻ́ʃͯĢ
```
-- random beat
```
{"4":[Āidă13,"connectiďTypeă"detuđ"}]Č5ăą"ćĉċčďđēĕnėęěchaĐelĢĤ"6ħĆĈ:12ČĎĹİĖĘĚ:"frequencyļČ7ŀĩłńņĮĒĔŊĴōĶĸđĻģČ8śĪ:0şňŢĲŋĵķĹũĽ9ŭłŰĭŲıĳŌčŷŨŘ"10żă8űįųƂěpĸĢ,Łă6ƎšƁŵťƅĺƇ11Ƌ:9ƚŉŴŤ"ƓnƕƗ:4ƧƐƝƄŧƠŪƈ2ƤƍſƏƜƪŦŸơ3ƤƦƽƛţƃǁƆƸ1ĦĄƯ1ƙǇƨƑƞƶŹČǒƤǓŇƾǉěgaiƭ}ƖŜăƱǔƳƪǢǤƮǨŃ7ƲƿǊƟǙƈŚǐǱĊǴǠōQǰŮŞǫǵěȁģ}:ȋĨŮžtƴǮƭČxă0.5Čŗů.ń526997840172Ȥș"audĕParamValœsăĀȒȖȘ}ǦƯǪȐǭǣȓ"ȕȜ703ȞȚȿ33ȠĊ390928ȩ5ǳȭȯȱȳȵȷȹeȻ:ȽɇăɌ00ɁǧŮȬɅƃoscillator"Ȕȿ6421ɛȬțȗȩ35ʃƢ6630ʏ9ǓȮȰoNoĝǖ"sŒȳĚČʖɡȴȶȸȺȼŎŐŒŔŖĉ5žĝğġůɯƯǓɳǡɪʀȜɓɍɏ"ʈ.3498əɭ8ʐ9ʑ8ˊʢɠoȲʥɤʨɨ"Ⱦ:2ɭɮɂǱɞʹōɵɷɹɻɽɿɉɑȣ6562ʇȿ7ń7ʃˆ0˭ǎ5Ȭʣʘʚeʜʞuʠ˨˼˓ɣʧɦʩŏőœŕțƉʱĞĠŌ˝ɰłƼˡƫƶɾʼȗ447ˬˮ˰ʽɓ6ɕɗəɛ˯ɞ̅ɢʦɥɧĀƬă-1ʶǱǆ̙Ƭđ̜˩Ȝ˭˭˯ɐʽ4ȞȠȢȤȦȨĬ̮˔̲̈̚ƭŃ̸ȃȏƴˣɸɺɼ̾Ɋȗ3ˇʒ̓ˁȿ͇ȡȣȥȧȩȫːʗʙʛƴsǤʡɟʗ̰̆˖Ā̋ʬ̎ăŅĜ̒ʴ̕Ǒ1Č̙͙˥͜˨͞.ʐʋˌ7̤ȗƢɛɗ˅6̡0˯9ʅͭĕͯ˿ͱͳ̄ˑͷ˕̉˗ͻ̍ʮ:Ĭʲ̓Ȗ͕ŝͿ̙fɸte͝˪5Ɏͣ˂ȟȠȤʅɝ451ȦǪ˼ΠʜlowƓsȻΞ˒̯Χ͑Ϊʭțʑ.08͠ǒ0Ɍ͠˲2ͿȁŃČ˙ȗȬί΂βīΆƴζlθκȜʐφ͂ΒȘϥΘ8σ˴φψϓϋƴnotĶΤͶϕ͐̊ʫΫϚ˛΍9υ˛ɌʰȤϦĉϩɪ̀Čϭ̔ϯŃɲ͘ɶ͚˦϶ϫϡʿξɑɖɘɚɜɌ1ЕωˑЅƪtriĸglʹ͎̱̇Џ̌ϙƌР΁Т˞ȃʸȑʻ̿Ы85ΐϻφϞ5ѓɎɎ˴Е̭ΥЍф˗˙̐ɭУȨϱɆǯ̝Șϝє3Α̈́ʉȨ͢ʐ˅ˇ˛ɘϓΦЎѣОȗɭȪμ9Ɂ]
```
