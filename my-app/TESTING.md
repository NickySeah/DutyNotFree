# Data Fetching and Updating Tests

This document outlines the comprehensive test suite for data fetching and updating functionality in the DutyNotFree application.

## Test Coverage

### ✅ Data Fetching Tests

#### 1. Successful Data Fetching
- **File**: `src/hooks/__tests__/useTariffs.test.tsx`
- **File**: `src/hooks/__tests__/useProducts.test.tsx`
- **File**: `src/hooks/__tests__/useCountry.test.tsx`
- **Description**: Tests that API calls return expected data structure
- **Expected Result**: Data array matches mock response

#### 2. Loading States
- **File**: `src/components/__tests__/LoadingStates.test.tsx`
- **Description**: Tests loading indicators during data fetch
- **Expected Result**: Spinner or placeholder rendered while loading

#### 3. Error Handling
- **File**: `src/components/__tests__/LoadingStates.test.tsx`
- **Description**: Tests error message display on fetch failure
- **Expected Result**: Error message rendered correctly

### ✅ Data Updating Tests

#### 4. New Data Addition
- **File**: `src/components/__tests__/DataUpdates.test.tsx`
- **Description**: Tests chart updates when new data is added
- **Expected Result**: Chart data updates with new values

#### 5. Existing Data Changes
- **File**: `src/components/__tests__/DataChanges.test.tsx`
- **Description**: Tests chart updates when existing data changes
- **Expected Result**: Chart rerenders with updated values

### ✅ Integration Tests

#### 6. Complete Data Flow
- **File**: `src/__tests__/DataFetchingAndUpdating.test.tsx`
- **Description**: End-to-end tests covering the complete data flow
- **Expected Result**: All components work together seamlessly

## Test Structure

```
src/
├── __tests__/
│   └── DataFetchingAndUpdating.test.tsx          # Comprehensive integration tests
├── hooks/__tests__/
│   ├── useTariffs.test.tsx                        # Tariff data fetching tests
│   ├── useProducts.test.tsx                       # Product data fetching tests
│   └── useCountry.test.tsx                        # Country data fetching tests
├── components/__tests__/
│   ├── LoadingStates.test.tsx                     # Loading and error state tests
│   ├── DataUpdates.test.tsx                       # New data addition tests
│   └── DataChanges.test.tsx                       # Data modification tests
├── app/
│   ├── calculator/__tests__/
│   │   └── TariffCalculator.test.tsx              # Calculator component tests
│   └── tariff/__tests__/
│       ├── TariffPage.test.tsx                    # Tariff page tests
│       └── DataTable.test.tsx                     # Data table tests
├── mocks/
│   ├── handlers.ts                                # MSW API handlers
│   ├── server.ts                                  # MSW server setup
│   └── test-setup.ts                              # Test setup configuration
└── test-utils/
    ├── test-utils.tsx                             # Custom render function
    └── mockHandlers.ts                            # Mock API handlers
```

## Running Tests

### Install Dependencies
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom msw @types/jest
```

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Commands
- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Test Configuration

### Jest Configuration (`jest.config.js`)
- Uses Next.js Jest configuration
- JSdom environment for React testing
- Custom setup file for MSW and mocks
- Module name mapping for absolute imports

### MSW Setup (`src/mocks/`)
- Mock Service Worker for API mocking
- Handlers for all API endpoints
- Test setup for server lifecycle management

### Custom Test Utils (`src/test-utils/`)
- Custom render function with React Query provider
- Mock handlers for consistent API responses
- Test utilities for common testing patterns

## Test Scenarios Covered

### 1. Data Fetching Success ✅
- Mock API calls return expected data
- Data structure matches expected format
- All required fields are present

### 2. Loading States ✅
- Loading indicators shown during fetch
- Loading states hidden after completion
- Proper loading state transitions

### 3. Error Handling ✅
- Error messages displayed on failure
- Error states handled gracefully
- Retry functionality works

### 4. New Data Addition ✅
- Charts update when new data added
- Data integrity maintained
- Performance with large datasets

### 5. Existing Data Changes ✅
- Charts update when data modified
- Change history tracking
- Bulk updates handled correctly

### 6. Real-time Updates ✅
- Concurrent data changes
- Rapid successive updates
- Data consistency maintained

## Performance Tests

### Large Dataset Handling
- Tests with 1000+ data points
- Performance benchmarks
- Memory usage optimization

### Rapid Updates
- Tests with 100+ rapid changes
- Concurrent update handling
- Data consistency verification

## Mock Data

The test suite includes comprehensive mock data for:
- **Tariffs**: 2 sample tariff records
- **Products**: 2 sample product records  
- **Countries**: 3 sample country records
- **HS Codes**: 3 sample HS code records

## Coverage Goals

- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Lines**: 90%+

## Best Practices

1. **Isolation**: Each test is independent
2. **Mocking**: External dependencies are mocked
3. **Cleanup**: Tests clean up after themselves
4. **Performance**: Tests run efficiently
5. **Maintainability**: Tests are easy to understand and modify

## Troubleshooting

### Common Issues

1. **MSW Not Working**: Ensure server is started in test setup
2. **Async Issues**: Use `waitFor` for async operations
3. **Mock Data**: Verify mock handlers match API structure
4. **Import Issues**: Check absolute import paths

### Debug Tips

1. Use `screen.debug()` to inspect rendered components
2. Check console for MSW warnings
3. Verify mock handlers are properly configured
4. Ensure test environment variables are set
