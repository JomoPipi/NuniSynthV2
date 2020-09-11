






import { themes } from './themes.js'

// Get
// getComputedStyle(document.documentElement)
// .getPropertyValue('--my-variable-name'); // #999999

// Set
D('theme-container')
    .append(...[...Array(themes.length)]
    .map((_,i) => 
        E('li', 
            { children: 
                [E('a', 
                    { text: i.toString()
                    , props: { href: '#' } })
                ]
            }))) 

export function setTheme(n : number) {
    // There should be 7 colors in each theme
    const theme = themes[n]
    if (!theme) throw `${n} is not the index of a theme.`
    for (let i = 0; i < theme[i].length; i++)
    {
        document.documentElement
            .style
            .setProperty('--color' + i, themes[n][i])
    }
}