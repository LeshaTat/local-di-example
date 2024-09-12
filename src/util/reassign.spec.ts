import { DictWithout, nest, reassign } from "./reassign"

describe("reassign", () => {
  it("should reassign", () => {
    const deps = {
      a: "something",
      b: Object.assign({b: "value"}, {testGen: (input: {bTest: string}) => ({b: "testb-"+input.bTest})}),
      c: Object.assign({c: "value"}, {testGen: (input: {cTest: string}) => ({c: "testc-"+input.cTest})}),
    }
    const res = reassign((d: DictWithout<typeof deps, "testGen">) => d, {
      a: nest("aTest", (aTest: string) => "testa-"+aTest),
      b: deps.b.testGen,
      c: nest("c", deps.c.testGen),
    })
    expect(res({
      aTest: "aa",
      bTest: "bb",
      c: {cTest: "cc"}
    })).toEqual({
      a: "testa-aa",
      b: {b: "testb-bb"},
      c: {c: "testc-cc"}
    })
  })
})

