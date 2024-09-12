import { UseQueryResult } from "react-query";
import { useNameQuery } from "./service/useNameQuery";
import { nest, reassign } from "./util/reassign";

const buildApp = ({useGreetings}: {
  useGreetings: () => string
}) =>
function App() {
  const greetings = useGreetings();
  return <div>{ greetings }</div>;
}

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

export const App = Object.assign(buildApp(deps), { 
  deps,
  testGen: reassign(buildApp, {
    useGreetings: nest("greetings", deps.useGreetings.fakeGen)
  })
})

