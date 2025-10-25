import React from 'react'
import { render, screen, waitFor } from '../../../test-utils/test-utils'
import { DataTable } from '../data-table'
import { columns } from '../columns'
import userEvent from '@testing-library/user-event'

// Mock data
const mockData = [
  {
    tariff_id: 1,
    hsCode: '8517',
    description: 'Telephone sets',
    exportingFrom: 'United States',
    importingTo: 'Canada',
    type: 'Standard',
    rate: 5.5,
    flatFee: 0,
    effectiveDate: new Date('2024-01-01'),
    expirationDate: null,
  },
  {
    tariff_id: 2,
    hsCode: '6109',
    description: 'T-shirts',
    exportingFrom: 'United States',
    importingTo: 'Canada',
    type: 'Standard',
    rate: 8.2,
    flatFee: 0,
    effectiveDate: new Date('2024-01-01'),
    expirationDate: null,
  },
]

describe('DataTable - Data Fetching and Updating', () => {
  it('should render data correctly', () => {
    render(<DataTable columns={columns} data={mockData} />)

    // Verify data is displayed
    expect(screen.getByText('Telephone sets')).toBeInTheDocument()
    expect(screen.getByText('T-shirts')).toBeInTheDocument()
    expect(screen.getByText('United States')).toBeInTheDocument()
    expect(screen.getByText('Canada')).toBeInTheDocument()
    expect(screen.getByText('5.5%')).toBeInTheDocument()
    expect(screen.getByText('8.2%')).toBeInTheDocument()
  })

  it('should handle empty data state', () => {
    render(<DataTable columns={columns} data={[]} />)

    // Should show empty state
    expect(screen.getByText(/No results/)).toBeInTheDocument()
  })

  it('should handle sorting', async () => {
    render(<DataTable columns={columns} data={mockData} />)

    // Click on rate column header to sort
    const rateHeader = screen.getByText('Rate')
    await userEvent.click(rateHeader)

    // Verify sorting is applied
    await waitFor(() => {
      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('5.5%')
      expect(rows[2]).toHaveTextContent('8.2%')
    })
  })

  it('should handle pagination', async () => {
    // Create more data to test pagination
    const largeDataSet = Array.from({ length: 20 }, (_, i) => ({
      ...mockData[0],
      tariff_id: i + 1,
      description: `Product ${i + 1}`,
    }))

    render(<DataTable columns={columns} data={largeDataSet} />)

    // Verify pagination controls are present
    expect(screen.getByText('Next')).toBeInTheDocument()
    expect(screen.getByText('Previous')).toBeInTheDocument()
  })

  it('should handle row selection', async () => {
    render(<DataTable columns={columns} data={mockData} />)

    // Click on first row checkbox
    const checkboxes = screen.getAllByRole('checkbox')
    await userEvent.click(checkboxes[0])

    // Verify row is selected
    expect(checkboxes[0]).toBeChecked()
  })

  it('should handle bulk actions', async () => {
    render(<DataTable columns={columns} data={mockData} />)

    // Select multiple rows
    const checkboxes = screen.getAllByRole('checkbox')
    await userEvent.click(checkboxes[0])
    await userEvent.click(checkboxes[1])

    // Verify bulk actions are available
    expect(screen.getByText('Delete Selected')).toBeInTheDocument()
  })

  it('should update when data changes', () => {
    const { rerender } = render(<DataTable columns={columns} data={mockData} />)

    // Verify initial data
    expect(screen.getByText('Telephone sets')).toBeInTheDocument()

    // Update data
    const updatedData = [
      ...mockData,
      {
        tariff_id: 3,
        hsCode: '8703',
        description: 'Motor cars',
        exportingFrom: 'United States',
        importingTo: 'Mexico',
        type: 'Standard',
        rate: 10.0,
        flatFee: 0,
        effectiveDate: new Date('2024-01-01'),
        expirationDate: null,
      },
    ]

    rerender(<DataTable columns={columns} data={updatedData} />)

    // Verify new data is displayed
    expect(screen.getByText('Motor cars')).toBeInTheDocument()
    expect(screen.getByText('Mexico')).toBeInTheDocument()
  })

  it('should handle column visibility', async () => {
    render(<DataTable columns={columns} data={mockData} />)

    // Find column visibility toggle
    const columnToggle = screen.getByText('Columns')
    await userEvent.click(columnToggle)

    // Toggle a column
    const rateColumnToggle = screen.getByText('Rate')
    await userEvent.click(rateColumnToggle)

    // Verify column is hidden
    expect(screen.queryByText('Rate')).not.toBeInTheDocument()
  })

  it('should handle search functionality', async () => {
    render(<DataTable columns={columns} data={mockData} />)

    // Find search input
    const searchInput = screen.getByPlaceholderText('Search...')
    await userEvent.type(searchInput, 'telephone')

    // Verify filtering is applied
    await waitFor(() => {
      expect(screen.getByText('Telephone sets')).toBeInTheDocument()
      expect(screen.queryByText('T-shirts')).not.toBeInTheDocument()
    })
  })

  it('should handle export functionality', async () => {
    render(<DataTable columns={columns} data={mockData} />)

    // Find export button
    const exportButton = screen.getByText('Export')
    await userEvent.click(exportButton)

    // Verify export options are shown
    expect(screen.getByText('Export as CSV')).toBeInTheDocument()
    expect(screen.getByText('Export as Excel')).toBeInTheDocument()
  })
})
