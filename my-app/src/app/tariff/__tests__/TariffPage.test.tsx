import React from "react";
import { render, screen, fireEvent } from "@/test-utils/test-utils";
import TariffPage from "../page";
import { server } from "@/mocks/server";
import { http, HttpResponse } from "msw";
jest.mock("@/hooks/useWishlistData", () => ({
  useWishlistData: () => ({
    wishlistTariffs: [],
    wishlistItems: [],
    isLoading: false,
  }),
}));
test("loads the explorer and renders real tariff records", async () => {
  render(<TariffPage />);
  expect(
    screen.getByRole("heading", { name: "Tariff explorer" }),
  ).toBeInTheDocument();
  expect(await screen.findByText("Telephone sets")).toBeInTheDocument();
  expect(screen.getByText("T-shirts")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Define New Tariff" }),
  ).not.toBeInTheDocument();
});
test("switches to the user watchlist and shows its empty state", async () => {
  render(<TariffPage />);
  await screen.findByText("Telephone sets");
  fireEvent.mouseDown(screen.getByRole("tab", { name: /watchlist/i }));
  fireEvent.click(screen.getByRole("tab", { name: /watchlist/i }));
  expect(await screen.findByText("No results.")).toBeInTheDocument();
});
test("shows service errors and retries the query", async () => {
  server.use(http.get("http://localhost:8080/all", () => HttpResponse.error()));
  render(<TariffPage />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Could not load your data",
  );
  server.resetHandlers();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(await screen.findByText("Telephone sets")).toBeInTheDocument();
});
