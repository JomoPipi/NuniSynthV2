






const KEYSTRING = [...'1234567890-=qwertyuiop[]asdfghjkl;\'zxcvbnm,./'] as const
export const KB_KEYS = 
    KEYSTRING.reduce((a, key, i) => ((a as any)[key] = i, a)
    , {} as ReadonlyRecord<string,number>)
Object.seal(KB_KEYS)