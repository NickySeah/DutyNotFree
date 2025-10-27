import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock data
const mockTariffs = [
  { id: 1, hsCode: '8517', rate: 5.5, type: 'Standard' },
  { id: 2, hsCode: '6109', rate: 8.2, type: 'Standard' }
]

const mockProducts = [
  { id: 1, name: 'Smartphone', value: 500 },
  { id: 2, name: 'T-Shirt', value: 25 }
]

// Mock API service
const mockApiService = {
  async fetchTariffs() {
    await new Promise(resolve => setTimeout(resolve, 100))
    return mockTariffs
  },
  
  async fetchProducts() {
    await new Promise(resolve => setTimeout(resolve, 100))
    return mockProducts
  },
  
  async fetchWithError() {
    await new Promise(resolve => setTimeout(resolve, 100))
    throw new Error('Network error')
  }
}

// Mock hooks
const useMockTariffs = () => {
  const [data, setData] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const result = await mockApiService.fetchTariffs()
        setData(result)
        setIsLoading(false)
      } catch (err) {
        setError(err.message)
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  return { data, isLoading, error }
}

// Chart component
const MockChart = ({ data, onDataUpdate }: { 
  data: any[]
  onDataUpdate: (newData: any[]) => void 
}) => {
  const [chartData, setChartData] = React.useState(data)

  React.useEffect(() => {
    setChartData(data)
  }, [data])

  const addDataPoint = () => {
    const newDataPoint = {
      id: Date.now(),
      name: `New Point ${chartData.length + 1}`,
      value: Math.random() * 100
    }
    const updatedData = [...chartData, newDataPoint]
    setChartData(updatedData)
    onDataUpdate(updatedData)
  }

  const updateDataPoint = (id: number, newValue: number) => {
    const updatedData = chartData.map(item => 
      item.id === id ? { ...item, value: newValue } : item
    )
    setChartData(updatedData)
    onDataUpdate(updatedData)
  }

  return (
    <div data-testid="chart-container">
      <div data-testid="chart-data-count">Data Points: {chartData.length}</div>
      <div data-testid="chart-data-total">
        Total: {chartData.reduce((sum, item) => sum + item.value, 0).toFixed(2)}
      </div>
      <button onClick={addDataPoint} data-testid="add-data-button">
        Add Data Point
      </button>
      {chartData.map((item, index) => (
        <div key={item.id} data-testid={`data-point-${index}`}>
          <span>{item.name}: {item.value.toFixed(2)}</span>
          <button 
            onClick={() => updateDataPoint(item.id, item.value * 1.1)}
            data-testid={`update-button-${index}`}
          >
            Update
          </button>
        </div>
      ))}
    </div>
  )
}

// Main test component
const TestApp = () => {
  const { data: tariffs, isLoading, error } = useMockTariffs()
  const [chartData, setChartData] = React.useState(mockProducts)

  if (isLoading) {
    return <div data-testid="loading-indicator">Loading...</div>
  }

  if (error) {
    return <div data-testid="error-message">Error: {error}</div>
  }

  return (
    <div>
      <div data-testid="tariffs-count">Tariffs: {tariffs?.length || 0}</div>
      <MockChart data={chartData} onDataUpdate={setChartData} />
    </div>
  )
}

describe('Comprehensive Data Fetching and Updating Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('✅ Test 1: Fetch tariff data successfully', () => {
    it('should fetch tariff data successfully', async () => {
      render(<TestApp />)

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('tariffs-count')).toBeInTheDocument()
      })

      // Verify data is fetched
      expect(screen.getByText('Tariffs: 2')).toBeInTheDocument()
    })
  })

  describe('✅ Test 2: Show loading indicator while fetching data', () => {
    it('should show loading indicator while fetching data', async () => {
      render(<TestApp />)

      // Should show loading indicator initially
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('✅ Test 3: Hide loading indicator after data loads', () => {
    it('should hide loading indicator after data loads', async () => {
      render(<TestApp />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument()
      })

      // Data should be visible
      expect(screen.getByTestId('tariffs-count')).toBeInTheDocument()
    })
  })

  describe('✅ Test 4: Display error message on fetch failure', () => {
    it('should display error message on fetch failure', async () => {
      // Mock error response
      const originalFetch = mockApiService.fetchTariffs
      mockApiService.fetchTariffs = mockApiService.fetchWithError

      render(<TestApp />)

      // Should show error message
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })

      expect(screen.getByText(/Error: Network error/)).toBeInTheDocument()

      // Restore original function
      mockApiService.fetchTariffs = originalFetch
    })
  })

  describe('✅ Test 5: Update chart when new data is added', () => {
    it('should update chart when new data is added', async () => {
      render(<TestApp />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('chart-container')).toBeInTheDocument()
      })

      // Verify initial state
      expect(screen.getByText('Data Points: 2')).toBeInTheDocument()

      // Add new data point
      const addButton = screen.getByTestId('add-data-button')
      await userEvent.click(addButton)

      // Verify chart updates
      await waitFor(() => {
        expect(screen.getByText('Data Points: 3')).toBeInTheDocument()
      })

      // Verify new data point is visible
      expect(screen.getByText(/New Point 3/)).toBeInTheDocument()
    })
  })

  describe('✅ Test 6: Update chart when existing data changes', () => {
    it('should update chart when existing data changes', async () => {
      render(<TestApp />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('chart-container')).toBeInTheDocument()
      })

      // Verify initial state
      expect(screen.getByText('Total: 525.00')).toBeInTheDocument()

      // Update first data point
      const updateButton = screen.getByTestId('update-button-0')
      await userEvent.click(updateButton)

      // Verify chart updates (500 * 1.1 + 25 = 575)
      await waitFor(() => {
        expect(screen.getByText('Total: 575.00')).toBeInTheDocument()
      })
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete data flow', async () => {
      render(<TestApp />)

      // Initially loading
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()

      // Wait for all data to load
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument()
      })

      // Verify all data is displayed
      expect(screen.getByText('Tariffs: 2')).toBeInTheDocument()
      expect(screen.getByText('Data Points: 2')).toBeInTheDocument()
    })

    it('should handle multiple data updates', async () => {
      render(<TestApp />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('chart-container')).toBeInTheDocument()
      })

      // Add multiple data points
      const addButton = screen.getByTestId('add-data-button')
      await userEvent.click(addButton)
      await userEvent.click(addButton)

      // Verify updates
      await waitFor(() => {
        expect(screen.getByText('Data Points: 4')).toBeInTheDocument()
      })
    })

    it('should handle rapid updates', async () => {
      render(<TestApp />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('chart-container')).toBeInTheDocument()
      })

      // Make rapid updates
      const updateButton = screen.getByTestId('update-button-0')
      await userEvent.click(updateButton)
      await userEvent.click(updateButton)
      await userEvent.click(updateButton)

      // Verify updates are processed (500 * 1.1^3 + 25 = 690.5)
      await waitFor(() => {
        expect(screen.getByText('Total: 690.50')).toBeInTheDocument()
      })
    })
  })
})
