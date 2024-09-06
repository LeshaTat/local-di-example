import { render, screen } from "@testing-library/react";
import { App } from ".";
import { testgen } from "builder";

describe('Index', () => {
  it('should render hello world', () => {
    const AppTest = testgen.get(App)({useGreeting: () => "Test Hello"});
    render(<AppTest />);
    expect(screen.getByText('Test Hello')).toBeInTheDocument();
  });
});

