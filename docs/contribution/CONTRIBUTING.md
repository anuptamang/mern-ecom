# Contributing Guide

## Development Workflow

### 1. Branch Strategy
- `master` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### 2. Commit Conventions
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding tests
- `chore:` Maintenance tasks

### 3. Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: AirBnB style guide
- **Prettier**: Consistent formatting
- **Naming**: camelCase for variables, PascalCase for components

### 4. Pull Request Process
1. Create feature branch from `develop`
2. Make changes with descriptive commits
3. Run tests and linting
4. Create PR with clear description
5. Request review
6. Address feedback
7. Merge after approval

## Project Standards

### Component Structure
```typescript
// Component.tsx
import React from 'react';
import './Component.scss';

interface ComponentProps {
  // Props interface
}

export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    <div className="component">
      {/* JSX */}
    </div>
  );
};
```

### API Service Pattern
```typescript
// serviceEndpoints.ts
import axios from 'axios';
import { API_CONSTANTS } from 'services/servicesConstants';

export const getResourceApi = async (id: string) => {
  return axios.get(`${API_CONSTANTS.RESOURCE}/${id}`);
};
```

### Redux Slice Pattern
```typescript
// resourceSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getResourceApi } from 'services';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchResource = createAsyncThunk(
  'resource/fetch',
  async (id: string) => {
    const { data } = await getResourceApi(id);
    return data;
  }
);

const resourceSlice = createSlice({
  name: 'resource',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResource.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchResource.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      });
  },
});
```

## Best Practices

1. **Keep components small**: Single responsibility principle
2. **Use TypeScript**: Leverage type safety
3. **Write descriptive names**: Code should be self-documenting
4. **Add comments**: Explain "why", not "what"
5. **Handle errors**: Always handle error cases
6. **Test edge cases**: Consider boundary conditions
7. **Optimize performance**: Use React.memo, useMemo when needed
8. **Accessibility**: Follow WCAG guidelines
