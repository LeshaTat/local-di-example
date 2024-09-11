import { DictWithout, nest, reassign } from "./util/reassign";

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
  testGen: reassign(buildApp, {
    useGreeting: nest("useGreeting", deps.useGreeting.testGen)
  })
})

