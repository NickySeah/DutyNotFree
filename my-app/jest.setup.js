// Polyfills for Node.js environment
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream, WritableStream, TransformStream } from 'node:stream/web';
import { BroadcastChannel } from 'node:worker_threads';

// Set up global polyfills
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
Object.assign(global, { ReadableStream, WritableStream, TransformStream, BroadcastChannel });
require('whatwg-fetch');
Object.defineProperty(window, 'matchMedia', { writable: true, value: jest.fn().mockImplementation(query => ({ matches: false, media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() })) });

// Additional polyfills for MSW
global.URL = URL;
global.URLSearchParams = URLSearchParams;

// Import testing library
import '@testing-library/jest-dom'

// Import MSW test setup (conditionally)
try {
  require('./src/mocks/test-setup')
} catch (error) {
  console.warn('MSW test setup not available')
}


// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_TARIFF_SERVICE_URL = 'http://localhost:8080'
process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL = 'http://localhost:8081'
process.env.NEXT_PUBLIC_HS_CODE_SERVICE_URL = 'http://localhost:8082'
process.env.NEXT_PUBLIC_COUNTRIES_SERVICE_URL = 'http://localhost:8083'
process.env.NEXT_PUBLIC_CALCULATOR_SERVICE_URL = 'http://localhost:8084'
