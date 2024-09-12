import { render, screen } from "@testing-library/react"
import { ListGen } from "./gen"

describe('listGen', () => {
  it("should not render list given list is not loaded", () => {
    const ListTest = ListGen.testGen('list-test')({
      ListItemComponent: ({ item }) => null,
      useList: () => undefined
    })
    render(<ListTest />)
    expect(screen.queryByTestId('list-test')).toBeNull()
  })
  it("should render all list items", () => {
    const ListTest = ListGen({
      ListItemComponent: ({ item }) => <li>{item}</li>,
      useList: () => ['a-test', 'b-test', 'c-test']
    })
    render(<ListTest />)
    expect(screen.queryAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByText('a-test')).toBeInTheDocument()
    expect(screen.getByText('b-test')).toBeInTheDocument()
    expect(screen.getByText('c-test')).toBeInTheDocument()
  })
})
