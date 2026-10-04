import axios, { AxiosInstance } from "axios";
let jwtToken: string | null = null;
let expiresAt = 0;
let generation = 0;
let pending: Promise<string | null> | null = null;

export function clearAuthToken(): void {
  jwtToken = null;
  expiresAt = 0;
  pending = null;
  generation++;
}
async function getToken(): Promise<string | null> {
  if (jwtToken && expiresAt > Date.now() + 30_000) return jwtToken;
  if (pending) return pending;
  const requestedGeneration = generation;
  const work = (async () => {
    try {
      const response = await fetch("/api/auth/token", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (generation !== requestedGeneration || typeof data.token !== "string")
        return null;
      const payload = JSON.parse(
        atob(data.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      // Decoding only controls cache freshness; the backend verifies the signature.
      expiresAt = typeof payload.exp === "number" ? payload.exp * 1000 : 0;
      jwtToken = data.token;
      return jwtToken;
    } catch {
      return null;
    }
  })();
  pending = work;
  try {
    return await work;
  } finally {
    if (pending === work) pending = null;
  }
}

const createAuthenticatedApiInstance = (baseURL: string): AxiosInstance => {
  const api = axios.create({ baseURL, timeout: 30_000 });
  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401)
        clearAuthToken();
      // Do not replay mutations or loop on authorization failures.
      return Promise.reject(error);
    },
  );
  return api;
};
export const tariffService = createAuthenticatedApiInstance(
  process.env.NEXT_PUBLIC_TARIFF_SERVICE_URL || "/api/v1/tariffs",
);
export const productService = createAuthenticatedApiInstance(
  process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || "/api/v1/products",
);
export const hsCodeService = createAuthenticatedApiInstance(
  process.env.NEXT_PUBLIC_HS_CODE_SERVICE_URL || "/api/v1/hscodes",
);
export const countriesService = createAuthenticatedApiInstance(
  process.env.NEXT_PUBLIC_COUNTRIES_SERVICE_URL || "/api/v1/countries",
);
export const calculatorService = createAuthenticatedApiInstance(
  process.env.NEXT_PUBLIC_CALCULATOR_SERVICE_URL || "/api/v1/calculator",
);
export const ftaService = createAuthenticatedApiInstance(
  process.env.NEXT_PUBLIC_FTA_SERVICE_URL || "/api/v1/ftas",
);
export const blocService = createAuthenticatedApiInstance(
  process.env.NEXT_PUBLIC_BLOC_SERVICE_URL || "/api/v1/blocs",
);
export const wishlistService = createAuthenticatedApiInstance(
  process.env.NEXT_PUBLIC_WISHLIST_SERVICE_URL || "/api/v1/wishlists",
);
export const ragService = createAuthenticatedApiInstance(
  process.env.NEXT_PUBLIC_RAG_SERVICE_URL || "/api/v1/chat",
);
