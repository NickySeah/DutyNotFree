import { http, HttpResponse } from "msw";

// Mock data
const mockTariffs = [
  {
    id: 1,
    hsCode: { code: "8517", description: "Telephone sets" },
    originCountry: { code: "US", name: "United States", alpha3: "USA" },
    destCountry: { code: "CA", name: "Canada", alpha3: "CAN" },
    tariffType: "Standard",
    standardRate: 5.5,
    flatFee: null,
    effectiveDate: "2024-01-01",
    expirationDate: null,
  },
  {
    id: 2,
    hsCode: { code: "6109", description: "T-shirts" },
    originCountry: { code: "US", name: "United States", alpha3: "USA" },
    destCountry: { code: "CA", name: "Canada", alpha3: "CAN" },
    tariffType: "Standard",
    standardRate: 8.2,
    flatFee: null,
    effectiveDate: "2024-01-01",
    expirationDate: null,
  },
];

const mockProducts = [
  {
    id: 1,
    name: "Smartphone",
    private: false,
    userId: "test-user",
    hsCode: { code: "8517", description: "Telephone sets" },
    value: 500,
    quantity: 1,
  },
  {
    id: 2,
    name: "T-Shirt",
    private: false,
    userId: "test-user",
    hsCode: { code: "6109", description: "T-shirts" },
    value: 25,
    quantity: 1,
  },
];

const mockCountries = [
  { code: "US", name: "United States", alpha3: "USA" },
  { code: "CA", name: "Canada", alpha3: "CAN" },
  { code: "MX", name: "Mexico", alpha3: "MEX" },
];

const mockHsCodes = [
  { code: "8517", description: "Telephone sets" },
  { code: "6109", description: "T-shirts" },
  { code: "8703", description: "Motor cars" },
];

export const handlers = [
  http.get("http://localhost:8080/wishlist", () => HttpResponse.json([])),
  http.get("*/api/v1/wishlists", () => HttpResponse.json([])),
  http.get("*/api/auth/token", () => HttpResponse.json({ token: null })),
  http.get("http://localhost:8081/user/:userId", () =>
    HttpResponse.json(mockProducts),
  ),
  http.get("*/api/auth/get-session", () => HttpResponse.json(null)),

  // Tariff service handlers
  http.get("http://localhost:8080/all", () => {
    return HttpResponse.json(mockTariffs);
  }),

  http.get("http://localhost:8080", ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const origin = url.searchParams.get("origin");
    const dest = url.searchParams.get("dest");
    const hsCode = url.searchParams.get("hsCode");
    const date = url.searchParams.get("date");

    // Filter tariffs based on query parameters
    const filteredTariffs = mockTariffs.filter(
      (tariff) =>
        tariff.originCountry.code === origin &&
        tariff.destCountry.code === dest &&
        tariff.hsCode.code === hsCode,
    );

    return HttpResponse.json(filteredTariffs);
  }),

  // Product service handlers
  http.get("http://localhost:8081/all", () => {
    return HttpResponse.json(mockProducts);
  }),

  // Countries service handlers
  http.get("http://localhost:8083/all", () => {
    return HttpResponse.json(mockCountries);
  }),

  // HS Code service handlers
  http.get("http://localhost:8082/all", () => {
    return HttpResponse.json(mockHsCodes);
  }),

  // Calculator service handlers
  http.get("http://localhost:8084", ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const value = parseFloat(url.searchParams.get("value") || "0");
    const origin = url.searchParams.get("origin");
    const dest = url.searchParams.get("dest");
    const hsCode = url.searchParams.get("hsCode");
    const date = url.searchParams.get("date");

    // Mock calculation logic
    const tariffRate = 5.5; // Default rate
    const calculatedValue = value * (1 + tariffRate / 100);

    return HttpResponse.json(calculatedValue);
  }),

  // Error handlers for testing
  http.get("http://localhost:8080/error", () => {
    return HttpResponse.error();
  }),

  http.get("http://localhost:8081/error", () => {
    return HttpResponse.error();
  }),

  http.get("http://localhost:8083/error", () => {
    return HttpResponse.error();
  }),

  http.get("http://localhost:8082/error", () => {
    return HttpResponse.error();
  }),

  http.get("http://localhost:8084/error", () => {
    return HttpResponse.error();
  }),
];
