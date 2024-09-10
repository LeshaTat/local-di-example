import { pick, field } from "../dict"
describe("dict pick and get field transforms", () => {
  it("should pick keys from a dict", () => {
   const deps = {
      a: "a",
      b: "b",
      c: "c",
    }
    expect(pick(deps, ["a", "b"])).toEqual({
      a: "a",
      b: "b",
    })
  })
  it("should transform a dict of objs to the dict with corresponding field values", () => {
    const deps = {
      a: {a: "a"},
      b: {b: "b"},
      c: {c: "c"},
    }
    expect(field("a")(pick(deps, ["a"]))).toEqual({
      a: "a",
    })
  })
})
