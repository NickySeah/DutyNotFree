import React from 'react'
import { render, screen, waitFor } from '../../test-utils/test-utils'
import { Skeleton } from '../ui/skeleton'

// Mock loading components
const LoadingSpinner = () => (
  <div data-testid="loading-spinner" className="animate-spin">
    Loading...
  </div>
)

const LoadingSkeleton = () => (
  <div data-testid="loading-skeleton">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
)

const ErrorMessage = ({ error }: { error: string }) => (
  <div data-testid="error-message" className="text-red-500">
    Error: {error}
  </div>
)

const DataComponent = ({ 
  isLoading, 
  error, 
  data 
}: { 
  isLoading: boolean
  error: string | null
  data: any[] | null 
}) => {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorMessage error={error} />
  }

  if (!data || data.length === 0) {
    return <div data-testid="no-data">No data available</div>
  }

  return (
    <div data-testid="data-content">
      {data.map((item, index) => (
        <div key={index}>{item.name}</div>
      ))}
    </div>
  )
}

describe('Loading States and Error Handling', () => {
  it('should show loading indicator while fetching data', () => {
    render(<DataComponent isLoading={true} error={null} data={null} />)

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
    expect(screen.queryByTestId('data-content')).not.toBeInTheDocument()
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
  })

  it('should hide loading indicator after data loads', () => {
    const mockData = [
      { name: 'Item 1' },
      { name: 'Item 2' }
    ]

    render(<DataComponent isLoading={false} error={null} data={mockData} />)

    expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
    expect(screen.getByTestId('data-content')).toBeInTheDocument()
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('should display error message on fetch failure', () => {
    render(<DataComponent isLoading={false} error="Failed to fetch data" data={null} />)

    expect(screen.getByTestId('error-message')).toBeInTheDocument()
    expect(screen.getByText('Error: Failed to fetch data')).toBeInTheDocument()
    expect(screen.queryByTestId('data-content')).not.toBeInTheDocument()
  })

  it('should show no data message when data is empty', () => {
    render(<DataComponent isLoading={false} error={null} data={[]} />)

    expect(screen.getByTestId('no-data')).toBeInTheDocument()
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('should handle loading state transitions correctly', async () => {
    const { rerender } = render(<DataComponent isLoading={true} error={null} data={null} />)

    // Initially loading
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()

    // Simulate data loading
    const mockData = [{ name: 'Loaded Item' }]
    rerender(<DataComponent isLoading={false} error={null} data={mockData} />)

    // Should show data
    expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
    expect(screen.getByTestId('data-content')).toBeInTheDocument()
    expect(screen.getByText('Loaded Item')).toBeInTheDocument()
  })

  it('should handle error state transitions correctly', async () => {
    const { rerender } = render(<DataComponent isLoading={true} error={null} data={null} />)

    // Initially loading
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()

    // Simulate error
    rerender(<DataComponent isLoading={false} error="Network error" data={null} />)

    // Should show error
    expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
    expect(screen.getByTestId('error-message')).toBeInTheDocument()
    expect(screen.getByText('Error: Network error')).toBeInTheDocument()
  })

  it('should handle retry functionality', async () => {
    const mockRetry = jest.fn()
    
    const RetryableComponent = ({ 
      isLoading, 
      error, 
      data, 
      onRetry 
    }: { 
      isLoading: boolean
      error: string | null
      data: any[] | null
      onRetry: () => void
    }) => {
      if (isLoading) {
        return <LoadingSkeleton />
      }

      if (error) {
        return (
          <div>
            <ErrorMessage error={error} />
            <button onClick={onRetry} data-testid="retry-button">
              Retry
            </button>
          </div>
        )
      }

      return <div data-testid="data-content">Data loaded</div>
    }

    render(
      <RetryableComponent 
        isLoading={false} 
        error="Network error" 
        data={null} 
        onRetry={mockRetry}
      />
    )

    // Click retry button
    const retryButton = screen.getByTestId('retry-button')
    await userEvent.click(retryButton)

    expect(mockRetry).toHaveBeenCalledTimes(1)
  })

  it('should handle timeout scenarios', async () => {
    const TimeoutComponent = ({ timeout }: { timeout: boolean }) => {
      if (timeout) {
        return (
          <div data-testid="timeout-message">
            Request timed out. Please try again.
          </div>
        )
      }
      return <LoadingSkeleton />
    }

    const { rerender } = render(<TimeoutComponent timeout={false} />)

    // Initially loading
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()

    // Simulate timeout
    rerender(<TimeoutComponent timeout={true} />)

    // Should show timeout message
    expect(screen.getByTestId('timeout-message')).toBeInTheDocument()
    expect(screen.getByText('Request timed out. Please try again.')).toBeInTheDocument()
  })
})
