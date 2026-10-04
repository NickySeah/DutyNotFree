import React from "react";
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from "@/test-utils/test-utils";
import userEvent from "@testing-library/user-event";
import { DataTable } from "../data-table";
import { createColumns } from "../columns";
import type { TradeRate } from "@/types/trade";
const columns = createColumns(
  jest.fn(),
  jest.fn(),
  jest.fn(),
  jest.fn(),
  new Set(),
  false,
  false,
);
const record: TradeRate = {
  tariff_id: 1,
  hsCode: "8517",
  description: "Telephone sets",
  exportingFrom: "United States",
  importingTo: "Canada",
  exportingFromCode: "840",
  importingToCode: "124",
  type: "MFN",
  rate: 5.5,
  flatFee: 0,
  effectiveDate: new Date("2024-01-01"),
  expirationDate: null,
};
const data = [
  record,
  {
    ...record,
    tariff_id: 2,
    description: "T-shirts",
    hsCode: "6109",
    rate: 8.2,
  },
];
test("renders records and an honest empty state", () => {
  const { rerender } = render(<DataTable columns={columns} data={data} />);
  expect(screen.getByText("Telephone sets")).toBeInTheDocument();
  expect(screen.getByText("5.5%")).toBeInTheDocument();
  rerender(<DataTable columns={columns} data={[]} />);
  expect(screen.getByText("No results.")).toBeInTheDocument();
});
test("searches HS codes and clears filters", () => {
  render(<DataTable columns={columns} data={data} />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "6109" } });
  expect(screen.queryByText("Telephone sets")).not.toBeInTheDocument();
  expect(screen.getByText("T-shirts")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
  expect(screen.getByText("Telephone sets")).toBeInTheDocument();
});
test("paginates a longer dataset", async () => {
  render(
    <DataTable
      columns={columns}
      data={Array.from({ length: 12 }, (_, i) => ({
        ...record,
        tariff_id: i + 1,
        description: `Product ${i + 1}`,
      }))}
    />,
  );
  expect(screen.queryByText("Product 11")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
  await screen.findByText("Product 11");
  expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
});
test("sorts descriptions through the accessible column menu", async () => {
  render(<DataTable columns={columns} data={data} />);
  await userEvent.click(screen.getByRole("button", { name: "Description" }));
  await userEvent.click(screen.getByRole("menuitem", { name: "Asc" }));
  await waitFor(() =>
    expect(
      within(screen.getAllByRole("row")[1]).getByText("T-shirts"),
    ).toBeInTheDocument(),
  );
});
test("zero flat fees retain dollar units in the explorer", () => {
  render(
    <DataTable
      columns={columns}
      data={[{ ...record, type: "Excise Duty", rate: null, flatFee: 0 }]}
    />,
  );
  expect(screen.getByText("$0")).toBeInTheDocument();
  expect(screen.queryByText("null%")).not.toBeInTheDocument();
});
