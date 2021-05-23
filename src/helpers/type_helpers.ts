
type Equals<A, B> = _HalfEquals<A, B> extends true ? _HalfEquals<B, A> : false;

    type _HalfEquals<A, B> = (
        A extends unknown
            ? (
                B extends unknown
                    ? A extends B
                        ? B extends A
                            ? keyof A extends keyof B
                                ? keyof B extends keyof A
                                    ? A extends object
                                        ? _DeepHalfEquals<A, B, keyof A> extends true
                                            ? 1
                                            : never
                                        : 1
                                    : never
                                : never
                            : never
                        : never
                    : unknown
            ) extends never
                ? 0
                : never
            : unknown
    ) extends never
        ? true
        : false;

    type _DeepHalfEquals<A, B extends A, K extends keyof A> = (
        K extends unknown ? (Equals<A[K], B[K]> extends true ? never : 0) : unknown
    ) extends never
        ? true
        : false;

type OmitUntrue<T> = { [K in keyof T as T[K] extends true ? K : never]: T[K] }
type Endofunction<T> = (arg : T) => T;
type Indexed = { [param : string] : any }
type ReadonlyRecord<K extends number | string, V> = { readonly [key in K] : V }
type Immutable<Type> = { readonly [Key in keyof Type] : Immutable<Type[Key]> }
type Values<T> = T[keyof T]
type MouseHandler = (e : MouseEvent) => void

interface Indexable<T> { [param : string] : T }