// lib/axios.ts
import axios from "axios";

// All services point to the same Java backend on port 3001
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export const tariffService = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const productService = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const hsCodeService = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const countriesService = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const calculatorService = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});