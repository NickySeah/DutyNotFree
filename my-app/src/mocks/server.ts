// MSW server setup with error handling
let server: any = null

try {
  const { setupServer } = require('msw/node')
  const { handlers } = require('./handlers')
  
  // This configures a request mocking server with the given request handlers.
  server = setupServer(...handlers)
} catch (error) {
  console.warn('MSW not available, server will not be set up')
}

export { server }
