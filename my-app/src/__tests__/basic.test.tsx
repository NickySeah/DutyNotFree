import React from 'react'
import { render, screen } from '@testing-library/react'

// Simple test without MSW dependencies
describe('Basic Test Suite', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div data-testid="test-element">Hello World</div>
    
    render(<TestComponent />)
    
    expect(screen.getByTestId('test-element')).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should handle basic state', () => {
    const StateComponent = () => {
      const [count, setCount] = React.useState(0)
      return (
        <div>
          <div data-testid="count">{count}</div>
          <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
      )
    }
    
    render(<StateComponent />)
    
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('should perform basic math', () => {
    expect(2 + 2).toBe(4)
    expect(10 - 5).toBe(5)
    expect(3 * 4).toBe(12)
  })
})
