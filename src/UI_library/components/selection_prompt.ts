






export function createSelectionPrompt(nameList : string[]) {
    const buttons =
        nameList.map(name => 
            E('div',
            { className: 'list-btn'
            , text: name
            }))

    const list = E('span', 
        { className: 'window show preset-list'
        , children: buttons
        })
        
    return list
}