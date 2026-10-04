import { renderHook, waitFor } from "../../test-utils/test-utils";
import { useProducts } from "../useProducts";

describe("useProducts", () => {
  it("should fetch product data successfully", async () => {
    const { result } = renderHook(() => useProducts("test-user"));

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

    // Verify data structure
    const product = result.current.data![0];
    expect(product).toHaveProperty("product_id");
    expect(product).toHaveProperty("name");
    expect(product).toHaveProperty("isPrivate");
    expect(product).toHaveProperty("userId");
    expect(product).toHaveProperty("hsCode");
  });

  it("should show loading indicator while fetching data", async () => {
    const { result } = renderHook(() => useProducts("test-user"));

    // Should be loading initially
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isPending).toBe(true);
  });

  it("should hide loading indicator after data loads", async () => {
    const { result } = renderHook(() => useProducts("test-user"));

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
      require("msw").http.get("http://localhost:8081/user/:userId", () => {
        return require("msw").HttpResponse.error();
      }),
    );

    const { result } = renderHook(() => useProducts("test-user"));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
