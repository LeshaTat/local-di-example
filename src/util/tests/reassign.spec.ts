import { asIsGen, flatGen, nestGen } from "../reassign"
describe('reassig function input utils', () => {
  it('should transform dict of funcs to a func on a flatted dict of corresponding inputs', () => {
    const reassign = flatGen({
      b: (input: {bTest: string}) => ({b: "testb-"+input.bTest}),
      c: (input: {cTest: string}) => ({c: "testc-"+input.cTest}),
    })
    expect(reassign({bTest: "bb", cTest: "cc"})).toEqual({
      b: {b: "testb-bb"},
      c: {c: "testc-cc"}
    })
  })
  it('should transform a dict of funcs to a func on the dict of corresponding inputs', () => {
    const reassign = nestGen({
      b: (input: {bTest: string}) => ({b: "testb-"+input.bTest}),
      c: (input: {cTest: string}) => ({c: "testc-"+input.cTest}),
    })
    expect(reassign({b: {bTest: "bb"}, c: {cTest: "cc"}})).toEqual({
      b: {b: "testb-bb"},
      c: {c: "testc-cc"}
    })
  })
  it('should transofrm a dict of objs to a an identity func on such dicts', () => {
    const reassign = asIsGen({
      a: {something: "sdf"},
      b: {b: "value"},
    })
    expect(reassign({a: {something: "aa"}, b: {b: "bb"}})).toEqual({
      a: {something: "aa"},
      b: {b: "bb"}
    })
  })
})
