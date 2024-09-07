import { meta, withArgs, addBuild, asIsGen, gennode, inputReassigner, addBuildDeps, build, addBuildWithDeps, add, WithoutMeta } from "builder"

export const App = gennode.builder()
.next(gn => addBuildDeps({
  useGreeting: gennode.builder()
  .done(gn => () => "Hello World!" as string)
}))
.next(gn => addBuild(withArgs(meta.without(gn.deps))(({useGreeting}) => 
  function App() {
    const greeting = useGreeting();
    return <div>{ greeting }</div>;
  }
)))
.next(gn => add("testGen")(inputReassigner(gn.build).add(
  asIsGen(meta.without(gn.deps))
).done()))
.done(gn => build(gn))

