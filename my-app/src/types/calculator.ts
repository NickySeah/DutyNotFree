export interface Product {
    id: number;
    name: string;
    hsCode: string;
    value: number;
    quantity: number;
    weight: number;
    tariffRate: number;
    category: string;
}

// Product category type
export interface ProductCategory {
    id: number;
    name: string;
    hsCode: string;
    baseRate: number;
    category: string;
}