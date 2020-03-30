function newRandomWaveForm(N : number) : PeriodicWave {

    const real = new Float32Array(N);
    const imag = new Float32Array(N);
    
    for (let i = 0; i < N; i++) {
        real[i] = Math.random()
        imag[i] = Math.random()
    }
    
    return audioCtx.createPeriodicWave(real, imag, {disableNormalization: true})
}


// {"1":[Āidă0,"connectiĎTypeăČhaďel"}]ċ2ăą"ćă3ċčĞĒĔnĖĘĚcĜĞĠĢċ3ĦĆĈ:1ĬĎĐįĕėę:"frequencyġ]}:Ŗħĩ:Ċ"tņĚgain"ċxĉ.50144369586ū052ċŒŚ.1274298ŵų5ƅ076ċaudĔParamValŎsăĀŠŢŧ319ƠơƢƢ5}},ĽăŀŜŞňoscillatorŤ"Ŧźű517Ƃƅ82ƀ06Ɖ"Ź0.46Ǆ030237ű0Ơ35ƊƌĔNodeĲŇ"sŢęǛƍoƏƑƓƕƗƙŉŋōŏőăŬśǠtuĐĉƦƨĨľŷƬĳƮưƲƴƶƸťŧũŭƞ08Ǖ8ſ15ǈǊ.ǀ185žƾ4ǐ8ȑ7ǨǝǟǡƭǤǦƹƋǩǫƒƔƖeƘ:ĀŊŌŎŐŹ8Żż7Ǔ6ȑƇ9ǒǈǹǻŇ0ǾƩ:īȃǣƛţȋźų7Ʉț2Ų8ū2ŬŸŧ7ƟǄɝǎ2ǐǒ38ȥǪƐȰǮȳǰɑăƠƦ]
// {"0":[Āidă4,"connectiĎTypeăČhaďel"}]ċ1ăą"ćă0ċčĞĒĔnĖĘĚcĜĞĠĢċ2ĦĆĈ:3ĬĎĐįĕėę:ěĝĐĸ,ĽĉŁĮēŅĳňdğayTimęĹ"3ļĨľ1ŐŃŒıņĚfrequencyġģ"4šĩĿťđŧĲŇŉķŴ}:ƄħŹī"tũňgain"ċxĪ.50144369586Ƙ052ċų:0.1274298ƢƠ5Ƴ076ċaudĔParamValůsăĀƍƏƔ339ǎǏǐǏƟ}}ōŢăŤƉƋ"oscillatorƑ"ƓƧƕ8517ưƳ82Ʈ06Ʒ"Ʀƨ46ǳ030237ƞ0ǎ35ƸƺĔNoŖžĚsƏęȉƻoƽƿǁǃǅǇ"ūŭůűƦ5.72ǶƖ779ƭǻƬe-ƪċŖtuĐă6.9Ƕ64ȫȪƣ2Ǭ7ȯ15ǔǖŹƤǚŔǜǞǠǢǤǦƒƔƖƚ3108ȃ8ƭɅǷǹȤ81ɂ4ǭ4Ǿ8ɚ7ȔȋȍeȏňȑȶɬȖƾǀǂǄeǆ:ĀȞŮŰŲăȈ"ȳȵŇƨ5ǑʊǏ3ɇŎźɋſǉƐɓǪƠƯȦȃȼȺ6ɗŀǸƔ7ǮǵȦ3Ƚ8920ȅɴȗɷȚɺȜʓăʪ0ʎǗ:ĊʑĚŖǢųʕƨǍɜ6ʫ5ȩ4ǯʦƙƥƔˈȫɢȼƘ6ƟǲʃƹȕʮșɹɻĀʽŘŚŜƔʨǼȺƬɗƭ9ǿ2ǔ]
// osc.setPeriodicWave(wave);