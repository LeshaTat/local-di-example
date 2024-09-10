import { render, screen } from "@testing-library/react";
import { App } from ".";

describe('Index', () => {
  it('should render hello world', () => {
    const AppTest = App.testGen({useGreeting: "Test Hello"});
    render(<AppTest />);
    expect(screen.getByText('Test Hello')).toBeInTheDocument();
  });
});

