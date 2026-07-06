import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

export default function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
