import { render, screen } from "@testing-library/react";
import { App } from "./step1";

describe('Index', () => {
  it('should render hello world', () => {
    const AppTest = App.testGen({greetings: "Test Hello"});
    render(<AppTest />);
    expect(screen.getByText('Test Hello')).toBeInTheDocument();
  });
});

