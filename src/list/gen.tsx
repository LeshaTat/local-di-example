const buildListGen = ({ ListComponent }: {
  ListComponent: React.FC<{ children: JSX.Element[] }>,
}) => <T,>({ useList, ListItemComponent }: {
  useList: () => T[] | undefined,
  ListItemComponent: React.FC<{ item: T }>
}) =>
function List() {
  const list = useList();
  if (!list) return null;
  return <ListComponent>
    {list.map((item, ind) => <ListItemComponent key={ind} item={item} />)!}
  </ListComponent>
}

export const ListGen = Object.assign(buildListGen({
  ListComponent: ({ children }) => <ul>{children}</ul>,
}), {
  testGen: (testId?: string) => buildListGen({
    ListComponent: ({ children }) => <div data-testid={testId}>{children}</div>
  })
})

