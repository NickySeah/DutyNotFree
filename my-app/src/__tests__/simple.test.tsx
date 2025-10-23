import React from 'react'
import { render, screen } from '../test-utils/test-utils'

describe('Simple Test', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div data-testid="test-component">Hello World</div>
    
    render(<TestComponent />)
    
    expect(screen.getByTestId('test-component')).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should handle basic interactions', () => {
    const TestComponent = () => {
      const [count, setCount] = React.useState(0)
      return (
        <div>
          <div data-testid="count">{count}</div>
          <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
      )
    }
    
    render(<TestComponent />)
    
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })
})
