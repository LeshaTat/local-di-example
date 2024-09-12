import { nest, reassign } from "./util/reassign";

const buildApp = ({useGreetings}: {
  useGreetings: () => string
}) =>
function App() {
  const greetings = useGreetings();
  return <div>{ greetings }</div>;
}

const deps = {
  useGreetings: Object.assign(() => "Hello World!" as string, {
    fakeGen: (greetings: string) => () => greetings
  })
}

export const App = Object.assign(buildApp(deps), { 
  deps,
  testGen: reassign(buildApp, {
    useGreetings: nest("greetings", deps.useGreetings.fakeGen)
  })
})

