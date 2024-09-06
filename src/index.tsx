import { meta, addDeps, addFunc, addTestGen, asIsGen, gennode, inputReassigner } from "builder"

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
  asIsGen(meta.without(gn.deps))
).done()))
.done()

