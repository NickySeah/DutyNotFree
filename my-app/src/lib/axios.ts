// lib/axios.ts
import axios from "axios";

export const tariffService = axios.create({
  baseURL: process.env.NEXT_PUBLIC_TARIFF_SERVICE_URL,
  withCredentials: true,
});

export const productService = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL,//Replace URL
  withCredentials: true,
});


export const hsCodeService = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HS_CODE_SERVICE_URL,
  withCredentials: true,
});


export const countriesService = axios.create({
  baseURL: process.env.NEXT_PUBLIC_COUNTRIES_SERVICE_URL,
  withCredentials: true,
});

export const calculatorService = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CALCULATOR_SERVICE_URL,
  withCredentials: true,
});