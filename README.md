A comprehensive full-stack application for calculating international trade tariffs, managing Free Trade Agreements (FTAs), and providing analytics on global trade competitiveness.

## 📋 Table of Contents

- Overview
- Features
- Architecture
- Technology Stack
- Getting Started
- Project Structure
- API Documentation
- Testing
- Contributors
- License

## 🌍 Overview

DutyNotFree is an educational and professional tool designed to help users understand and calculate international trade tariffs. The platform provides real-time tariff calculations, comprehensive tariff databases, FTA management, and analytics dashboards to visualize global trade competitiveness.

### Key Capabilities

- **Tariff Calculator**: Calculate landed costs for products across multiple countries
- **Tariff Database**: Browse and manage tariff rates with HS code classifications
- **FTA Management**: Track and apply Free Trade Agreement benefits
- **Analytics Dashboard**: Visualize tariff trends, country competitiveness, and product risk
- **Watchlist System**: Monitor tariff changes with email notifications
- **Multi-product Calculations**: Calculate tariffs for multiple products simultaneously

## ✨ Features

### Core Features

- **Comprehensive Tariff Database**
  - Search tariffs by origin, destination, HS code, and tariff type
  - Support for both ad valorem (percentage) and specific (flat fee) tariffs
  - Effective and expiration date tracking
  - Email notifications for tariff changes

- **Smart Calculator**
  - Multi-product tariff calculations
  - Automatic FTA application when beneficial
  - Real-time tariff rate lookups
  - Detailed cost breakdowns per product
  - Support for product quantity calculations

- **Analytics Dashboard**
  - Country competitiveness index
  - Product risk assessment
  - Market share visualization
  - Tariff trend analysis
  - Real-time simulated tariff impacts

- **User Management**
  - Role-based access control (Admin/User)
  - Personal product library
  - Tariff watchlist with notifications
  - Secure authentication via Better Auth

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐         ┌──────────────────┐
│   Next.js App   │────────►│  Java Backend    │
│   (Frontend)    │         │  (Spring Boot)   │
└─────────────────┘         └──────────────────┘
        │                            │
        │                            │
        ▼                            ▼
┌─────────────────┐         ┌──────────────────┐
│  Better Auth    │         │   PostgreSQL     │
│  (Auth Service) │         │   (Database)     │
└─────────────────┘         └──────────────────┘
```

### Frontend (Next.js)

- **Framework**: Next.js 16 with App Router
- **UI Components**: Shadcn/ui, Radix UI
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Authentication**: Better Auth

### Backend (Spring Boot)

- **Framework**: Spring Boot 3.x
- **Database**: PostgreSQL with JPA/Hibernate
- **API Documentation**: OpenAPI/Swagger
- **Email Service**: JavaMail
- **Security**: JWT-based authentication

## 🛠️ Technology Stack

### Frontend Technologies

| Category | Technologies |
|----------|-------------|
| Framework | Next.js 15, React 19, TypeScript |
| UI Components | Shadcn/ui, Radix UI, Lucide Icons |
| Data Fetching | TanStack Query, Axios |
| Forms | React Hook Form |
| Styling | Tailwind CSS, Framer Motion |
| Charts | Recharts |
| Testing | Jest, React Testing Library, MSW |

### Backend Technologies

| Category | Technologies |
|----------|-------------|
| Framework | Spring Boot 3.x, Java 17+ |
| Database | PostgreSQL, Spring Data JPA |
| API Documentation | Swagger/OpenAPI |
| Email | JavaMail API |
| Security | Spring Security, JWT |
| Testing | JUnit, Mockito |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Java 17+
- PostgreSQL 14+
- Maven 3.8+

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd DutyNotFree
```

#### 2. Setup Backend

```bash
cd javaBackend

# Configure database connection in .env

# Run with Docker (recommended)
docker-compose up -d

# Or run manually
./mvnw spring-boot:run
```

Backend will run on `http://localhost:3001`

#### 3. Setup Frontend

```bash
cd my-app

# Install dependencies
pnpm install

# Configure environment variables in .env

# Run development server
pnpm dev
```

Frontend will run on `http://localhost:3000`

#### 4. Initialize Database

The database will be automatically initialized with seed data on first run. See data for CSV data files.

### Quick Start Testing

See QUICKSTART_TESTING.md for detailed testing instructions.

## 📁 Project Structure

### Frontend Structure (`my-app/`)

```
my-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── about/             # About page
│   │   ├── admin-dashboard/   # Admin management
│   │   ├── calculator/        # Tariff calculator
│   │   ├── dashboard/         # Analytics dashboard
│   │   ├── tariff/           # Tariff database browser
│   │   └── fta/              # FTA browser
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Shadcn/ui components
│   │   ├── navbar.tsx        # Navigation bar
│   │   ├── createTariffModal.tsx
│   │   ├── updateTariffModal.tsx
│   │   └── LiveTariffChart.tsx
│   ├── hooks/                # Custom React hooks
│   │   ├── useTariffs.ts     # Tariff data fetching
│   │   ├── useCountries.ts   # Country data
│   │   └── useProducts.ts    # Product data
│   ├── lib/                  # Utilities and config
│   │   ├── axios.ts          # API client setup
│   │   ├── auth.ts           # Better Auth config
│   │   └── checkRole.ts      # Role validation
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
└── package.json
```

### Backend Structure (`javaBackend/`)

