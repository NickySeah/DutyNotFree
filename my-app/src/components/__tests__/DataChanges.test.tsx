import { calculateManifest } from "@/lib/calculator";
const line = {
  id: 1,
  name: "Laptop",
  hsCode: "847130",
  quantity: 2,
  unitValue: 100,
};
test("changing manifest quantities produces a fresh service request and total", async () => {
  const request = jest.fn(async (_hs: string, value: number) => ({
    tariffTotal: value * 0.1,
    finalValue: value * 1.1,
    appliedFTA: null,
    appliedTariffs: [],
  }));
  const first = await calculateManifest([line], request);
  const second = await calculateManifest([{ ...line, quantity: 3 }], request);
  expect(first.landedCost).toBeCloseTo(220);
  expect(second.landedCost).toBeCloseTo(330);
  expect(request.mock.calls.map((call) => call[1])).toEqual([200, 300]);
});
test("an invalid service result is rejected instead of displayed", async () => {
  await expect(
    calculateManifest([line], async () => ({
      tariffTotal: NaN,
      finalValue: 200,
      appliedFTA: null,
      appliedTariffs: [],
    })),
  ).rejects.toThrow("invalid estimate");
});
