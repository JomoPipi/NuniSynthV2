






import { themes } from './themes.js'

// Get CSS variable:
// getComputedStyle(document.documentElement)
// .getPropertyValue('--my-variable-name'); // #999999


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

// TODO create ThemeData object so that canvases can adjust to the theme changes
// export const ThemeData = { hasDarkColor0: true }

export function setTheme(n : number) {

    // ThemeData.hasDarkColor0 = 
    //     themes[n][0]
    //     .slice(4,-1)
    //     .split(',')
    //     .reduce((a,v) => a + +v, 0) < 300

    // log('has dark color0', ThemeData.hasDarkColor0)
    // console.log('n =', n, ', themes.length =', themes.length)

    const theme = themes[n]
    if (!theme) throw `${n} is not the index of a theme.`
    // There should be 7 colors in each theme
    for (let i = 0; i < theme.length; i++)
    {
        document.documentElement
            .style
            .setProperty('--color' + i, themes[n][i])
    }
}