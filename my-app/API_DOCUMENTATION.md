# API Documentation

## Tariff Analytics API Endpoints

This document describes the API endpoints used by the tariff analytics dashboard for data aggregation and filtering.

### Base URL
```
http://localhost:3001
```

### Authentication
All endpoints require authentication. Include appropriate headers for your authentication method.

---

## Core Data Endpoints

### 1. Get All Tariffs
**Endpoint:** `GET /api/v1/tariffs/all`

**Description:** Retrieves all tariff data for analytics and chart generation.

**Response Format:**
```json
[
  {
    "id": 1,
    "hsCode": {
      "code": "22030011",
      "description": "Beer made from malt"
    },
    "originCountry": {
      "code": "666",
      "name": "Ireland",
      "alpha3": "IRL"
    },
    "destCountry": {
      "code": "840", 
      "name": "United States",
      "alpha3": "USA"
    },
    "tariffType": "standard",
    "standardRate": 5.5,
    "flatFee": null,
    "effectiveDate": "2024-01-01",
    "expirationDate": null
  }
]
```

### 2. Get All Countries
**Endpoint:** `GET /api/v1/countries/all`

**Description:** Retrieves all countries for filtering and dropdown options.

**Response Format:**
```json
[
  {
    "code": "840",
    "name": "United States", 
    "alpha3": "USA"
  }
]
```

### 3. Get All Products
**Endpoint:** `GET /api/v1/products/all`

**Description:** Retrieves all products for filtering and chart data.

**Response Format:**
```json
[
  {
    "id": 1,
    "name": "Guinness Stout",
    "hsCode": {
      "code": "22030011",
      "description": "Beer made from malt"
    },
    "isPrivate": false,
    "userId": null
  }
]
```

### 4. Get All HS Codes
**Endpoint:** `GET /api/v1/hscodes/all`

**Description:** Retrieves all HS codes for product categorization.

**Response Format:**
```json
[
  {
    "code": "22030011",
    "description": "Beer made from malt",
    "uom": "L"
  }
]
```

---

## Tariff Aggregation Endpoints

### 5. Get Tariffs by Country
**Endpoint:** `GET /api/v1/tariffs/by-country/{countryCode}`

**Description:** Retrieves tariffs filtered by destination country.

**Parameters:**
- `countryCode` (path): ISO country code (e.g., "840" for USA)

**Response:** Same format as `/api/v1/tariffs/all` but filtered by country.

### 6. Get Tariffs by Product
**Endpoint:** `GET /api/v1/tariffs/by-product/{hsCode}`

**Description:** Retrieves tariffs filtered by HS code/product.

**Parameters:**
- `hsCode` (path): HS code (e.g., "22030011")

**Response:** Same format as `/api/v1/tariffs/all` but filtered by product.

### 7. Get Tariffs by Type
**Endpoint:** `GET /api/v1/tariffs/by-type/{tariffType}`

**Description:** Retrieves tariffs filtered by tariff type.

**Parameters:**
- `tariffType` (path): Type of tariff ("standard", "preferential", "anti-dumping", "countervailing")

**Response:** Same format as `/api/v1/tariffs/all` but filtered by type.

---

## Analytics Aggregation Endpoints

### 8. Get Country Competitiveness Data
**Endpoint:** `GET /api/v1/analytics/country-competitiveness`

**Description:** Returns aggregated data for country competitiveness analysis.

**Query Parameters:**
- `country` (optional): Filter by specific country
- `product` (optional): Filter by specific HS code
- `type` (optional): Filter by tariff type

**Response Format:**
```json
[
  {
    "country": "United States",
    "avgRate": 5.2,
    "maxRate": 12.5,
    "minRate": 2.1,
    "medianRate": 4.8,
    "rateStdDev": 2.3,
    "rateRange": 10.4,
    "tariffDiversity": 15,
    "rank": 1,
    "competitiveness": "High",
    "competitivenessColor": "#10b981"
  }
]
```

