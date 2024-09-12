import { UseQueryResult } from "react-query";
import { useNameQuery } from "./service/useNameQuery";
import { DictWithout, nest, reassign } from "./util/reassign";

const buildUseGreetings = ({useNameQuery}: {
  useNameQuery: () => UseQueryResult<string>
}) => 
function useGreetings() {
  const { data } = useNameQuery();
  return `Hello, ${data}!`
}

const deps = {
  useGreetings: Object.assign(buildUseGreetings({useNameQuery}), {
    testGen: reassign(buildUseGreetings, {
      useNameQuery: useNameQuery.fakeGen
    }),
    fakeGen: (greetings: string) => () => greetings
  })
}

const buildApp = ({useGreetings: useGreetings}: DictWithout<typeof deps, "fakeGen" | "testGen" | "deps">) =>
function App() {
  const greetings = useGreetings();
  return <div>{ greetings }</div>;
}

export const App = Object.assign(buildApp(deps), { 
  deps,
  testGen: reassign(buildApp, {
    useGreetings: nest("greetings", deps.useGreetings.fakeGen)
  })
})

