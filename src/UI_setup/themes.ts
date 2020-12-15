






type Color = readonly [number, number, number]
type ThemeData = readonly [c0 : Color, c1 : Color, c2 : Color, c3 : Color, c4: Color, c5 : Color, c6 : Color]

export const ThemeHasADarkColor0 : readonly boolean[] = [true, false, false, true] as const

const themeData : ReadonlyArray<ThemeData> = (
    [   [ [32, 30, 32]
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
    , [[30,30,30],[80,80,80],[240,166,202],[239,195,230],[184,190,221],[156,137,184],[240,230,239]]
    ] as const)

export const ThemeColors = themeData.map(theme => theme.map(([r,g,b]) => `rgb(${r},${g},${b})`))