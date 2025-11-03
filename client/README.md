# Client Documentation

React frontend for the Enterprise E-Commerce Platform.

## Structure

```
client/src/
├── api/              # API client configuration
├── components/        # Reusable UI components
├── features/           # Feature-based modules
├── hooks/             # Custom React hooks
├── layouts/            # Layout components
├── pages/              # Page components
├── redux/              # State management
├── routes/             # Route configuration
├── services/           # API services
├── types/              # TypeScript types
├── utils/              # Utility functions
├── constants/          # Constants
└── configs/            # Configuration
```

## Configuration

### API Configuration

API endpoint configuration in `configs/api/api.ts`:

```typescript
import { BACKEND_API } from 'configs/api/api';
```

### Environment Variables

Frontend environment variables:

- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_ENV` - Environment (development/production)

## Constants

Centralized constants in `constants/` directory:

- `messages.ts` - User-facing messages
- `labels.ts` - UI labels
- `roles.ts` - User roles and helpers
- `banner.ts` - Banner configuration
- `ui.ts` - UI constants

## API Client

Centralized API client in `utils/apiClient.ts`:

```typescript
import apiClient from 'utils/apiClient';

// GET request
const response = await apiClient.get('/products');

// POST request
const response = await apiClient.post('/products', data);
```

## Hooks

### useApi Hook

API call hook with loading and error states:

```typescript
import { useApi } from 'hooks/useApi';

const { execute, loading, error, data } = useApi({
  showSuccessMessage: true,
  onSuccess: (data) => console.log(data),
});

// Execute API call
await execute(() => apiClient.get('/products'));
```

## State Management

Redux Toolkit is used for state management:

### Store Structure

```typescript
{
  auth: { ... },
  products: { ... },
  carts: { ... },
  // ... other slices
}
```

### Creating a Slice

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProductsApi } from 'services';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async () => {
    const { data } = await getProductsApi();
    return data;
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      });
  },
});
```

## Components

### Component Structure

```typescript
import React from 'react';
import './Component.scss';

interface ComponentProps {
  prop1: string;
  prop2?: number;
}

export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks
  // State
  // Effects
  // Handlers
  // Render
  return (
    <div className="component">
      {/* JSX */}
    </div>
  );
};
```

## Routing

React Router v6 is used for routing:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/products" element={<ProductsPage />} />
  </Routes>
</BrowserRouter>
```

### Protected Routes

```typescript
import { PrivateRoute } from 'routes/PrivateRoute';

<PrivateRoute path="/dashboard" element={<Dashboard />} />
```

## Development

### Start Development Server

```bash
npm start
```

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Styling

- **SCSS**: Component-level styles
- **CSS Modules**: Scoped styles
- **Ant Design**: Component library
- **Global Styles**: `index.css`

## Best Practices

1. **TypeScript**: Use types for all components
2. **Constants**: Use centralized constants
3. **Hooks**: Reusable custom hooks
4. **Components**: Small, focused components
5. **API**: Use centralized API client
6. **State**: Redux for global state
7. **Error Handling**: Consistent error handling
