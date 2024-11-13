import { fixed, nest, reassign } from "./util/reassign";
import { ListGen, ListGenInterface } from "./list/gen";

const buildApp = ({useListOne, useListTwo, ListGen, ListItemComponent}: {
  useListOne: () => string[],
  useListTwo: () => string[],
  ListGen: ListGenInterface,
  ListItemComponent: React.FC<{ item: string }>
}) => {
  const ListAppOne = ListGen({
    useList: useListOne,
    ListItemComponent
  })
  const ListAppTwo = ListGen({
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
  ListGen,
  ListItemComponent: ({ item }: { item: string }) => <p>{item}</p>
}
const useListFakeGen = (list?: string[]) => () => list || []

export const App = Object.assign(buildApp(deps), { 
  deps,
  testGen: reassign(buildApp, {
    useListOne: nest("list1", useListFakeGen),
    useListTwo: nest("list2", useListFakeGen),
    ListGen: nest("listTestId", ListGen.fakeGen),
    ListItemComponent: fixed(deps.ListItemComponent)
  })
})

