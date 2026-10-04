import { getBackendValueFromData } from "../testData";
test("a zero flat fee retains its tariff kind", () => {
  expect(getBackendValueFromData("Excise Duty", null, 0)).toBe("Flat Fee");
  expect(getBackendValueFromData("Excise Duty", 0, null)).toBe("Ad Valorem");
});
