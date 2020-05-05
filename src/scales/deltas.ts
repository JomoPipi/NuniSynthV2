






const setDeltaExpressionScale = (_ => {
    const deltaExp = D('delta-expression') as HTMLInputElement
    return function() {
        KB.scale = 
        KB.keyCodes.reduce((a,_,n) => // < - The third parameter must be named `n`.
            a.concat(a[a.length-1] + eval(deltaExp.value)), [0])

        setTimeout(() => {// *
            refreshKeys()

            previewScale()
        }, 100)
    }
})()