/**
 * Test utilities and helpers
 */
/* eslint-disable react-refresh/only-export-components */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { BrowserRouter } from "react-router-dom";

/**
 * Custom render function that includes all providers
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render, screen };
