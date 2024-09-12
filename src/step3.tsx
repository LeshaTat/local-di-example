import { DictWithout, nest, reassign } from "./util/reassign";
import { ListGen } from "./list/gen";

const buildApp = ({useListOne, useListTwo, ListGenString, ListItemComponent}: DictWithout<{
  useListOne: () => string[],
  useListTwo: () => string[],
  ListGenString: typeof ListGen<string>,
  ListItemComponent: React.FC<{ item: string }>
}, "testGen">) => {
  const ListAppOne = ListGenString({
    useList: useListOne,
    ListItemComponent
  })
  const ListAppTwo = ListGenString({
    useList: useListTwo,
    ListItemComponent
  })
  return function App() {
    return <>
      <h1>List One</h1>
      <ListAppOne />
      <h1>List Two</h1>
      <ListAppTwo />
    </>
  }
}

const deps = {
  useListOne: () => ["first", "second", "last"],
  useListTwo: () => ["uno", "dos", "tres"],
  ListGenString: ListGen<string>,
  ListItemComponent: ({ item }: { item: string }) => <p>{item}</p>
}
const useListFakeGen = (list?: string[]) => () => list || []

export const App = Object.assign(buildApp(deps), { 
  deps,
  testGen: reassign(buildApp, {
    useListOne: nest("list1", useListFakeGen),
    useListTwo: nest("list2", useListFakeGen),
    ListGenString: nest("listTestId", ListGen.testGen),
    ListItemComponent: () => deps.ListItemComponent
  })
})

