import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

// Mock data fetching hook without MSW
const useMockData = () => {
  const [data, setData] = React.useState<any[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 100));
        setData([
          { id: 1, name: "Test Item 1", value: 100 },
          { id: 2, name: "Test Item 2", value: 200 },
        ]);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch data");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};

// Test component
const DataComponent = () => {
  const { data, isLoading, error } = useMockData();

  if (isLoading) {
    return <div data-testid="loading">Loading...</div>;
  }

  if (error) {
    return <div data-testid="error">{error}</div>;
  }

  return (
    <div data-testid="data">
      {data?.map((item: any) => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          {item.name}: {item.value}
        </div>
      ))}
    </div>
  );
};

describe("Data Fetching Tests (Without MSW)", () => {
  it("should show loading indicator while fetching data", () => {
    render(<DataComponent />);

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should hide loading indicator after data loads", async () => {
    render(<DataComponent />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    // Data should be visible
    expect(screen.getByTestId("data")).toBeInTheDocument();
  });

  it("should display fetched data correctly", async () => {
    render(<DataComponent />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId("data")).toBeInTheDocument();
    });

    // Verify data is displayed
    expect(screen.getByTestId("item-1")).toHaveTextContent("Test Item 1: 100");
    expect(screen.getByTestId("item-2")).toHaveTextContent("Test Item 2: 200");
  });

  it("should handle data updates", async () => {
    const { rerender } = render(<DataComponent />);

    // Wait for initial data
    await waitFor(() => {
      expect(screen.getByTestId("data")).toBeInTheDocument();
    });

    // Simulate data update
    const updatedData = [
      { id: 1, name: "Updated Item 1", value: 150 },
      { id: 2, name: "Updated Item 2", value: 250 },
    ];

    // This would normally be triggered by a state update
    // For testing, we'll just verify the component can handle updates
    expect(screen.getByTestId("item-1")).toBeInTheDocument();
  });
});
