# Saleshub 2.0 - Architecture Documentation

## Overview

Saleshub 2.0 is a clean, modular CRM application built with React, TypeScript, Redux Toolkit, and TailwindCSS. The application uses a local JSON-based storage system for data persistence, making it easy to develop and test without external dependencies.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ActionRow.tsx
│   ├── CampaignFormModal.tsx
│   ├── CampaignFormView.tsx
│   ├── CampaignPreviewModal.tsx
│   ├── ConditionalLogicBuilder.tsx
│   ├── ConditionRow.tsx
│   ├── FormFieldConfigurator.tsx
│   ├── Layout.tsx
│   └── RuleCard.tsx
│
├── config/              # Application configuration
│   └── permissions.ts   # Role-based permissions and navigation
│
├── data/                # Data storage
│   └── database.json    # Local JSON database
│
├── hooks/               # Custom React hooks
│   └── usePermissions.ts
│
├── lib/                 # Utilities and helpers
│   ├── logicEngine.ts   # Conditional logic evaluation
│   └── mockData.ts      # Mock data exports (wrapper)
│
├── pages/               # Page components
│   ├── Login.tsx
│   ├── MockCampaigns.tsx
│   ├── MockDashboard.tsx
│   ├── MockLeads.tsx
│   └── MockReports.tsx
│
├── services/            # Business logic and data access
│   ├── storage.service.ts    # Local storage interface
│   ├── auth.service.ts       # Authentication logic
│   ├── campaign.service.ts   # Campaign operations
│   └── lead.service.ts       # Lead operations
│
├── store/               # Redux state management
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── campaignsSlice.ts
│   │   └── leadsSlice.ts
│   ├── hooks.ts
│   └── index.ts
│
├── types/               # TypeScript type definitions
│   ├── index.ts         # Core data types
│   └── conditionalLogic.ts
│
├── App.tsx              # Root component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## Architecture Principles

### 1. Separation of Concerns

The application is organized into distinct layers:

- **Presentation Layer** (`components/`, `pages/`): UI components and page layouts
- **Business Logic Layer** (`services/`): Data operations and business rules
- **State Management Layer** (`store/`): Redux slices for global state
- **Data Layer** (`data/`): Local JSON storage

### 2. Service-Oriented Architecture

All data operations go through service classes:

```typescript
// Example: Campaign Service
class CampaignService {
  async getAll(): Promise<Campaign[]>
  async getById(id: string): Promise<Campaign | undefined>
  async create(campaign: Campaign): Promise<Campaign>
  async update(id: string, updates: Partial<Campaign>): Promise<void>
  async delete(id: string): Promise<void>
}
```

### 3. Type Safety

TypeScript is used throughout the application with strict type checking. All data models are defined in `src/types/index.ts`.

### 4. Redux Toolkit for State Management

State management uses Redux Toolkit with async thunks for side effects:

```typescript
export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchAll',
  async () => {
    return await campaignService.getAll();
  }
);
```

### 5. Role-Based Access Control

Permissions are configured in `config/permissions.ts` and enforced through the `usePermissions` hook.

## Data Flow

1. **Component** triggers an action (e.g., user clicks "Create Campaign")
2. **Redux Thunk** is dispatched
3. **Service** handles the business logic
4. **Storage Service** performs the data operation
5. **LocalStorage** is updated
6. **Redux Store** is updated
7. **Component** re-renders with new data

## Key Features

### Local JSON Storage

Data is persisted to `localStorage` with a JSON structure. The initial data is loaded from `src/data/database.json`.

```typescript
class StorageService {
  private getDatabase(): Database
  private setDatabase(data: Database): void
  private updateDatabase(updater: (db: Database) => Database): Database
  // ... CRUD methods
}
```

### Authentication

Simple email/password authentication using local data:

```typescript
class AuthService {
  async login(email: string, password: string): Promise<User | null>
  async getCurrentUser(): Promise<User | null>
  async setCurrentUser(user: User): Promise<void>
  async logout(): Promise<void>
}
```

### Responsive Design

All components are responsive with mobile-first design using Tailwind CSS breakpoints:
- `sm:` - 640px and up
- `md:` - 768px and up
- `lg:` - 1024px and up

## Adding New Features

### 1. Add a New Entity

1. Define the type in `src/types/index.ts`
2. Add the entity to the database schema in `src/data/database.json`
3. Create a service in `src/services/` (e.g., `product.service.ts`)
4. Create a Redux slice in `src/store/slices/`
5. Add the slice to the store in `src/store/index.ts`
6. Create UI components and pages

### 2. Add a New Page

1. Create the page component in `src/pages/`
2. Add navigation config in `src/config/permissions.ts`
3. Add route in `src/App.tsx`

### 3. Add Permissions

Update `src/config/permissions.ts`:

```typescript
export const permissions: RolePermissions = {
  campaign_manager: {
    campaigns: {
      read: true,
      write: true,
      create: true,
      delete: true,
    },
    // ...
  },
  // ...
};
```

## Development Workflow

1. **Install dependencies**: `npm install`
2. **Start dev server**: `npm run dev`
3. **Type checking**: `npm run typecheck`
4. **Linting**: `npm run lint`
5. **Build**: `npm run build`

## Testing

Currently, the application uses demo accounts for testing:

- **Campaign Manager**: manager@leadbyte.com / demo123
- **Field Agent**: agent1@leadbyte.com / demo123
- **Call Center**: callcenter@leadbyte.com / demo123

## Future Enhancements

### Migration to Real Database

When ready to switch to a real database (e.g., Supabase):

1. Install the database client (e.g., `@supabase/supabase-js`)
2. Update services in `src/services/` to use the database client
3. Keep the service interfaces unchanged
4. Update Redux thunks if needed
5. No changes to components required (thanks to service layer)

### Recommended Additions

- Unit tests with Vitest
- E2E tests with Playwright
- API layer for backend integration
- WebSocket support for real-time updates
- File upload functionality
- Export/import features
- Advanced reporting with charts

## Best Practices

1. **Always use services** - Never access storage directly from components
2. **Type everything** - Use TypeScript strictly
3. **Keep components small** - Single responsibility principle
4. **Use Redux for shared state only** - Local component state for UI-only state
5. **Responsive by default** - Test on multiple screen sizes
6. **Error handling** - Always handle errors gracefully
7. **Loading states** - Show loading indicators for async operations

## Performance Considerations

- Redux Toolkit includes `immer` for immutable updates
- Components use React.memo where appropriate
- Lazy loading for large lists
- Debounced search inputs
- Virtualization for very long lists (if needed)

## Security Notes

This is a demo application with:
- Local storage only (not suitable for production)
- Simple password checking (no hashing)
- No API security

For production:
- Use proper authentication (JWT, OAuth)
- Hash passwords
- Implement HTTPS
- Add CSRF protection
- Sanitize all inputs
- Use environment variables for sensitive config
