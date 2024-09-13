**WIP: The work is at an early stage**

***NOT A LIBRARY***

# Concept
We encourage the use of TDD (Test-Driven Development) and IoC (Inversion of Control) as methods to organize both the coding process and the structure of the code.

We suggest using multiple DI patterns or other techniques within the same project.
This is feasible, assuming each pattern or mechanism is sufficiently simple.

In this project, we present one such method for implementing DI.

# Dependency Injection

The core of DI is to add an explicit boundary between modules and their dependencies.
The main point is a freedom to work with dependencies, which includes:
* Full visibility of what the dependencies are, including their types and any additional details.
* The ability to easily replace a dependency with a mock object for testing purposes.

We suggest the following straightforward method to implement the separation of concerns: declare a function that generates modules, such as React components or hooks, based on their dependencies.

## Basic scheme

First, define a function that constructs the object.

```typescript
const buildApp = ({useGreetings}: {
    useGreetings: () => string
}) =>
function App() {
  const greetings = useGreetings()
  return <div>{ greetings }</div>
}
```

Then, explicitly add dependencies. 
```typescript
const deps = {
  useGreetings: () => "Hello World!"
}
```

Finally, export the object.
```typescript
export const App = buildApp(deps)
```

## Add Meta for Testing

We can attach buildApp function to the App component under the name testGen as metadata to make it clear that this function is intended for testing purposes.

```typescript
export const App = Object.assign(buildApp(deps), {
    testGen: buildApp
})
```

Now, in the test file, one can easily replace the dependency with a stub object.
```typescript
const TestApp = App.testGen({
    useGreetings: () => "Hello Test!"
})
```

## Simplifying Test Generation

It's a good idea to provide a fake generator as metadata for the object that is intended to be used as a dependency.
```typescript
const useGreetings = Object.assign(() => "Hello World!" as string, {
    fakeGen: (greetings: string) => () => greetings
})
```

In this case, we can create a somewhat simplified test generator for the component.
```typescript
export const App = Object.assign(buildApp(deps), {
    testGen: (input: {greetings: Parameters<typeof deps["useGreetings"]["fakeGen"]>[0]}) => buildApp({useGreetings: deps.useGreetings.fakeGen(input.greetings)}),
})
```

Here's how this looks using an utililty function, which you can find in the code of this example project.

```typescript
export const App = Object.assign(buildApp(deps), {
    testGen: reassign(buildApp, {
        useGreetings: nest("greetings", deps.useGreetings.fakeGen)
    }),
})
```

In a real project, one may want to further minimize the code, for example, by reducing mentions of dependency keys (e.g., "useGreetings"), or even adding a mass generation of such functions. However, each of this tooling will increase the complexity of a declaration and make it less explicit.

Now we can enjoy the simplified constructor for tests.

```typescript
const TestApp = App.testGen({
  greetings: "Hello Test!"
})
```

## Other Injecting Methods

The method described above is good for top-level components as it is simple and explicit.
For deeper components, we suggest using other methods, such as using React Context.

# Code Structure

## Composing Dependencies

Let's look at a more complex example. Suppose we need to load the user's name to display the greetings.

```typescript
const buildUseNameQuery = ({requestName}: { 
    requestName: () => Promise<string> 
}) =>
function useNameQuery() { return useQuery("name", requestName) }

export const useNameQuery = Object.assign(buildUseNameQuery({
  requestName: async () => "John Doe"
}), {
  fakeGen: buildUseNameQuery
})
```

Here is how one can declare useGreetings with the useNameQuery dependency. 

```typescript
const buildUseGreetings = ({useNameQuery}: {
  useNameQuery: () => UseQueryResult<string>
}) =>
function useGreetings() {
  const {data} = useNameQuery()
  return `Hello ${data}!`
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
```

Now, it is easy to add tests for the useGreetings hook by addressing it through App.deps.useGreetings.

```typescript
it('should greet with fetched name', async () => {
    const useGreetingsTest = App.deps.useGreetings.testGen({
        requestName: async () => "Test Name"
    })
    const {result} = renderHook(useGreetingsTest, {wrapper})
    await waitFor(() => expect(result.current).toBe("Hello, Test Name!"))
})
```

## Making Reusable Objects

Although builder functions are functions and could be reused with different dependencies, we do not encourage using them in this way.

Instead, to create a steam prototype that will be branched into different objects, we suggest defining an explicit function - a generator - that will create these branched objects.

A generator can itself be treated as a module of the system and be subject to our DI approach.

Let's consider an example.

Suppose we want to create a list component that can be used with different data sources.

```typescript
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

export const ListGen = Object.assign(buildListGen({
  ListComponent: ({ children }) => <ul>{children}</ul>,
}), {
  testGen: (testId?: string) => buildListGen({
    ListComponent: ({ children }) => <div data-testid={testId}>{children}</div>
  })
})
```

In this case, the list generator itself becomes a dependency for the App component.

```typescript
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
    ListGen: nest("listTestId", ListGen.testGen),
    ListItemComponent: () => deps.ListItemComponent
  })
})
```

