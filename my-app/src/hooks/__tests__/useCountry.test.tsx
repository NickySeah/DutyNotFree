import { renderHook, waitFor } from '@testing-library/react'
import { useCountries } from '../useCountry'

describe('useCountries', () => {
  it('should fetch country data successfully', async () => {
    const { result } = renderHook(() => useCountries())

    // Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verify data structure
    expect(result.current.data).toBeDefined()
    expect(Array.isArray(result.current.data)).toBe(true)
    expect(result.current.data).toHaveLength(3)
    
    // Verify data structure
    const country = result.current.data![0]
    expect(country).toHaveProperty('code')
    expect(country).toHaveProperty('name')
    expect(country).toHaveProperty('alpha3')
  })

  it('should show loading indicator while fetching data', async () => {
    const { result } = renderHook(() => useCountries())

    // Should be loading initially
    expect(result.current.isLoading).toBe(true)
    expect(result.current.isPending).toBe(true)
  })

  it('should hide loading indicator after data loads', async () => {
    const { result } = renderHook(() => useCountries())

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isPending).toBe(false)
    })

    expect(result.current.data).toBeDefined()
  })

  it('should handle error states', async () => {
    // Mock error response
    const { server } = await import('../../mocks/server')
    server.use(
      require('msw').http.get('http://localhost:8083/all', () => {
        return require('msw').HttpResponse.error()
      })
    )

    const { result } = renderHook(() => useCountries())

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })
})