### 9. Get Product Risk Assessment Data
**Endpoint:** `GET /api/v1/analytics/product-risk`

**Description:** Returns product risk assessment data based on tariff variance.

**Query Parameters:**
- `country` (optional): Filter by specific country
- `product` (optional): Filter by specific HS code
- `type` (optional): Filter by tariff type

**Response Format:**
```json
[
  {
    "product": "Guinness Stout",
    "hsCode": "22030011",
    "variance": 0.65,
    "avgRate": 5.5,
    "maxRate": 8.2,
    "minRate": 3.1,
    "rateRange": 5.1,
    "riskLevel": "Low",
    "riskColor": "#10b981",
    "count": 12
  }
]
```

### 10. Get Market Share Data
**Endpoint:** `GET /api/v1/analytics/market-share`

**Description:** Returns product market share data for pie charts.

**Query Parameters:**
- `country` (optional): Filter by specific country
- `type` (optional): Filter by tariff type

**Response Format:**
```json
[
  {
    "product": "Guinness Stout",
    "hsCode": "22030011",
    "marketShare": 40,
    "tariffRate": 5.5,
    "description": "Beer made from malt",
    "color": "#10b981"
  }
]
```

---

## Calculator Endpoints

### 11. Calculate Tariff Value
**Endpoint:** `GET /api/v1/calculator`

**Description:** Calculates the total landed cost including tariffs.

**Query Parameters:**
- `value` (required): Product value
- `origin` (required): Origin country code
- `dest` (required): Destination country code  
- `hsCode` (required): HS code
- `date` (required): Date in YYYY-MM-DD format

**Response:** Numeric value representing total landed cost.

**Example:**
```
GET /api/v1/calculator?value=1000&origin=666&dest=840&hsCode=22030011&date=2024-01-01
Response: 1055.0
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Successful request
- `400 Bad Request`: Invalid parameters
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

**Error Response Format:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## Rate Limiting

- Standard rate limit: 100 requests per minute per IP
- Analytics endpoints: 50 requests per minute per IP
- Calculator endpoints: 200 requests per minute per IP

---

## Data Filtering

All analytics endpoints support the following query parameters for filtering:

- `country`: Filter by destination country name or code
- `product`: Filter by HS code
- `type`: Filter by tariff type
- `dateFrom`: Filter tariffs effective from this date (YYYY-MM-DD)
- `dateTo`: Filter tariffs effective until this date (YYYY-MM-DD)
- `limit`: Limit number of results (default: 100, max: 1000)
- `offset`: Pagination offset (default: 0)

**Example:**
```
GET /api/v1/analytics/country-competitiveness?country=United States&type=standard&limit=50
```

---

## Usage Examples

### Frontend Integration

```typescript
// Fetch all tariffs for analytics
const response = await fetch('/api/v1/tariffs/all');
const tariffs = await response.json();

// Get country competitiveness data
const competitiveness = await fetch('/api/v1/analytics/country-competitiveness');
const data = await competitiveness.json();

// Calculate tariff for a product
const calculation = await fetch(
  `/api/v1/calculator?value=1000&origin=666&dest=840&hsCode=22030011&date=2024-01-01`
);
const totalCost = await calculation.json();
```

### Chart Data Processing

The analytics endpoints are designed to work seamlessly with the frontend chart components:

1. **Country Competitiveness**: Use `/api/v1/analytics/country-competitiveness` for bar charts
2. **Product Risk Assessment**: Use `/api/v1/analytics/product-risk` for risk analysis charts  
3. **Market Share**: Use `/api/v1/analytics/market-share` for pie charts
4. **Real-time Data**: Use `/api/v1/tariffs/all` with client-side filtering for live updates

---

## Version History

- **v1.0** (2024-01-01): Initial API release with basic tariff endpoints
- **v1.1** (2024-01-15): Added analytics aggregation endpoints
- **v1.2** (2024-02-01): Added filtering and pagination support
