**WIP: The work is at an early stage**

***NOT A LIBRARY***

This code is intended to be a starting point for adding a DI structure to a project. 
Fill free to copy the utility code and modify it later to suit your project's specific needs. 
Our intention is to provide the simplest possible code to start with.

# Concept

We encourage use of TDD and DI as a ways to organize both the coding process and the code itself. 
However, we do not want to introduce any unnecessary complexity to the project.

Our approach is to propose a simple starting point that is easily integrated in any project without any overhead.

In the real project, one can use several such schemes simultaneously.
This is feasible, assuming that each of them is small and simple enough to be easily understood and maintained.
This is a main point in our approach, which contrasts with universal, library-based DI solutions.
You do not need to commit to a single library or a single approach.

# Dependency Injection

The core of the approach is straightforward. 
Instead of defining the object itself, one defines a building procedure that generates an object from its dependencies. The main point is a freedom to work with dependencies, which includes:
* You know exactly what the dependencies are, including their types and additional information.
* You can easily replace a dependency with a mock object for testing purposes.

Note: the first item is what differentiates DI from the service locator pattern, where there is no explicit declaration of dependencies in the code.

## Base Scheme

Again, we do not propose any library methods - just a simple way to organize the code.

First, explicitly add dependencies in the file where you construct your object. 
```typescript
const deps = {
  useGreeting: () => "Hello World!"
}
```

Then, define a function that constructs the object using these dependencies.
```typescript
const buildApp = ({useGreeting}: typeof deps) =>
function App() {
  const greeting = useGreeting()
  return <div>{ greeting }</div>
}
```

Finally, export the object.
```typescript
export const App = buildApp(deps)
```

## Add Meta for Testing

Here, we do not export the buildApp function directly. Instead, we recommend adding metadata to the App function itself.
We attach buildApp under the name testGen as metadata to make it clear that this function is intended for testing purposes.

```typescript
export const App = Object.assign(buildApp(deps), {
    testGen: buildApp
})
```

Now, in the test file, you can easily replace the dependency with a stub object.
```typescript
const TestApp = App.testGen({
  useGreeting: () => "Hello Test!"
})
```

## Simplifying Test Generation

It's a good idea to provide a fake generator as metadata for the object that is intended to be used as a dependency.
```typescript
const useGreeting = Object.assign(() => "Hello World!" as string, {
    fakeGen: (greeting: string) => () => greeting
})
```

In this case, we can create a simplified test generator for the component.
```typescript
export const App = Object.assign(buildApp(deps), {
    testGen: (input: {useGreeting: Parameters<typeof deps["useGreetings"]["fakeGen"]>[0]}) => buildApp({useGreetings: input.useGreeting}),
})
```

Here's how this looks using a simple utililty function, which you can find in the code of this example project.

```typescript
export const App = Object.assign(buildApp(deps), {
    testGen: reassign(buildApp, {
        useGreeting: nest("useGreeting", deps.useGreeting.fakeGen)
    }),
})
```

In a real project, you may want to further minimize the code, for example, by reducing mentions of dependency keys (e.g., "useGreeting"), or even adding a mass generation of such functions. However, each of this tooling will increase the complexity of a declaration and make it less explicit. So, we leave this decision up to you.

# Other Injecting Methods

We recommend using different methods for injecting dependencies in different cases.

The method described above is good for top-level components as it is simple and explicit.
For deeper components, we recommend using React Context.
This way, you can avoid writing a builder for each small component.

The use of React Context for dependency injection is not in the scope of this example project.
