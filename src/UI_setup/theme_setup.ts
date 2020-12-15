






import { ThemeColors, ThemeHasADarkColor0 } from './themes.js'

// Get CSS variable:
// getComputedStyle(document.documentElement)
// .getPropertyValue('--my-variable-name'); // #999999


D('theme-container')
    .append(...[...Array(ThemeColors.length)]
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

export const Theme = { colors: ThemeColors[0], isDark: ThemeHasADarkColor0[0] }

export function setTheme(n : number) {

    // Theme.isDark = 
    //     themes[n][0]
    //     .slice(4,-1)
    //     .split(',')
    //     .reduce((a,v) => a + +v, 0) < 300

    // log('has dark color0', ThemeData.hasDarkColor0)

    const theme = ThemeColors[n]
    Theme.colors = theme
    if (!theme) throw `${n} is not the index of a theme.`

    Theme.isDark = ThemeHasADarkColor0[n]

    document.documentElement 
        .style
        .setProperty('--dark-mode', Theme.isDark ? 'invert(100%)' : 'invert(0%)')
        
    // There should be 7 colors in each theme
    for (let i = 0; i < theme.length; i++)
    {
        document.documentElement
            .style
            .setProperty('--color' + i, ThemeColors[n][i])
    }
}