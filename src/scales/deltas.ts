






const setDeltaExpressionScale = (_ => {
    const deltaExp = D('delta-expression') as HTMLInputElement
    return function() {
        KB.scale = eval(`
        KB.keys.reduce((a,_,n) => 
            a.concat(a[a.length-1] + ${deltaExp.value}), [0])`)

        setTimeout(() => {// *
            refreshKeys()

            previewScale()
        }, 100)
    }
})()