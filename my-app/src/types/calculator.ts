export interface Product {
    id: number;
    is_private: boolean;
    name: string;
    user_id: string;
    hsCode: {
        code: string;
        description: string;
    };
    value: number;
    quantity: number;
}

// Product category type
export interface ProductCategory {
    id: number;
    name: string;
    hsCode: string;
    baseRate: number;
    category: string;
}