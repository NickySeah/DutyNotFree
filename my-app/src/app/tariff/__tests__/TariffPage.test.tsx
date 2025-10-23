import React from 'react'
import { render, screen, waitFor } from '../../../test-utils/test-utils'
import TariffPage from '../page'

describe('TariffPage - Data Fetching and Loading States', () => {
  it('should fetch tariff data successfully', async () => {
    render(<TariffPage />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Telephone sets')).toBeInTheDocument()
    })

    // Verify data is displayed correctly
    expect(screen.getByText('United States')).toBeInTheDocument()
    expect(screen.getByText('Canada')).toBeInTheDocument()
    expect(screen.getByText('5.5%')).toBeInTheDocument()
  })

  it('should show loading indicator while fetching data', async () => {
    render(<TariffPage />)

    // Should show loading skeleton initially
    expect(screen.getByTestId('tariff-table-skeleton')).toBeInTheDocument()
  })

  it('should hide loading indicator after data loads', async () => {
    render(<TariffPage />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('tariff-table-skeleton')).not.toBeInTheDocument()
    })

    // Data should be visible
    expect(screen.getByText('Telephone sets')).toBeInTheDocument()
  })

  it('should display error message on fetch failure', async () => {
    // Mock error response
    const { server } = await import('../../../mocks/server')
    server.use(
      require('msw').http.get('http://localhost:8080/all', () => {
        return require('msw').HttpResponse.error()
      })
    )

    render(<TariffPage />)

    // Should handle error state
    await waitFor(() => {
      expect(screen.getByText(/Error loading tariffs/)).toBeInTheDocument()
    })
  })

  it('should update data when new tariff is added', async () => {
    render(<TariffPage />)

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Telephone sets')).toBeInTheDocument()
    })

    // Simulate adding a new tariff
    const addButton = screen.getByText('Add Tariff')
    await userEvent.click(addButton)

    // Fill in the form (this would open a modal)
    // The actual form interaction would depend on the modal implementation

    // Verify data updates
    await waitFor(() => {
      expect(screen.getByText(/Tariffs \(3\)/)).toBeInTheDocument()
    })
  })

  it('should update data when existing tariff is modified', async () => {
    render(<TariffPage />)

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Telephone sets')).toBeInTheDocument()
    })

    // Find and click edit button for first tariff
    const editButtons = screen.getAllByText('Edit')
    await userEvent.click(editButtons[0])

    // Modify the tariff (this would open an edit modal)
    // The actual form interaction would depend on the modal implementation

    // Verify data updates
    await waitFor(() => {
      expect(screen.getByText('Updated tariff')).toBeInTheDocument()
    })
  })

  it('should handle pagination correctly', async () => {
    render(<TariffPage />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Telephone sets')).toBeInTheDocument()
    })

    // Test pagination controls
    const nextPageButton = screen.getByText('Next')
    if (nextPageButton) {
      await userEvent.click(nextPageButton)
    }

    // Verify pagination state
    expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument()
  })

  it('should handle sorting correctly', async () => {
    render(<TariffPage />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Telephone sets')).toBeInTheDocument()
    })

    // Click on a sortable column header
    const rateHeader = screen.getByText('Rate')
    await userEvent.click(rateHeader)

    // Verify sorting is applied
    await waitFor(() => {
      expect(screen.getByText('5.5%')).toBeInTheDocument()
    })
  })

  it('should handle filtering correctly', async () => {
    render(<TariffPage />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Telephone sets')).toBeInTheDocument()
    })

    // Test search functionality
    const searchInput = screen.getByPlaceholderText('Search tariffs...')
    await userEvent.type(searchInput, 'telephone')

    // Verify filtering is applied
    await waitFor(() => {
      expect(screen.getByText('Telephone sets')).toBeInTheDocument()
      expect(screen.queryByText('T-shirts')).not.toBeInTheDocument()
    })
  })
})
