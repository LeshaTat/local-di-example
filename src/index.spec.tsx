import { render, screen } from "@testing-library/react";
import { App } from ".";
import { gennode } from "builder";

describe('Index', () => {
  it('should render hello world', () => {
    const AppTest = gennode.get(App).testGen({useGreeting: () => "Test Hello"});
    render(<AppTest />);
    expect(screen.getByText('Test Hello')).toBeInTheDocument();
  });
});

