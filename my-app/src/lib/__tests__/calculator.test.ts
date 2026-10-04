import { calculateManifest } from "../calculator";
test("quantity is included in declared value and returned flat fees are applied once per line", async () => {
  const request = jest.fn(async () => ({
    tariffTotal: 50,
    finalValue: 350,
    appliedFTA: null,
    appliedTariffs: [],
  }));
  const result = await calculateManifest(
    [{ id: 1, name: "Laptop", hsCode: "847130", unitValue: 100, quantity: 3 }],
    request,
  );
  expect(request).toHaveBeenCalledWith("847130", 300);
  expect(result).toMatchObject({
    declaredValue: 300,
    duties: 50,
    landedCost: 350,
  });
});
test("failed lines reject the entire estimate instead of showing an understated total", async () => {
  await expect(
    calculateManifest(
      [
        {
          id: 1,
          name: "Laptop",
          hsCode: "847130",
          unitValue: 100,
          quantity: 1,
        },
      ],
      async () => {
        throw new Error("Unavailable");
      },
    ),
  ).rejects.toThrow("Unavailable");
});
test("invalid quantities and values never reach the API", async () => {
  const request = jest.fn();
  await expect(
    calculateManifest(
      [{ id: 1, name: "Laptop", hsCode: "847130", unitValue: -1, quantity: 0 }],
      request,
    ),
  ).rejects.toThrow();
  expect(request).not.toHaveBeenCalled();
});
