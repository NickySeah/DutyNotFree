// Polyfills for Node.js environment
import { TextEncoder, TextDecoder } from "util";
import {
  ReadableStream,
  WritableStream,
  TransformStream,
} from "node:stream/web";
import { BroadcastChannel } from "node:worker_threads";

// Set up global polyfills
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
Object.assign(global, {
  ReadableStream,
  WritableStream,
  TransformStream,
  BroadcastChannel,
});
if (typeof Request === "undefined") require("whatwg-fetch");
if (typeof window !== "undefined")
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest
      .fn()
      .mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
  });

// Additional polyfills for MSW
global.URL = URL;
global.URLSearchParams = URLSearchParams;

// Import testing library
import "@testing-library/jest-dom";

require("./src/mocks/test-setup");

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: {},
      asPath: "/",
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
    };
  },
}));

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_TARIFF_SERVICE_URL = "http://localhost:8080";
process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL = "http://localhost:8081";
process.env.NEXT_PUBLIC_HS_CODE_SERVICE_URL = "http://localhost:8082";
process.env.NEXT_PUBLIC_COUNTRIES_SERVICE_URL = "http://localhost:8083";
process.env.NEXT_PUBLIC_CALCULATOR_SERVICE_URL = "http://localhost:8084";

jest.mock("@/lib/auth-client", () => ({
  useSession: () => ({
    data: { user: { id: "test-user", name: "Test User", role: "importer" } },
    isPending: false,
  }),
  signOut: jest.fn(async () => ({ error: null })),
  authClient: {
    signIn: { email: jest.fn(), social: jest.fn() },
    signUp: { email: jest.fn() },
    admin: { listUsers: jest.fn() },
  },
  sendVerificationEmail: jest.fn(async () => ({ error: null })),
}));

// Use fetch in jsdom: MSW 2 and Axios 1.20 XHR response streams are incompatible in the test DOM.
if (typeof window !== "undefined")
  require("axios").default.defaults.adapter = "fetch";
