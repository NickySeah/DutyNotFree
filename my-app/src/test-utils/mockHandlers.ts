import { http, HttpResponse } from 'msw'

// Mock handlers for testing
export const mockHandlers = [
  // Tariff service handlers
  http.get('http://localhost:8080/all', () => {
    return HttpResponse.json([
      {
        id: 1,
        hsCode: { code: '8517', description: 'Telephone sets' },
        originCountry: { code: 'US', name: 'United States', alpha3: 'USA' },
        destCountry: { code: 'CA', name: 'Canada', alpha3: 'CAN' },
        tariffType: 'Standard',
        standardRate: 5.5,
        flatFee: null,
        effectiveDate: '2024-01-01',
        expirationDate: null
      },
      {
        id: 2,
        hsCode: { code: '6109', description: 'T-shirts' },
        originCountry: { code: 'US', name: 'United States', alpha3: 'USA' },
        destCountry: { code: 'CA', name: 'Canada', alpha3: 'CAN' },
        tariffType: 'Standard',
        standardRate: 8.2,
        flatFee: null,
        effectiveDate: '2024-01-01',
        expirationDate: null
      }
    ])
  }),

  // Product service handlers
  http.get('http://localhost:8081/all', () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'Smartphone',
        is_private: false,
        user_id: 'user1',
        hsCode: { code: '8517', description: 'Telephone sets' },
        value: 500,
        quantity: 1
      },
      {
        id: 2,
        name: 'T-Shirt',
        is_private: false,
        user_id: 'user1',
        hsCode: { code: '6109', description: 'T-shirts' },
        value: 25,
        quantity: 1
      }
    ])
  }),

  // Countries service handlers
  http.get('http://localhost:8083/all', () => {
    return HttpResponse.json([
      { code: 'US', name: 'United States', alpha3: 'USA' },
      { code: 'CA', name: 'Canada', alpha3: 'CAN' },
      { code: 'MX', name: 'Mexico', alpha3: 'MEX' }
    ])
  }),

  // HS Code service handlers
  http.get('http://localhost:8082/all', () => {
    return HttpResponse.json([
      { code: '8517', description: 'Telephone sets' },
      { code: '6109', description: 'T-shirts' },
      { code: '8703', description: 'Motor cars' }
    ])
  }),

  // Calculator service handlers
  http.get('http://localhost:8084', ({ request }) => {
    const url = new URL(request.url)
    const value = parseFloat(url.searchParams.get('value') || '0')
    const tariffRate = 5.5 // Default rate
    const calculatedValue = value * (1 + tariffRate / 100)
    return HttpResponse.json(calculatedValue)
  })
]
