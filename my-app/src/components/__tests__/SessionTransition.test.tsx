import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import { Providers } from "../providers";
let mockSession: { data: { user: { id: string } } | null; isPending: boolean } =
  { data: null, isPending: true };
jest.mock("@/lib/auth-client", () => ({ useSession: () => mockSession }));
function Consumer() {
  const client = useQueryClient();
  return (
    <>
      <h1>Trade workspace</h1>
      <button onClick={() => client.setQueryData(["private-record"], "secret")}>
        Seed query
      </button>
      <button
        onClick={() => {
          document.querySelector("#result")!.textContent = String(
            client.getQueryData(["private-record"]) ?? "empty",
          );
        }}
      >
        Read cache
      </button>
      <span id="result" />
    </>
  );
}
test("session discovery keeps children mounted, and switching identities clears private queries", () => {
  const { rerender } = render(
    <Providers>
      <Consumer />
    </Providers>,
  );
  expect(screen.getByRole("heading")).toHaveTextContent("Trade workspace");
  mockSession = { data: { user: { id: "alice" } }, isPending: false };
  rerender(
    <Providers>
      <Consumer />
    </Providers>,
  );
  fireEvent.click(screen.getByText("Seed query"));
  fireEvent.click(screen.getByText("Read cache"));
  expect(screen.getByText("secret")).toBeInTheDocument();
  mockSession = { data: { user: { id: "bob" } }, isPending: false };
  rerender(
    <Providers>
      <Consumer />
    </Providers>,
  );
  fireEvent.click(screen.getByText("Read cache"));
  expect(screen.getByText("empty")).toBeInTheDocument();
});
