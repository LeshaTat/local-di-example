export const reassign = <D extends Record<string, any>, O, DG extends {
  [K in keyof D]: (input: any) => D[K]
}>(
  fn: (input: D) => O,
  gens: DG
) => 
(input: Parameters<DG[keyof D]>[0]): O => {
  return fn(Object.keys(gens).reduce((acc, key) => {
    acc[key] = gens[key](input)
    return acc
  }, {} as any))
}

export const fielded = <K extends string, I, O>(key: K, fn: (input: I) => O) => 
(input: Record<K, I>): O => fn(input[key])


export type OmitF<T extends Record<string, any>, K extends string> = T extends (...args: infer I) => infer O
? (...args: I) => O & Omit<T, K>
: Omit<T, K>

export type DictWithout<D extends Record<string, any>, WP extends string> = {
  [K in keyof D]: OmitF<D[K], WP>
}
