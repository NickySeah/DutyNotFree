import React, { useState, useEffect } from "react";
import { render, screen, waitFor, act } from "../../test-utils/test-utils";
import userEvent from "@testing-library/user-event";

// Mock chart component
const MockChart = ({
  data,
  onDataUpdate,
}: {
  data: any[];
  onDataUpdate: (newData: any[]) => void;
}) => {
  const [chartData, setChartData] = useState(data);

  useEffect(() => {
    setChartData(data);
  }, [data]);

  const addDataPoint = () => {
    const newDataPoint = {
      id: Date.now(),
      name: `Data Point ${chartData.length + 1}`,
      value: Math.random() * 100,
      timestamp: new Date().toISOString(),
    };
    const updatedData = [...chartData, newDataPoint];
    setChartData(updatedData);
    onDataUpdate(updatedData);
  };

  const updateDataPoint = (id: number, newValue: number) => {
    const updatedData = chartData.map((item) =>
      item.id === id ? { ...item, value: newValue } : item,
    );
    setChartData(updatedData);
    onDataUpdate(updatedData);
  };

  const removeDataPoint = (id: number) => {
    const updatedData = chartData.filter((item) => item.id !== id);
    setChartData(updatedData);
    onDataUpdate(updatedData);
  };

  return (
    <div data-testid="chart-container">
      <div data-testid="chart-data-count">Data Points: {chartData.length}</div>
      <div data-testid="chart-data-total">
        Total Value:{" "}
        {chartData.reduce((sum, item) => sum + item.value, 0).toFixed(2)}
      </div>
      <button onClick={addDataPoint} data-testid="add-data-button">
        Add Data Point
      </button>
      {chartData.map((item, index) => (
        <div key={item.id} data-testid={`data-point-${index}`}>
          <span>
            {item.name}: {item.value.toFixed(2)}
          </span>
          <button
            onClick={() => updateDataPoint(item.id, item.value * 1.1)}
            data-testid={`update-button-${index}`}
          >
            Update
          </button>
          <button
            onClick={() => removeDataPoint(item.id)}
            data-testid={`remove-button-${index}`}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

// Mock data store
const createDataStore = () => {
  let data: any[] = [];
  let listeners: Array<() => void> = [];

  const subscribe = (listener: () => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  };

  const getData = () => data;

  const setData = (newData: any[]) => {
    data = newData;
    listeners.forEach((listener) => listener());
  };

  const addData = (newItem: any) => {
    data = [...data, newItem];
    listeners.forEach((listener) => listener());
  };

  const updateData = (id: number, updates: Partial<any>) => {
    data = data.map((item) =>
      item.id === id ? { ...item, ...updates } : item,
    );
    listeners.forEach((listener) => listener());
  };

  const removeData = (id: number) => {
    data = data.filter((item) => item.id !== id);
    listeners.forEach((listener) => listener());
  };

  return { subscribe, getData, setData, addData, updateData, removeData };
};

describe("Data Updates and Chart Functionality", () => {
  it("should update chart when new data is added", async () => {
    const dataStore = createDataStore();
    const initialData = [
      { id: 1, name: "Initial Point", value: 50, timestamp: "2024-01-01" },
    ];
    dataStore.setData(initialData);

    const onDataUpdate = jest.fn();

    render(
      <MockChart data={dataStore.getData()} onDataUpdate={onDataUpdate} />,
    );

    // Verify initial state
    expect(screen.getByText("Data Points: 1")).toBeInTheDocument();
    expect(screen.getByText("Total Value: 50.00")).toBeInTheDocument();

    // Add new data point
    const addButton = screen.getByTestId("add-data-button");
    await userEvent.click(addButton);

    // Verify chart updates
    await waitFor(() => {
      expect(screen.getByText("Data Points: 2")).toBeInTheDocument();
    });

    expect(onDataUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: "Initial Point" }),
        expect.objectContaining({ name: "Data Point 2" }),
      ]),
    );
  });

  it("should update chart when existing data changes", async () => {
    const dataStore = createDataStore();
    const initialData = [
      { id: 1, name: "Test Point", value: 50, timestamp: "2024-01-01" },
    ];
    dataStore.setData(initialData);

    const onDataUpdate = jest.fn();

    render(
      <MockChart data={dataStore.getData()} onDataUpdate={onDataUpdate} />,
    );

    // Verify initial state
    expect(screen.getByText("Total Value: 50.00")).toBeInTheDocument();

    // Update existing data point
    const updateButton = screen.getByTestId("update-button-0");
    await userEvent.click(updateButton);

    // Verify chart updates
    await waitFor(() => {
      expect(screen.getByText("Total Value: 55.00")).toBeInTheDocument();
    });

    expect(onDataUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ value: expect.closeTo(55) }),
      ]),
    );
  });

  it("should update chart when data is removed", async () => {
    const dataStore = createDataStore();
    const initialData = [
      { id: 1, name: "Point 1", value: 50, timestamp: "2024-01-01" },
      { id: 2, name: "Point 2", value: 30, timestamp: "2024-01-02" },
    ];
    dataStore.setData(initialData);

    const onDataUpdate = jest.fn();

    render(
      <MockChart data={dataStore.getData()} onDataUpdate={onDataUpdate} />,
    );

    // Verify initial state
    expect(screen.getByText("Data Points: 2")).toBeInTheDocument();
    expect(screen.getByText("Total Value: 80.00")).toBeInTheDocument();

    // Remove data point
    const removeButton = screen.getByTestId("remove-button-0");
    await userEvent.click(removeButton);

    // Verify chart updates
    await waitFor(() => {
      expect(screen.getByText("Data Points: 1")).toBeInTheDocument();
      expect(screen.getByText("Total Value: 30.00")).toBeInTheDocument();
    });

    expect(onDataUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: "Point 2" })]),
    );
  });

  it("should handle multiple data updates in sequence", async () => {
    const dataStore = createDataStore();
    const initialData = [
      { id: 1, name: "Initial", value: 10, timestamp: "2024-01-01" },
    ];
    dataStore.setData(initialData);

    const onDataUpdate = jest.fn();

    render(
      <MockChart data={dataStore.getData()} onDataUpdate={onDataUpdate} />,
    );

    // Add multiple data points
    const addButton = screen.getByTestId("add-data-button");
    await userEvent.click(addButton);
    await userEvent.click(addButton);
    await userEvent.click(addButton);

    // Verify all updates are processed
    await waitFor(() => {
      expect(screen.getByText("Data Points: 4")).toBeInTheDocument();
    });

    expect(onDataUpdate).toHaveBeenCalledTimes(3);
  });

  it("should handle real-time data updates", async () => {
    const dataStore = createDataStore();
    const initialData = [
      { id: 1, name: "Real-time Point", value: 25, timestamp: "2024-01-01" },
    ];
    dataStore.setData(initialData);

    const onDataUpdate = jest.fn();

    render(
      <MockChart data={dataStore.getData()} onDataUpdate={onDataUpdate} />,
    );

    // Simulate real-time updates
    const updateButton = screen.getByTestId("update-button-0");

    // Update multiple times
    await userEvent.click(updateButton);
    await userEvent.click(updateButton);
    await userEvent.click(updateButton);

    // Verify cumulative updates
    await waitFor(() => {
      expect(screen.getByText("Total Value: 33.28")).toBeInTheDocument();
    });

    expect(onDataUpdate).toHaveBeenCalledTimes(3);
  });

  it("should handle data validation during updates", async () => {
    const dataStore = createDataStore();
    const initialData = [
      { id: 1, name: "Valid Point", value: 50, timestamp: "2024-01-01" },
    ];
    dataStore.setData(initialData);

    const onDataUpdate = jest.fn();

    render(
      <MockChart data={dataStore.getData()} onDataUpdate={onDataUpdate} />,
    );

    // Verify data integrity is maintained
    expect(screen.getByText("Data Points: 1")).toBeInTheDocument();
    expect(screen.getByText("Total Value: 50.00")).toBeInTheDocument();

    // Add new data point
    const addButton = screen.getByTestId("add-data-button");
    await userEvent.click(addButton);

    // Verify data integrity after update
    await waitFor(() => {
      expect(screen.getByText("Data Points: 2")).toBeInTheDocument();
    });

    // Verify all data points have required properties
    const updatedData = onDataUpdate.mock.calls[0][0];
    updatedData.forEach((item: any) => {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("value");
      expect(item).toHaveProperty("timestamp");
    });
  });

  it("should handle concurrent data updates", async () => {
    const dataStore = createDataStore();
    const initialData = [
      { id: 1, name: "Concurrent Point", value: 100, timestamp: "2024-01-01" },
    ];
    dataStore.setData(initialData);

    const onDataUpdate = jest.fn();

    render(
      <MockChart data={dataStore.getData()} onDataUpdate={onDataUpdate} />,
    );

    // Simulate concurrent updates
    const updateButton = screen.getByTestId("update-button-0");
    const addButton = screen.getByTestId("add-data-button");

    // Trigger multiple updates simultaneously
    await act(async () => {
      await userEvent.click(updateButton);
      await userEvent.click(addButton);
      await userEvent.click(updateButton);
    });

    // Verify all updates are processed correctly
    await waitFor(() => {
      expect(screen.getByText("Data Points: 2")).toBeInTheDocument();
    });

    expect(onDataUpdate).toHaveBeenCalledTimes(3);
  });
});
