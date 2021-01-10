






declare type CurveType = 'linear' | 'logarithmic' | 'exponential' | 'S'
declare type ADSRData = 
    { attack: number
    , decay: number
    , sustain: number
    , release: number
    , curve: CurveType
    }