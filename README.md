**WIP: The work is at an early stage**

***NOT A LIBRARY***

# Concept

This is an example project that demonstrates a method for implementing Dependency Injection (DI) in a React project
to support test-driven development and apply the principle of Inversion of Control (IoC).

Our approach has several significant differences from the standard way of implementing DI:
1. **Fixed Dependencies per Module:** 
In our approach, each module is instantiated with a single, fixed set of dependencies. 
We do not support injecting different dependencies into the same module in different contexts.
There are still other ways to make reusable objects, which we will discuss later.
2. **Local Definition of Dependencies:** Injected dependencies are explicitly declared near the module that uses them, typically within the same file.
3. **Module-Specific Test Generators:** Instead of using a global substitution mechanism, we suggest providing a test generator for each module that depends on injected dependencies.
The idea is that the test generator will use test generators of dependencies to create a test object.


# Dependency Injection Implementation

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

Now, we can use fakeGen to generate a fake object for testing.
```typescript
export const App = Object.assign(buildApp(deps), {
    testGen: (input: {
        greetings: Parameters<typeof deps["useGreetings"]["fakeGen"]>[0]
    }) => buildApp({
        useGreetings: deps.useGreetings.fakeGen(input.greetings)
    }),
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

While our approach assigns a fixed set of dependencies to each module, there are still ways to create reusable objects.

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

const testGen = (testId?: string) => buildListGen({
  ListComponent: ({ children }) => <div data-testid={testId}>{children}</div>
})

export const ListGen = Object.assign(buildListGen({
  ListComponent: ({ children }) => <ul>{children}</ul>,
}), {
  testGen, fakeGen: testGen
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
    ListGen: nest("listTestId", ListGen.fakeGen),
    ListItemComponent: fixed(deps.ListItemComponent)
  })
})
```

