export const dictFuncToFuncDict = (fn: (input: any, dep: any, n: string) => any) => (dict: Record<string, any>) =>
(input: any) => {
  return Object.keys(dict).reduce((acc, key) => {
    acc[key] = fn(input, dict[key], key)
    return acc
  }, {} as any)
}

export const flatGen: <Deps extends Record<string, (input: any) => any>> (deps: Deps) => (
  input: Parameters<Deps[keyof Deps]>[0]
) => {
  [K in keyof Deps]: ReturnType<Deps[K]>
} 
= dictFuncToFuncDict((input, dep, n) => dep(input))

export const nestGen: <Deps extends Record<string, (input: any) => any>> (deps: Deps) => (
  input: {[K in keyof Deps]: Parameters<Deps[K]>[0]}
) => {
  [K in keyof Deps]: ReturnType<Deps[K]>
}
= dictFuncToFuncDict((input, dep, n) => dep(input[n]))

export const asIsGen: <Deps extends Record<string, any>> (deps: Deps) => (
  input: {[K in keyof Deps]: Deps[K]}
) => {[K in keyof Deps]: Deps[K]}
= dictFuncToFuncDict((input, dep, n) => input[n])

export interface InputReassigner<I extends Record<string, any>, R, O = {}, Done extends keyof I = never> {
  add<K extends keyof Omit<I, Done>, O2>(gen: (opts: O2) => Pick<I, K>): InputReassigner<I, R, O & O2, Done | K> 
  done(): keyof I extends Done ? (input: O) => R : never
}

export function inputReassigner<I extends Record<string, any>, R = I>(fn: (input: I) => R): InputReassigner<I, R> {
  let build: (input: any) => any = () => ({})
  const done: any = () => (input: any) => fn(build(input))
  const add = <K extends keyof I, O>(gen: (opts: O) => Pick<I, K>) => {
    const buildPrev = build
    build = (input) => ({
      ...buildPrev(input),
      ...gen(input),
    })
    return { add, done }
  }
  return { add, done }
}
