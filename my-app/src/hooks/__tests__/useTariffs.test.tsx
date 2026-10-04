import { renderHook, waitFor } from "../../test-utils/test-utils";
import { useTariffs } from "../useTariffs";
import { render } from "../../test-utils/test-utils";

describe("useTariffs", () => {
  it("should fetch tariff data successfully", async () => {
    const { result } = renderHook(() => useTariffs());

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify data structure
    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data).toHaveLength(2);

    // Verify data mapping
    const tariff = result.current.data![0];
    expect(tariff).toHaveProperty("tariff_id");
    expect(tariff).toHaveProperty("hsCode");
    expect(tariff).toHaveProperty("description");
    expect(tariff).toHaveProperty("exportingFrom");
    expect(tariff).toHaveProperty("importingTo");
    expect(tariff).toHaveProperty("type");
    expect(tariff).toHaveProperty("rate");
    expect(tariff).toHaveProperty("flatFee");
    expect(tariff).toHaveProperty("effectiveDate");
    expect(tariff).toHaveProperty("expirationDate");
  });

  it("should show loading indicator while fetching data", async () => {
    const { result } = renderHook(() => useTariffs());

    // Should be loading initially
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isPending).toBe(true);
  });

  it("should hide loading indicator after data loads", async () => {
    const { result } = renderHook(() => useTariffs());

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.data).toBeDefined();
  });

  it("should handle error states", async () => {
    // Mock error response
    const { server } = await import("../../mocks/server");
    server.use(
      require("msw").http.get("http://localhost:8080/all", () => {
        return require("msw").HttpResponse.error();
      }),
    );

    const { result } = renderHook(() => useTariffs());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it("should update data when refetch is called", async () => {
    const { result } = renderHook(() => useTariffs());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialData = result.current.data;

    // Trigger refetch
    await result.current.refetch();

    // Wait for refetch to complete
    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    // Data should still be available
    expect(result.current.data).toBeDefined();
  });
});
