import { render, screen } from "@testing-library/react"
import { App } from "./step3"

describe("App third version", () => {
  it("should render List One header", () => {
    const AppTest = App.testGen({})
    render(<AppTest />)
    expect(screen.getByText("List One")).toBeInTheDocument()
  })
  it("should render List Two header", () => {
    const AppTest = App.testGen({})
    render(<AppTest />)
    expect(screen.getByText("List Two")).toBeInTheDocument()
  })
  it("should render two similar lists", () => {
    const AppTest = App.testGen({
      listTestId: "test-list"
    })
    render(<AppTest />)
    expect(screen.queryAllByTestId("test-list")).toHaveLength(2)
  })
  it("should render items in list one", () => {
    const AppTest = App.testGen({
      list1: ["test"]
    })
    render(<AppTest />)
    expect(screen.getByText("test")).toBeInTheDocument()
  })
  it("should render items in list two", () => {
    const AppTest = App.testGen({
      list2: ["test"]
    })
    render(<AppTest />)
    expect(screen.getByText("test")).toBeInTheDocument()
  })
})
