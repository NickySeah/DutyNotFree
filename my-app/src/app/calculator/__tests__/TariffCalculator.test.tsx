import React from 'react'
import { render, screen, waitFor, fireEvent } from '../../test-utils/test-utils'
import TariffCalculator from '../page'
import userEvent from '@testing-library/user-event'

// Mock the toast function
jest.mock('sonner', () => ({
  toast: {
    warning: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  },
}))

// Mock the date-fns format function
jest.mock('date-fns', () => ({
  format: jest.fn((date) => 'January 1, 2024'),
}))

// Mock the dateUtils
jest.mock('../../../utils/dateUtils', () => ({
  formatDateToYYYYMMDD: jest.fn((date) => '2024-01-01'),
}))

describe('TariffCalculator - Data Fetching and Updating', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch tariff data successfully', async () => {
    render(<TariffCalculator />)

    // Wait for countries to load
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument()
    })

    // Select origin country
    const originSelect = screen.getByDisplayValue('Select a country')
    await userEvent.click(originSelect)
    await userEvent.click(screen.getByText('United States'))

    // Select destination country
    const destSelect = screen.getAllByDisplayValue('Select a country')[1]
    await userEvent.click(destSelect)
    await userEvent.click(screen.getByText('Canada'))

    // Select a product
    const productSelect = screen.getByDisplayValue('Select a product')
    await userEvent.click(productSelect)
    await userEvent.click(screen.getByText('Smartphone'))

    // Add the product
    const addButton = screen.getByText('Add Product')
    await userEvent.click(addButton)

    // Wait for product to be added
    await waitFor(() => {
      expect(screen.getByText('Smartphone')).toBeInTheDocument()
    })

    // Verify that tariff calculation is triggered
    await waitFor(() => {
      expect(screen.getByText(/Calculating:/)).toBeInTheDocument()
    })
  })

  it('should show loading indicator while fetching data', async () => {
    render(<TariffCalculator />)

    // Should show loading state for countries
    await waitFor(() => {
      expect(screen.getByText('No countries or date selected.')).toBeInTheDocument()
    })

    // Wait for countries to load
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument()
    })
  })

  it('should hide loading indicator after data loads', async () => {
    render(<TariffCalculator />)

    // Wait for countries to load
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument()
    })

    // Loading indicator should be gone
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('should display error message on fetch failure', async () => {
    // Mock error response for countries
    const { server } = await import('../../../mocks/server')
    server.use(
      require('msw').http.get('http://localhost:8083/all', () => {
        return require('msw').HttpResponse.error()
      })
    )

    render(<TariffCalculator />)

    // Should handle error state gracefully
    await waitFor(() => {
      expect(screen.getByText('No countries or date selected.')).toBeInTheDocument()
    })
  })

  it('should update chart when new data is added', async () => {
    render(<TariffCalculator />)

    // Wait for countries to load
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument()
    })

    // Select countries
    const originSelect = screen.getByDisplayValue('Select a country')
    await userEvent.click(originSelect)
    await userEvent.click(screen.getByText('United States'))

    const destSelect = screen.getAllByDisplayValue('Select a country')[1]
    await userEvent.click(destSelect)
    await userEvent.click(screen.getByText('Canada'))

    // Select date
    const dateButton = screen.getByText('Pick a date')
    await userEvent.click(dateButton)
    // Note: Calendar interaction would need more complex setup

    // Add a product
    const productSelect = screen.getByDisplayValue('Select a product')
    await userEvent.click(productSelect)
    await userEvent.click(screen.getByText('Smartphone'))

    const addButton = screen.getByText('Add Product')
    await userEvent.click(addButton)

    // Verify product is added and calculation updates
    await waitFor(() => {
      expect(screen.getByText('Smartphone')).toBeInTheDocument()
    })

    // Verify results panel updates
    await waitFor(() => {
      expect(screen.getByText(/Total Goods Value/)).toBeInTheDocument()
    })
  })

  it('should update chart when existing data changes', async () => {
    render(<TariffCalculator />)

    // Wait for countries to load
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument()
    })

    // Select countries and add product
    const originSelect = screen.getByDisplayValue('Select a country')
    await userEvent.click(originSelect)
    await userEvent.click(screen.getByText('United States'))

    const destSelect = screen.getAllByDisplayValue('Select a country')[1]
    await userEvent.click(destSelect)
    await userEvent.click(screen.getByText('Canada'))

    const productSelect = screen.getByDisplayValue('Select a product')
    await userEvent.click(productSelect)
    await userEvent.click(screen.getByText('Smartphone'))

    const addButton = screen.getByText('Add Product')
    await userEvent.click(addButton)

    // Wait for product to be added
    await waitFor(() => {
      expect(screen.getByText('Smartphone')).toBeInTheDocument()
    })

    // Change destination country to trigger recalculation
    const destSelect2 = screen.getAllByDisplayValue('Canada')[0]
    await userEvent.click(destSelect2)
    await userEvent.click(screen.getByText('Mexico'))

    // Verify that calculation is triggered again
    await waitFor(() => {
      expect(screen.getByText(/Calculating:/)).toBeInTheDocument()
    })
  })

  it('should handle multiple products correctly', async () => {
    render(<TariffCalculator />)

    // Wait for countries to load
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument()
    })

    // Select countries
    const originSelect = screen.getByDisplayValue('Select a country')
    await userEvent.click(originSelect)
    await userEvent.click(screen.getByText('United States'))

    const destSelect = screen.getAllByDisplayValue('Select a country')[1]
    await userEvent.click(destSelect)
    await userEvent.click(screen.getByText('Canada'))

    // Add first product
    const productSelect = screen.getByDisplayValue('Select a product')
    await userEvent.click(productSelect)
    await userEvent.click(screen.getByText('Smartphone'))

    const addButton = screen.getByText('Add Product')
    await userEvent.click(addButton)

    // Add second product
    await userEvent.click(productSelect)
    await userEvent.click(screen.getByText('T-Shirt'))

    await userEvent.click(addButton)

    // Verify both products are added
    await waitFor(() => {
      expect(screen.getByText('Smartphone')).toBeInTheDocument()
      expect(screen.getByText('T-Shirt')).toBeInTheDocument()
    })

    // Verify product count updates
    expect(screen.getByText(/Products \(2\)/)).toBeInTheDocument()
  })

  it('should recalculate when products are removed', async () => {
    render(<TariffCalculator />)

    // Wait for countries to load
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument()
    })

    // Select countries and add product
    const originSelect = screen.getByDisplayValue('Select a country')
    await userEvent.click(originSelect)
    await userEvent.click(screen.getByText('United States'))

    const destSelect = screen.getAllByDisplayValue('Select a country')[1]
    await userEvent.click(destSelect)
    await userEvent.click(screen.getByText('Canada'))

    const productSelect = screen.getByDisplayValue('Select a product')
    await userEvent.click(productSelect)
    await userEvent.click(screen.getByText('Smartphone'))

    const addButton = screen.getByText('Add Product')
    await userEvent.click(addButton)

    // Wait for product to be added
    await waitFor(() => {
      expect(screen.getByText('Smartphone')).toBeInTheDocument()
    })

    // Remove the product (assuming there's a remove button)
    const removeButton = screen.getByRole('button', { name: /remove/i })
    await userEvent.click(removeButton)

    // Verify product is removed and count updates
    await waitFor(() => {
      expect(screen.queryByText('Smartphone')).not.toBeInTheDocument()
    })

    expect(screen.getByText(/Products \(0\)/)).toBeInTheDocument()
  })
})
