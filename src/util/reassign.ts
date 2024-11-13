type PickNullable<T> = {
  [P in keyof T as undefined extends T[P] ? P : never]: T[P]
}

type PickNotNullable<T> = {
  [P in keyof T as undefined extends T[P] ? never : P]: T[P]
}

type OptionalNullable<T> = {
  [K in keyof PickNullable<T>]?: Exclude<T[K], undefined>
} & {
  [K in keyof PickNotNullable<T>]: T[K]
}

type UnionToIntersection<U> = 
  (U extends any ? (x: U)=>void : never) extends ((x: infer I)=>void) ? I : never

export const reassign = <D extends Record<string, any>, O, DG extends {
  [K in keyof D]: (input: any) => D[K]
}>(
  fn: (input: D) => O,
  gens: DG
) => 
(input: OptionalNullable<UnionToIntersection<Parameters<DG[keyof D]>[0]>>): O => {
  return fn(Object.keys(gens).reduce((acc, key) => {
    acc[key] = gens[key](input)
    return acc
  }, {} as any))
}

export const nest = <K extends string, I, O>(key: K, fn: (input: I) => O) => 
(input: Record<K, I>): O => fn(input[key])

export const fixed = <O>(obj: O) => (n: {}) => obj

export type OmitF<T extends Record<string, any>, K extends string> = T extends (...args: infer I) => infer O
? (...args: I) => O & Omit<T, K>
: Omit<T, K>

export type DictWithout<D extends Record<string, any>, WP extends string> = {
  [K in keyof D]: OmitF<D[K], WP>
}
