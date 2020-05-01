






{
    const deltaExp = D('delta-expression') as HTMLInputElement
    deltaExp.oninput = function() {
        Keyboard.scale = trace(eval(`
        Keyboard.keys.reduce((a,_,i) => 
            a.concat(a[a.length-1] + ${deltaExp.value}), [0])`))

        refreshKeys()
    }
}