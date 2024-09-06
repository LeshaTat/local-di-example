import { addDeps, addFunc, addTestGen, gennode, inputReassigner, objReassign } from "builder"

export const App = gennode.builder()
.next(gn => addDeps(gn, {
  useGreeting: gennode.builder()
  .next(gn => addFunc(gn, () => () => "Hello World!"))
  .done()
}))
.next(gn => addFunc(gn, ({useGreeting}) => 
  function App() {
    const greeting = useGreeting();
    return <div>{ greeting }</div>;
  }
))
.next(gn => addTestGen(gn, inputReassigner(gn.build).add(
  objReassign(gn.deps, ["useGreeting"])
).done()))
.done()

