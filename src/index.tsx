import { DictWithout, field } from "./util/dict";
import { inputReassigner, nestGen } from "./util/reassign";

const deps = {
  useGreeting: Object.assign(() => "Hello World!" as string, {
    testGen: (greeting: string) => () => greeting
  })
}

const buildApp = ({useGreeting}: DictWithout<typeof deps, "testGen" | "deps">) =>
function App() {
  const greeting = useGreeting();
  return <div>{ greeting }</div>;
}

export const App = Object.assign(buildApp(deps), { 
  deps,
  testGen: inputReassigner(buildApp).add(
    nestGen(field("testGen")(deps))
  ).done()
})
