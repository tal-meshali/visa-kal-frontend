# Frontend Tests

This directory contains test utilities and setup for the Visa Vibe frontend application.

## Running Tests

### Run all tests
```bash
cd frontend
npm run test
```

### Run tests in watch mode
```bash
npm run test
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Structure

- `setup.ts` - Test setup and global mocks
- `utils.tsx` - Test utilities and custom render function

### Component Tests
Component tests are located alongside components:
- `src/components/__tests__/` - Component test files

### Service Tests
Service tests are located alongside services:
- `src/services/__tests__/` - Service test files

## Writing Tests

### Component Test Example
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/utils'
import { Button } from '../Button'

describe('Button', () => {
  it('renders button with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

### Service Test Example
```typescript
import { describe, it, expect, vi } from 'vitest'
import { apiGet } from '../apiService'

vi.mock('../apiService')

describe('formService', () => {
  it('fetches form schema', async () => {
    // Test implementation
  })
})
```

## Test Utilities

The `utils.tsx` file provides a custom `render` function that includes all necessary providers (React Query, React Router, etc.) automatically.

## Mocking

Global mocks are configured in `setup.ts`:
- Clerk authentication
- React Router
- Environment variables

