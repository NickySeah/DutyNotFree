import React, { useState, useEffect } from 'react'
import { render, screen, waitFor, act } from '../../test-utils/test-utils'
import userEvent from '@testing-library/user-event'

// Mock chart component that handles data changes
const MockChartWithChanges = ({ 
  data, 
  onDataChange 
}: { 
  data: any[]
  onDataChange: (changedData: any[]) => void 
}) => {
  const [chartData, setChartData] = useState(data)
  const [changeHistory, setChangeHistory] = useState<any[]>([])

  useEffect(() => {
    setChartData(data)
  }, [data])

  const updateDataPoint = (id: number, field: string, value: any) => {
    const updatedData = chartData.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    )
    setChartData(updatedData)
    
    // Track change
    const change = {
      id,
      field,
      oldValue: chartData.find(item => item.id === id)?.[field],
      newValue: value,
      timestamp: new Date().toISOString()
    }
    setChangeHistory(prev => [...prev, change])
    
    onDataChange(updatedData)
  }

  const bulkUpdate = (updates: Array<{ id: number; field: string; value: any }>) => {
    let updatedData = [...chartData]
    const changes: any[] = []

    updates.forEach(update => {
      const itemIndex = updatedData.findIndex(item => item.id === update.id)
      if (itemIndex !== -1) {
        const oldValue = updatedData[itemIndex][update.field]
        updatedData[itemIndex] = { ...updatedData[itemIndex], [update.field]: update.value }
        changes.push({
          id: update.id,
          field: update.field,
          oldValue,
          newValue: update.value,
          timestamp: new Date().toISOString()
        })
      }
    })

    setChartData(updatedData)
    setChangeHistory(prev => [...prev, ...changes])
    onDataChange(updatedData)
  }

  const revertChange = (changeIndex: number) => {
    const change = changeHistory[changeIndex]
    if (change) {
      const updatedData = chartData.map(item => 
        item.id === change.id ? { ...item, [change.field]: change.oldValue } : item
      )
      setChartData(updatedData)
      setChangeHistory(prev => prev.filter((_, index) => index !== changeIndex))
      onDataChange(updatedData)
    }
  }

  return (
    <div data-testid="chart-container">
      <div data-testid="chart-data-count">
        Data Points: {chartData.length}
      </div>
      <div data-testid="chart-data-total">
        Total Value: {chartData.reduce((sum, item) => sum + item.value, 0).toFixed(2)}
      </div>
      <div data-testid="change-history">
        Changes: {changeHistory.length}
      </div>
      
      {chartData.map((item, index) => (
        <div key={item.id} data-testid={`data-point-${index}`}>
          <span>{item.name}: {item.value.toFixed(2)}</span>
          <input
            data-testid={`value-input-${index}`}
            type="number"
            value={item.value}
            onChange={(e) => updateDataPoint(item.id, 'value', parseFloat(e.target.value) || 0)}
          />
          <input
            data-testid={`name-input-${index}`}
            type="text"
            value={item.name}
            onChange={(e) => updateDataPoint(item.id, 'name', e.target.value)}
          />
        </div>
      ))}

      <button 
        onClick={() => bulkUpdate([
          { id: chartData[0]?.id, field: 'value', value: chartData[0]?.value * 1.5 },
          { id: chartData[1]?.id, field: 'value', value: chartData[1]?.value * 0.8 }
        ])}
        data-testid="bulk-update-button"
      >
        Bulk Update
      </button>

      {changeHistory.map((change, index) => (
        <div key={index} data-testid={`change-${index}`}>
          <span>Change {index + 1}: {change.field} from {change.oldValue} to {change.newValue}</span>
          <button 
            onClick={() => revertChange(index)}
            data-testid={`revert-button-${index}`}
          >
            Revert
          </button>
        </div>
      ))}
    </div>
  )
}

