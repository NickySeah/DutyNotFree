// lib/axios.ts
import axios, { AxiosInstance } from 'axios';

// This is a simple in-memory cache for our JWT.
let jwtToken: string | null = null;

// This is our factory function. It takes a baseURL and returns a
// fully configured Axios instance with the JWT interceptor attached.
const createAuthenticatedApiInstance = (baseURL: string): AxiosInstance => {
  const api = axios.create({
    baseURL,
  });

  // Attach the interceptor to this new instance
  api.interceptors.request.use(
    async (config) => {
      // If we don't have a token yet, fetch one.
      if (!jwtToken) {
        try {
          const response = await fetch('/api/auth/token');
          if (response.ok) {
            const data = await response.json();
            jwtToken = data.token; // Cache the token
          }
        } catch (error) {
          console.error('Error fetching auth token:', error);
          jwtToken = null;
        }
      }

      // If we have a token, add it to the Authorization header.
      if (jwtToken) {
        config.headers.Authorization = `Bearer ${jwtToken}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return api;
};

// Now, use the factory function to create and export each of your services.
// The '!' tells TypeScript that we are sure the environment variable will exist.
export const tariffService = createAuthenticatedApiInstance(process.env.NEXT_PUBLIC_TARIFF_SERVICE_URL!);
export const productService = createAuthenticatedApiInstance(process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL!);
export const hsCodeService = createAuthenticatedApiInstance(process.env.NEXT_PUBLIC_HS_CODE_SERVICE_URL!);
export const countriesService = createAuthenticatedApiInstance(process.env.NEXT_PUBLIC_COUNTRIES_SERVICE_URL!);
export const calculatorService = createAuthenticatedApiInstance(process.env.NEXT_PUBLIC_CALCULATOR_SERVICE_URL!);
export const ftaService = createAuthenticatedApiInstance(process.env.NEXT_PUBLIC_FTA_SERVICE_URL!);
export const blocService = createAuthenticatedApiInstance(process.env.NEXT_PUBLIC_BLOC_SERVICE_URL!);
export const wishlistService = createAuthenticatedApiInstance(process.env.NEXT_PUBLIC_WISHLIST_SERVICE_URL!);
export const ragService = createAuthenticatedApiInstance(process.env.NEXT_PUBLIC_RAG_SERVICE_URL!);