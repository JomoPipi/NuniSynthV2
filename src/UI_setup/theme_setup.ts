






import { UserOptions } from '../storage/user_options.js'
import { mixRGB } from '../UI_library/functions/rgbcolormix.js'

type Color = readonly [number, number, number]
type ThemeData = readonly [c0 : Color, c1 : Color, c2 : Color, c3 : Color, c4: Color, c5 : Color, c6 : Color]

const ThemeHasADarkColor0 : readonly boolean[] = [true, false, false, false] as const

const themeData : ReadonlyArray<ThemeData> = (
    [   [ [16, 15, 16]
        , [48, 47, 48]
        , [58, 57, 58]
        , [68, 64, 68]
        , [93, 91, 94]
        , [154, 151, 163]
        , [255, 255, 255]
        ]
    // Reversed version:
    , [[255,255,255],[154,151,163],[93,91,94],[68,64,68],[58,57,58],[48,47,48],[32,30,32]]

    ,   [ [240, 230, 239]
        , [156, 137, 184]
        , [184, 190, 221]
        , [239, 195, 230]
        , [240, 166, 202]
        , [80,80,80]
        , [30,30,30]
        ]
    // Reversed version:
    // , [[30,30,30],[80,80,80],[240,166,202],[239,195,230],[184,190,221],[156,137,184],[240,230,239]]
    
    // Yellowish
    , [[245, 205, 150],[250, 240, 200],[210, 200, 150],[210, 200, 150],[210, 200, 100],[50, 45, 30],[50,40,10]]

    // Purple
    // , [[50, 50, 100],[150, 100, 200],[100, 100, 200],[50, 50, 200],[100, 100, 150],[100, 250, 200],[240,230,239]]

    // , [[75, 75, 100],[130, 125, 175],[125, 125, 150],[100, 100, 150],[125, 125, 150],[100, 250, 200],[240,230,239]]

    ] as const)

const ThemeColors = themeData.map(theme => theme.map(([r,g,b]) => `rgb(${r},${g},${b})`))
if (UserOptions.config.customTheme.length > 0)
{
    ThemeColors[3] = UserOptions.config.customTheme
    console.log(JSON.stringify(ThemeColors[3]))
}

// Changing the light theme:
ThemeColors[1] = ["#eae1e1","#bcb0a4","#485c65","#657381","#878e92","#5c6161","#030303"]

export const Theme = 
    { colors: ThemeColors[0]
    , isDark: ThemeHasADarkColor0[0]
    , set: setTheme
    , 
        setCustomThemeColor(index : number, color : string) {
            ThemeColors[3][index] = color
            setTheme(3)
        }
    ,   getCustomTheme() {
            return ThemeColors[3]
        }
    }

setTheme(UserOptions.config.theme)
function setTheme(n : number) {

    const theme = ThemeColors[n]
    Theme.colors = theme
    if (!theme) throw `${n} is not the index of a theme.`

    Theme.isDark = n !== 3
        ? ThemeHasADarkColor0[n]
        : Theme.isDark = 
            theme[0]
            .slice(4,-1)
            .split(',')
            .reduce((a,v) => a + +v, 0) < 300

    document.documentElement 
        .style
        .setProperty('--dark-mode', Theme.isDark ? 'invert(0%)' : 'invert(100%)')
    document.documentElement 
        .style
        .setProperty('--light-mode', Theme.isDark ? 'invert(100%)' : 'invert(0%)')

    document.documentElement
        .style
        .setProperty('--dark1', Theme.isDark ? '1' : '0')
        
    // There should be 7 colors in each theme
    for (let i = 0; i < theme.length; ++i)
    {
        document.documentElement
            .style
            .setProperty('--color' + i, theme[i])
    }

    // Set node dialogbox colors
    for (const nodeType in NodeTypeColors2)
    {
        const color = NodeTypeColors2[nodeType as NodeTypes]
        // const tintedColor = mixRGB(color, Theme.colors[0], 0.05)
        const tintedColor = mixRGB(color, Theme.colors[0], 0.02)
        
        document.documentElement
            .style
            .setProperty(`--${nodeType}-dialogbox-color`, tintedColor)
    }

    UserOptions.config.theme = n as 0 | 1 | 2 | 3
}

// CSS classes for node dialogboxes:
const style = document.createElement('style')
style.innerHTML = Object.keys(NodeTypeColors2)
    .map(nodeType => 
        `.${nodeType}-dialogbox { 
            border: none;
            height: 100%;
            background: 
                linear-gradient(180deg,
                var(--color0),
                var(--${nodeType}-dialogbox-color)); 
        }`)
    .join('\n')
document.getElementsByTagName('head')[0].appendChild(style)