describe('Data Changes and Chart Updates', () => {
  it('should update chart when existing data changes', async () => {
    const initialData = [
      { id: 1, name: 'Point 1', value: 50 },
      { id: 2, name: 'Point 2', value: 30 }
    ]

    const onDataChange = jest.fn()
    
    render(
      <MockChartWithChanges 
        data={initialData} 
        onDataChange={onDataChange}
      />
    )

    // Verify initial state
    expect(screen.getByText('Total Value: 80.00')).toBeInTheDocument()

    // Update first data point value
    const valueInput = screen.getByTestId('value-input-0')
    await userEvent.clear(valueInput)
    await userEvent.type(valueInput, '75')

    // Verify chart updates
    await waitFor(() => {
      expect(screen.getByText('Total Value: 105.00')).toBeInTheDocument()
    })

    expect(onDataChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 1, value: 75 }),
        expect.objectContaining({ id: 2, value: 30 })
      ])
    )
  })

  it('should track change history correctly', async () => {
    const initialData = [
      { id: 1, name: 'Test Point', value: 100 }
    ]

    const onDataChange = jest.fn()
    
    render(
      <MockChartWithChanges 
        data={initialData} 
        onDataChange={onDataChange}
      />
    )

    // Make multiple changes
    const valueInput = screen.getByTestId('value-input-0')
    await userEvent.clear(valueInput)
    await userEvent.type(valueInput, '150')

    const nameInput = screen.getByTestId('name-input-0')
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Updated Point')

    // Verify change history
    await waitFor(() => {
      expect(screen.getByText('Changes: 2')).toBeInTheDocument()
    })

    expect(screen.getByText('Change 1: value from 100 to 150')).toBeInTheDocument()
    expect(screen.getByText('Change 2: name from Test Point to Updated Point')).toBeInTheDocument()
  })

  it('should handle bulk updates correctly', async () => {
    const initialData = [
      { id: 1, name: 'Point 1', value: 50 },
      { id: 2, name: 'Point 2', value: 30 }
    ]

    const onDataChange = jest.fn()
    
    render(
      <MockChartWithChanges 
        data={initialData} 
        onDataChange={onDataChange}
      />
    )

    // Verify initial state
    expect(screen.getByText('Total Value: 80.00')).toBeInTheDocument()

    // Trigger bulk update
    const bulkUpdateButton = screen.getByTestId('bulk-update-button')
    await userEvent.click(bulkUpdateButton)

    // Verify bulk update
    await waitFor(() => {
      expect(screen.getByText('Total Value: 99.00')).toBeInTheDocument() // 75 + 24
    })

    expect(onDataChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 1, value: 75 }),
        expect.objectContaining({ id: 2, value: 24 })
      ])
    )
  })

  it('should handle change reversion', async () => {
    const initialData = [
      { id: 1, name: 'Test Point', value: 100 }
    ]

    const onDataChange = jest.fn()
    
    render(
      <MockChartWithChanges 
        data={initialData} 
        onDataChange={onDataChange}
      />
    )

    // Make a change
    const valueInput = screen.getByTestId('value-input-0')
    await userEvent.clear(valueInput)
    await userEvent.type(valueInput, '150')

    // Verify change is tracked
    await waitFor(() => {
      expect(screen.getByText('Changes: 1')).toBeInTheDocument()
    })

    // Revert the change
    const revertButton = screen.getByTestId('revert-button-0')
    await userEvent.click(revertButton)

    // Verify reversion
    await waitFor(() => {
      expect(screen.getByText('Total Value: 100.00')).toBeInTheDocument()
      expect(screen.getByText('Changes: 0')).toBeInTheDocument()
    })
  })

  it('should handle concurrent data changes', async () => {
    const initialData = [
      { id: 1, name: 'Point 1', value: 50 },
      { id: 2, name: 'Point 2', value: 30 }
    ]

    const onDataChange = jest.fn()
    
    render(
      <MockChartWithChanges 
        data={initialData} 
        onDataChange={onDataChange}
      />
    )

    // Make concurrent changes
    const valueInput1 = screen.getByTestId('value-input-0')
    const valueInput2 = screen.getByTestId('value-input-1')

    await act(async () => {
      await userEvent.clear(valueInput1)
      await userEvent.type(valueInput1, '75')
      await userEvent.clear(valueInput2)
      await userEvent.type(valueInput2, '45')
    })

    // Verify both changes are applied
    await waitFor(() => {
      expect(screen.getByText('Total Value: 120.00')).toBeInTheDocument()
    })

    expect(onDataChange).toHaveBeenCalledTimes(2)
  })

  it('should handle data validation during changes', async () => {
    const initialData = [
      { id: 1, name: 'Valid Point', value: 100 }
    ]

    const onDataChange = jest.fn()
    
    render(
      <MockChartWithChanges 
        data={initialData} 
        onDataChange={onDataChange}
      />
    )

    // Make invalid change (negative value)
    const valueInput = screen.getByTestId('value-input-0')
    await userEvent.clear(valueInput)
    await userEvent.type(valueInput, '-50')

    // Verify change is still applied (component doesn't validate)
    await waitFor(() => {
      expect(screen.getByText('Total Value: -50.00')).toBeInTheDocument()
    })

    // Verify data integrity
    const updatedData = onDataChange.mock.calls[0][0]
    expect(updatedData[0]).toHaveProperty('id', 1)
    expect(updatedData[0]).toHaveProperty('name', 'Valid Point')
    expect(updatedData[0]).toHaveProperty('value', -50)
  })

  it('should handle rapid successive changes', async () => {
    const initialData = [
      { id: 1, name: 'Rapid Point', value: 100 }
    ]

    const onDataChange = jest.fn()
    
    render(
      <MockChartWithChanges 
        data={initialData} 
        onDataChange={onDataChange}
      />
    )

    // Make rapid changes
    const valueInput = screen.getByTestId('value-input-0')
    
    await act(async () => {
      for (let i = 0; i < 5; i++) {
        await userEvent.clear(valueInput)
        await userEvent.type(valueInput, (100 + i * 10).toString())
      }
    })

    // Verify all changes are processed
    await waitFor(() => {
      expect(screen.getByText('Changes: 5')).toBeInTheDocument()
    })

    expect(onDataChange).toHaveBeenCalledTimes(5)
  })

  it('should maintain data consistency during changes', async () => {
    const initialData = [
      { id: 1, name: 'Point 1', value: 50 },
      { id: 2, name: 'Point 2', value: 30 },
      { id: 3, name: 'Point 3', value: 20 }
    ]

    const onDataChange = jest.fn()
    
    render(
      <MockChartWithChanges 
        data={initialData} 
        onDataChange={onDataChange}
      />
    )

    // Verify initial state
    expect(screen.getByText('Data Points: 3')).toBeInTheDocument()
    expect(screen.getByText('Total Value: 100.00')).toBeInTheDocument()

    // Make changes to multiple points
    const valueInput1 = screen.getByTestId('value-input-0')
    const valueInput2 = screen.getByTestId('value-input-1')

    await act(async () => {
      await userEvent.clear(valueInput1)
      await userEvent.type(valueInput1, '75')
      await userEvent.clear(valueInput2)
      await userEvent.type(valueInput2, '45')
    })

    // Verify data consistency is maintained
    await waitFor(() => {
      expect(screen.getByText('Data Points: 3')).toBeInTheDocument()
      expect(screen.getByText('Total Value: 140.00')).toBeInTheDocument()
    })

    // Verify all data points are still present
    expect(screen.getByTestId('data-point-0')).toBeInTheDocument()
    expect(screen.getByTestId('data-point-1')).toBeInTheDocument()
    expect(screen.getByTestId('data-point-2')).toBeInTheDocument()
  })
})
