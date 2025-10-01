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

export interface TariffData {
    id: number;
    hsCode: {
        code: string;
        description: string;
    };
    originCountry: {
        code: string;
        name: string;
        alpha3: string;
    };
    destCountry: {
        code: string;
        name: string;
        alpha3: string;
    };
    tariffType: string;
    standardRate: number | null;
    flatFee: number | null;
    effectiveDate: string;
    expirationDate: string | null;
}


// Product category type
export interface ProductCategory {
    id: number;
    name: string;
    hsCode: string;
    baseRate: number;
    category: string;
}