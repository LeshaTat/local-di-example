import { render, renderHook, screen, waitFor } from "@testing-library/react";
import { App } from "./step2";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactNode } from "react";

const queryClient = new QueryClient()
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('Index', () => {
  describe('useGreetings', () => {
    it('should greet with fetched name', async () => {
      const useGreetingsTest = App.deps.useGreetings.testGen({
        requestName: async () => "Test Name"
      })
      const {result} = renderHook(useGreetingsTest, {wrapper})
      await waitFor(() => expect(result.current).toBe("Hello, Test Name!"))
    })
  })
  describe('App', () => {
    it('should render greeting', () => {
      const AppTest = App.testGen({greetings: "Test Hello"});
      render(<AppTest />);
      expect(screen.getByText('Test Hello')).toBeInTheDocument();
    });
  });
});

