export function pick<
  D extends Record<string, any>, 
  const K extends keyof D
>(deps: D, keys: K[]): Pick<D, K> {
  return keys.reduce((acc: any, key: any) => {
    acc[key] = deps[key]
    return acc
  }, {} as any)
}

export const field = <K extends string>(key: K) => <D extends Record<string, Record<K, any>>>(deps: D): {
  [KK in keyof D]: D[KK][K]
} => {
  return Object.keys(deps).reduce((acc, k) => {
    acc[k] = deps[k][key]
    return acc
  }, {} as any)
}

export type OmitF<T extends Record<string, any>, K extends string> = T extends (...args: infer I) => infer O
? (...args: I) => O & Omit<T, K>
: Omit<T, K>

export type DictWithout<D extends Record<string, any>, WP extends string> = {
  [K in keyof D]: OmitF<D[K], WP>
}
