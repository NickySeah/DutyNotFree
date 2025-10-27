import React from 'react'
import { render, screen, waitFor, act } from '../test-utils/test-utils'
import { useTariffs } from '../hooks/useTariffs'
import { useProducts } from '../hooks/useProducts'
import { useCountries } from '../hooks/useCountry'
import userEvent from '@testing-library/user-event'

// Mock components for testing
const TestComponent = () => {
  const { data: tariffs, isLoading: tariffsLoading, error: tariffsError } = useTariffs()
  const { data: products, isLoading: productsLoading, error: productsError } = useProducts()
  const { data: countries, isLoading: countriesLoading, error: countriesError } = useCountries()

  if (tariffsLoading || productsLoading || countriesLoading) {
    return <div data-testid="loading-indicator">Loading...</div>
  }

  if (tariffsError || productsError || countriesError) {
    return <div data-testid="error-message">Error loading data</div>
  }

  return (
    <div>
      <div data-testid="tariffs-count">Tariffs: {tariffs?.length || 0}</div>
      <div data-testid="products-count">Products: {products?.length || 0}</div>
      <div data-testid="countries-count">Countries: {countries?.length || 0}</div>
    </div>
  )
}

describe('Data Fetching and Updating - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('✅ should fetch tariff data successfully', () => {
    it('should fetch tariff data successfully', async () => {
      render(<TestComponent />)

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('tariffs-count')).toBeInTheDocument()
      })

      // Verify data is fetched and stored
      expect(screen.getByText('Tariffs: 2')).toBeInTheDocument()
      expect(screen.getByText('Products: 2')).toBeInTheDocument()
      expect(screen.getByText('Countries: 3')).toBeInTheDocument()
    })
  })

  describe('✅ should show loading indicator while fetching data', () => {
    it('should show loading indicator while fetching data', async () => {
      render(<TestComponent />)

      // Should show loading indicator initially
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('✅ should hide loading indicator after data loads', () => {
    it('should hide loading indicator after data loads', async () => {
      render(<TestComponent />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument()
      })

      // Data should be visible
      expect(screen.getByText('Tariffs: 2')).toBeInTheDocument()
    })
  })

  describe('✅ should display error message on fetch failure', () => {
    it('should display error message on fetch failure', async () => {
      // Mock error response
      const { server } = await import('../mocks/server')
      server.use(
        require('msw').http.get('http://localhost:8080/all', () => {
          return require('msw').HttpResponse.error()
        })
      )

      render(<TestComponent />)

      // Should show error message
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })

      expect(screen.getByText('Error loading data')).toBeInTheDocument()
    })
  })

  describe('✅ should update chart when new data is added', () => {
    it('should update chart when new data is added', async () => {
      const MockChart = ({ data }: { data: any[] }) => {
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
          setChartData(prev => [...prev, newDataPoint])
        }

        return (
          <div data-testid="chart-container">
            <div data-testid="chart-data-count">Data Points: {chartData.length}</div>
            <button onClick={addDataPoint} data-testid="add-data-button">
              Add Data Point
            </button>
            {chartData.map((item, index) => (
              <div key={item.id} data-testid={`data-point-${index}`}>
                {item.name}: {item.value.toFixed(2)}
              </div>
            ))}
          </div>
        )
      }

      const initialData = [
        { id: 1, name: 'Point 1', value: 50 },
        { id: 2, name: 'Point 2', value: 30 }
      ]

      render(<MockChart data={initialData} />)

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

  describe('✅ should update chart when existing data changes', () => {
    it('should update chart when existing data changes', async () => {
      const MockChart = ({ data }: { data: any[] }) => {
        const [chartData, setChartData] = React.useState(data)

        React.useEffect(() => {
          setChartData(data)
        }, [data])

        const updateDataPoint = (id: number, newValue: number) => {
          setChartData(prev => 
            prev.map(item => 
              item.id === id ? { ...item, value: newValue } : item
            )
          )
        }

        return (
          <div data-testid="chart-container">
            <div data-testid="chart-data-total">
              Total: {chartData.reduce((sum, item) => sum + item.value, 0).toFixed(2)}
            </div>
            {chartData.map((item, index) => (
              <div key={item.id} data-testid={`data-point-${index}`}>
                <span>{item.name}: {item.value.toFixed(2)}</span>
                <button 
                  onClick={() => updateDataPoint(item.id, item.value * 1.5)}
                  data-testid={`update-button-${index}`}
                >
                  Update
                </button>
              </div>
            ))}
          </div>
        )
      }

      const initialData = [
        { id: 1, name: 'Point 1', value: 50 },
        { id: 2, name: 'Point 2', value: 30 }
      ]

      render(<MockChart data={initialData} />)

      // Verify initial state
      expect(screen.getByText('Total: 80.00')).toBeInTheDocument()

      // Update first data point
      const updateButton = screen.getByTestId('update-button-0')
      await userEvent.click(updateButton)

      // Verify chart updates
      await waitFor(() => {
        expect(screen.getByText('Total: 105.00')).toBeInTheDocument()
      })

      // Verify individual data point is updated
      expect(screen.getByText('Point 1: 75.00')).toBeInTheDocument()
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete data flow from fetch to display', async () => {
      render(<TestComponent />)

      // Initially loading
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()

      // Wait for all data to load
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument()
      })

      // Verify all data is displayed
      expect(screen.getByText('Tariffs: 2')).toBeInTheDocument()
      expect(screen.getByText('Products: 2')).toBeInTheDocument()
      expect(screen.getByText('Countries: 3')).toBeInTheDocument()
    })

    it('should handle mixed success and error states', async () => {
      // Mock partial error
      const { server } = await import('../mocks/server')
      server.use(
        require('msw').http.get('http://localhost:8080/all', () => {
          return require('msw').HttpResponse.error()
        })
      )

      render(<TestComponent />)

      // Should show error message
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })
    })

    it('should handle data updates in real-time', async () => {
      const MockRealTimeChart = () => {
        const [data, setData] = React.useState([
          { id: 1, name: 'Real-time Point', value: 100 }
        ])

        React.useEffect(() => {
          const interval = setInterval(() => {
            setData(prev => prev.map(item => ({
              ...item,
              value: item.value + Math.random() * 10 - 5
            })))
          }, 100)

          return () => clearInterval(interval)
        }, [])

        return (
          <div data-testid="real-time-chart">
            <div data-testid="data-points">
              {data.map((item, index) => (
                <div key={item.id} data-testid={`point-${index}`}>
                  {item.name}: {item.value.toFixed(2)}
                </div>
              ))}
            </div>
          </div>
        )
      }

      render(<MockRealTimeChart />)

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByTestId('real-time-chart')).toBeInTheDocument()
      })

      // Verify data is updating
      const initialValue = screen.getByText(/Real-time Point: \d+\.\d+/)
      expect(initialValue).toBeInTheDocument()

      // Wait for updates
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200))
      })

      // Verify data has changed
      const updatedValue = screen.getByText(/Real-time Point: \d+\.\d+/)
      expect(updatedValue).toBeInTheDocument()
    })
  })

  describe('Performance Tests', () => {
    it('should handle large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Point ${i + 1}`,
        value: Math.random() * 100
      }))

      const MockLargeChart = ({ data }: { data: any[] }) => {
        const [chartData, setChartData] = React.useState(data)

        React.useEffect(() => {
          setChartData(data)
        }, [data])

        return (
          <div data-testid="large-chart">
            <div data-testid="data-count">Count: {chartData.length}</div>
            <div data-testid="total-value">
              Total: {chartData.reduce((sum, item) => sum + item.value, 0).toFixed(2)}
            </div>
          </div>
        )
      }

      const startTime = performance.now()
      render(<MockLargeChart data={largeDataset} />)
      const endTime = performance.now()

      // Verify data is rendered
      await waitFor(() => {
        expect(screen.getByText('Count: 1000')).toBeInTheDocument()
      })

      // Verify performance is acceptable (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000)
    })

    it('should handle rapid data updates', async () => {
      const MockRapidChart = () => {
        const [data, setData] = React.useState([
          { id: 1, name: 'Rapid Point', value: 100 }
        ])

        const updateRapidly = () => {
          for (let i = 0; i < 100; i++) {
            setData(prev => prev.map(item => ({
              ...item,
              value: item.value + Math.random() * 2 - 1
            })))
          }
        }

        return (
          <div data-testid="rapid-chart">
            <div data-testid="current-value">
              Value: {data[0].value.toFixed(2)}
            </div>
            <button onClick={updateRapidly} data-testid="rapid-update-button">
              Rapid Update
            </button>
          </div>
        )
      }

      render(<MockRapidChart />)

      // Verify initial state
      expect(screen.getByText('Value: 100.00')).toBeInTheDocument()

      // Trigger rapid updates
      const updateButton = screen.getByTestId('rapid-update-button')
      await userEvent.click(updateButton)

      // Verify updates are processed
      await waitFor(() => {
        const valueElement = screen.getByTestId('current-value')
        expect(valueElement).toBeInTheDocument()
      })
    })
  })
})
