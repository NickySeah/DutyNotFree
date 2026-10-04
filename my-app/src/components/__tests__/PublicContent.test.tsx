import { render, screen } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import MainContent from "../mainContentWrapper";

jest.mock("@/lib/checkRole", () => ({
  useUserRole: () => ({ isPending: true, isAuthenticated: false }),
}));
jest.mock("@/lib/auth-client", () => ({ useSession: () => ({ data: null, isPending: true }) }));

function PublicContent() {
  useQuery({ queryKey: ["public"], queryFn: async () => [], enabled: false });
  return <h1>Estimate your import costs</h1>;
}

test("public content remains visible while the session loads and queries have a provider", () => {
  render(<MainContent><PublicContent /></MainContent>);
  expect(screen.getByRole("heading", { name: "Estimate your import costs" })).toBeInTheDocument();
});
