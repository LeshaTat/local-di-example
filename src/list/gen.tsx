export type ListGenInterface = <T,>({ useList, ListItemComponent }: {
  useList: () => T[] | undefined,
  ListItemComponent: React.FC<{ item: T }>
}) => React.FC<{}>

const buildListGen = ({ ListComponent }: {
  ListComponent: React.FC<{ children: JSX.Element[] }>,
}): ListGenInterface => ({ useList, ListItemComponent }) =>
function List() {
  const list = useList();
  if (!list) return null;
  return <ListComponent>
    {list.map((item, ind) => <ListItemComponent key={ind} item={item} />)!}
  </ListComponent>
}

const testGen = (testId?: string) => buildListGen({
  ListComponent: ({ children }) => <div data-testid={testId}>{children}</div>
})

export const ListGen = Object.assign(buildListGen({
  ListComponent: ({ children }) => <ul>{children}</ul>,
}), {
  testGen, fakeGen: testGen
})

