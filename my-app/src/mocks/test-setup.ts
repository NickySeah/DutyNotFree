// Only import MSW if it's available
let server: any = null

try {
  const { server: mswServer } = require('./server')
  server = mswServer
  
  // Establish API mocking before all tests
  beforeAll(() => {
    if (server) {
      server.listen()
    }
  })

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests
  afterEach(() => {
    if (server) {
      server.resetHandlers()
    }
  })

  // Clean up after the tests are finished
  afterAll(() => {
    if (server) {
      server.close()
    }
  })
} catch (error) {
  // MSW not available, skip setup
  console.warn('MSW not available, skipping mock server setup')
}
