import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@/test-utils/test-utils";
import TariffCalculator from "../page";
import { calculatorService } from "@/lib/axios";
jest.mock("@/hooks/useCountry", () => ({
  useCountries: () => ({
    data: [
      { code: "702", name: "Singapore" },
      { code: "840", name: "United States" },
    ],
    isPending: false,
    isError: false,
  }),
}));
jest.mock("@/hooks/useProducts", () => ({
  useProducts: () => ({
    data: [{ product_id: 1, name: "Laptop", hsCode: "847130" }],
    isPending: false,
    isError: false,
  }),
}));
const response = {
  tariffTotal: 20,
  finalValue: 220,
  appliedFTA: null,
  appliedTariffs: [],
};
function shipment() {
  render(<TariffCalculator />);
  fireEvent.change(screen.getByLabelText("Origin country"), {
    target: { value: "702" },
  });
  fireEvent.change(screen.getByLabelText("Destination country"), {
    target: { value: "840" },
  });
  fireEvent.change(screen.getByLabelText("Select product to add"), {
    target: { value: "1" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Add product" }));
  fireEvent.change(screen.getByLabelText("Unit value (USD)"), {
    target: { value: "100" },
  });
  fireEvent.change(screen.getByLabelText("Quantity"), {
    target: { value: "2" },
  });
}
afterEach(() => jest.restoreAllMocks());
test("submits declared line value, renders totals, and clears the estimate after edits", async () => {
  const request = jest
    .spyOn(calculatorService, "get")
    .mockResolvedValue({ data: response });
  shipment();
  fireEvent.click(screen.getByRole("button", { name: "Calculate duties" }));
  await screen.findByText("$220.00");
  expect(request).toHaveBeenCalledWith(
    "",
    expect.objectContaining({
      params: expect.objectContaining({
        value: 200,
        origin: "702",
        dest: "840",
        hsCode: "847130",
      }),
    }),
  );
  fireEvent.change(screen.getByLabelText("Quantity"), {
    target: { value: "3" },
  });
  expect(screen.queryByText("$220.00")).not.toBeInTheDocument();
  expect(
    screen.queryByText("Applied rules, product by product"),
  ).not.toBeInTheDocument();
});
test("rejects a stale result after the route changes while a request is pending", async () => {
  let resolve!: (value: { data: typeof response }) => void;
  jest.spyOn(calculatorService, "get").mockImplementation(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  shipment();
  fireEvent.click(screen.getByRole("button", { name: "Calculate duties" }));
  await waitFor(() => expect(resolve).toBeDefined());
  fireEvent.click(
    screen.getByRole("button", { name: "Swap origin and destination" }),
  );
  await act(async () => resolve({ data: response }));
  expect(screen.queryByText("$220.00")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Origin country")).toHaveValue("840");
});
test("invalid quantities never reach the service", async () => {
  const request = jest.spyOn(calculatorService, "get");
  shipment();
  fireEvent.change(screen.getByLabelText("Quantity"), {
    target: { value: "0" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Calculate duties" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("whole quantity");
  expect(request).not.toHaveBeenCalled();
});
test("service failures show a retryable error and no partial estimate", async () => {
  jest
    .spyOn(calculatorService, "get")
    .mockRejectedValue(new Error("Service unavailable"));
  shipment();
  fireEvent.click(screen.getByRole("button", { name: "Calculate duties" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Service unavailable",
  );
  expect(
    screen.queryByText("Applied rules, product by product"),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Calculate duties" }),
  ).toBeEnabled();
});
test("removing the last line disables calculation", () => {
  shipment();
  fireEvent.click(screen.getByRole("button", { name: "Remove Laptop" }));
  expect(
    screen.getByRole("button", { name: "Calculate duties" }),
  ).toBeDisabled();
  expect(screen.getByText("What are you shipping?")).toBeInTheDocument();
});