```
javaBackend/
└── src/main/java/com/example/CSD/
    ├── calculator/           # Tariff calculation logic
    │   ├── CalculatorService.java
    │   ├── CalculatorServiceImpl.java
    │   └── CalculatorV1Controller.java
    ├── tariff/              # Tariff management
    │   ├── Tariff.java
    │   ├── TariffService.java
    │   ├── TariffServiceImpl.java
    │   ├── TariffV1Controller.java
    │   └── TariffRepository.java
    ├── fta/                 # Free Trade Agreement logic
    ├── country/             # Country data
    ├── hscode/              # HS Code management
    ├── product/             # Product management
    ├── wishlist/            # Watchlist functionality
    ├── email/               # Email notification service
    └── config/              # Configuration classes
```

## 📚 API Documentation

### Core Endpoints

#### Tariff Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tariffs/all` | Get all tariffs |
| GET | `/api/v1/tariffs` | Search tariffs with filters |
| GET | `/api/v1/tariffs/{id}` | Get tariff by ID |
| POST | `/api/v1/tariffs` | Create new tariff |
| PUT | `/api/v1/tariffs` | Update tariff |
| DELETE | `/api/v1/tariffs` | Delete tariff |

#### Calculator

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/calculator` | Calculate tariffed value |

**Example Request:**
```
GET /api/v1/calculator?value=1000&origin=US&dest=CA&hsCode=8517&date=2024-01-01
```

**Example Response:**
```json
{
  "appliedFTA": {
    "name": "USMCA",
    "partyA": "United States",
    "partyB": "Canada",
    "appliedRate": 0.0,
    "effectiveDate": "2020-07-01",
    "expirationDate": null
  },
  "appliedTariffs": [],
  "tariffTotal": 0.0,
  "finalValue": 1000.0
}
```

### Complete API Documentation

For complete API documentation, see:
- API_DOCUMENTATION.md - Detailed endpoint documentation
- Swagger UI: `http://localhost:3001/swagger-ui.html` (when backend is running)

## 🧪 Testing

### Frontend Testing

```bash
cd my-app

# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

### Test Coverage

- Custom hooks (useTariffs, useProducts, useCountries)
- Component rendering and interactions
- Data fetching and updates
- Loading and error states
- Calculator functionality

See TEST_RESULTS.md for detailed test results.

### Backend Testing

```bash
cd javaBackend

# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=TariffServiceTest
```

## 🔑 Key Components

### Calculator Logic

The calculator (`CalculatorServiceImpl.java`) handles:
1. **FTA Application**: Checks for applicable Free Trade Agreements
2. **Tariff Calculation**: Applies standard tariffs if no FTA or FTA is more expensive
3. **Cost Optimization**: Automatically selects the lowest cost option

### Tariff Management

The tariff service (`TariffServiceImpl.java`) provides:
- Date validation for tariff periods
- Duplicate prevention
- Wishlist notifications
- CRUD operations with validation

### Analytics Dashboard

The dashboard (`src/app/dashboard/page.tsx`) displays:
- Country competitiveness rankings
- Product risk assessments
- Market share distributions
- Real-time tariff trend simulations

## 📧 Email Notifications

Users can add tariffs to their watchlist and receive email notifications for:
- Tariff creations
- Tariff updates (rate changes)
- Tariff expirations

Email service is implemented in `EmailService.java`.

## 🔒 Security

- **Authentication**: Better Auth with session management
- **Authorization**: Role-based access control (Admin/User)
- **API Security**: Internal API key for service-to-service communication
- **CORS**: Configured for frontend-backend communication

## 📝 Environment Variables

### Frontend (`.env`)

```env
BACKEND_API_URL=http://localhost:3001
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=userdb
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_TARIFF_SERVICE_URL=http://localhost:3001/api/v1/tariffs
NEXT_PUBLIC_HS_CODE_SERVICE_URL=http://localhost:3001/api/v1/hscodes
NEXT_PUBLIC_COUNTRIES_SERVICE_URL=http://localhost:3001/api/v1/countries
NEXT_PUBLIC_PRODUCT_SERVICE_URL=http://localhost:3001/api/v1/products
NEXT_PUBLIC_CALCULATOR_SERVICE_URL=http://localhost:3001/api/v1/calculator
NEXT_PUBLIC_FTA_SERVICE_URL=http://localhost:3001/api/v1/ftas
NEXT_PUBLIC_BLOC_SERVICE_URL=http://localhost:3001/api/v1/blocs
NEXT_PUBLIC_WISHLIST_SERVICE_URL=http://localhost:3001/api/v1/wishlists
NEXT_PUBLIC_RAG_SERVICE_URL=http://localhost:3001/api/v1/chat
GMAIL_USER=
GMAIL_PASS=
```

### Backend (`.env`)

```env
# Local
DB_HOST=localhost
DB_PASSWORD=root
DB_NAME=productdb
FRONTEND_URL=http://localhost:3000

# Docker
# FRONTEND_URL=http://host.docker.internal:3000

# Production
# DB_SECRET_PASSWORD=
# FRONTEND_URL=


MAIL_USERNAME=
MAIL_PASSWORD=
COHERE_API_KEY=
PINECONE_API_KEY=

```

## 👥 Contributors

- **Bryan Lee**
- **Denzyl Ng**
- **Fermin Lim**
- **Nicholas Seah**
- **Zhen Yang**

## 📄 License

This project is developed for educational purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation in the my-app directory
- Review API_DOCUMENTATION.md

---

**Last Updated**: January 2025
