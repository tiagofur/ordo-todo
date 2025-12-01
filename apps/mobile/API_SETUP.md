# Mobile App - REST API Setup

## Quick Start

### 1. Install Dependencies

```bash
cd apps/mobile
npm install
```

### 2. Configure API URL

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` based on your platform:

**iOS Simulator:**
```env
EXPO_PUBLIC_API_URL=http://localhost:3001/api/v1
```

**Android Emulator:**
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3001/api/v1
```

**Physical Device:**
```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3001/api/v1
```
*(Replace with your machine's IP address)*

### 3. Build API Client Package

```bash
cd ../../packages/api-client
npm run build
```

### 4. Start the Mobile App

```bash
cd ../../apps/mobile
npm start
```

## Architecture

### API Client

The mobile app uses `@ordo-todo/api-client`, a shared TypeScript package that provides:

- Type-safe REST API methods
- Automatic token management
- Token refresh on expiration
- Request/response interceptors
- Error handling

**Location:** `packages/api-client`

### Token Storage

Tokens are stored securely using AsyncStorage:

```typescript
// app/lib/storage.ts
export class AsyncStorageTokenStorage implements TokenStorage {
  async getToken(): Promise<string | null>
  async setToken(token: string): Promise<void>
  async removeToken(): Promise<void>
  async getRefreshToken(): Promise<string | null>
  async setRefreshToken(token: string): Promise<void>
}
```

### API Client Instance

Configured instance with platform-specific URLs:

```typescript
// app/lib/api-client.ts
export const apiClient = new OrdoApiClient({
  baseURL: getBaseURL(), // Auto-detects platform
  tokenStorage: new AsyncStorageTokenStorage(),
  onTokenRefresh: (response) => {
    console.log('Token refreshed');
  },
  onAuthError: () => {
    // Navigate to login
  },
});
```

### React Query Integration

All API hooks use React Query for:
- Automatic caching
- Background refetching
- Optimistic updates
- Invalidation strategies

```typescript
// app/providers/query-provider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

### Auth Context

Central authentication state:

```typescript
// app/contexts/auth.context.tsx
export function AuthProvider({ children }) {
  const { data: user, isLoading } = useCurrentUser();

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## Provider Hierarchy

```typescript
// app/_layout.tsx
<QueryProvider>
  <ThemeProvider>
    <MessageProvider>
      <AuthProvider>
        <MobileFeaturesProvider>
          {/* App content */}
        </MobileFeaturesProvider>
      </AuthProvider>
    </MessageProvider>
  </ThemeProvider>
</QueryProvider>
```

## API Hooks

### Query Hooks (GET requests)

```typescript
import { useTasks, useTask } from '../hooks/api';

// List tasks
const { data, isLoading, error } = useTasks(projectId);

// Single task
const { data: task } = useTask(taskId);
```

### Mutation Hooks (POST/PUT/DELETE)

```typescript
import { useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/api';

const createTask = useCreateTask();
const updateTask = useUpdateTask();
const deleteTask = useDeleteTask();

// Create
await createTask.mutateAsync({
  title: 'New task',
  projectId: '123',
});

// Update
await updateTask.mutateAsync({
  id: '456',
  data: { title: 'Updated title' },
});

// Delete
await deleteTask.mutateAsync('456');
```

## Cache Management

### Automatic Invalidation

Mutations automatically invalidate related queries:

```typescript
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiClient.createTask(data),
    onSuccess: () => {
      // Invalidates all task queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
```

### Manual Invalidation

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });

// Invalidate all tasks
queryClient.invalidateQueries({ queryKey: ['tasks'] });

// Clear all cache
queryClient.clear();
```

### Optimistic Updates

```typescript
export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId) => apiClient.completeTask(taskId),
    onMutate: async (taskId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['tasks', taskId]);

      // Optimistically update
      queryClient.setQueryData(['tasks', taskId], (old) => ({
        ...old,
        status: 'COMPLETED',
      }));

      return { previous };
    },
    onError: (err, taskId, context) => {
      // Rollback on error
      queryClient.setQueryData(['tasks', taskId], context.previous);
    },
  });
}
```

## Error Handling

### Global Error Handler

```typescript
// app/lib/api-client.ts
export const apiClient = new OrdoApiClient({
  // ...
  onAuthError: () => {
    // Navigate to login
    router.replace('/screens/(external)/auth');
  },
});
```

### Per-Hook Error Handling

```typescript
const { data, error, isError } = useTasks(projectId);

if (isError) {
  return <Text>Error: {error.message}</Text>;
}
```

### Try-Catch with Mutations

```typescript
import { useMessages } from '../hooks/use-messages';

const { addError } = useMessages();
const createTask = useCreateTask();

try {
  await createTask.mutateAsync(data);
} catch (error) {
  addError(error.message);
}
```

## Network Status

The app monitors network connectivity:

```typescript
import { useOnlineStatus } from '../data/hooks/use-online-status.hook';

const isOnline = useOnlineStatus();

if (!isOnline) {
  return <OfflineNotice />;
}
```

React Query will automatically retry failed requests when back online.

## Development Tips

### View API Logs

```typescript
// In app/lib/api-client.ts
if (__DEV__) {
  console.log('[API] Base URL:', API_BASE_URL);
  console.log('[API] Request:', method, endpoint);
  console.log('[API] Response:', data);
}
```

### Clear AsyncStorage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clear all data
await AsyncStorage.clear();

// Clear specific keys
await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
```

### Inspect React Query Cache

Install React Query Devtools:

```bash
npm install @tanstack/react-query-devtools
```

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  {__DEV__ && <ReactQueryDevtools />}
</QueryClientProvider>
```

## Testing

### Mock API Client

```typescript
import { OrdoApiClient } from '@ordo-todo/api-client';

const mockApiClient = {
  getTasks: jest.fn().mockResolvedValue([]),
  createTask: jest.fn().mockResolvedValue({ id: '1' }),
} as unknown as OrdoApiClient;
```

### Test with React Query

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

test('useTasks returns tasks', async () => {
  const { result } = renderHook(() => useTasks('project-1'), { wrapper });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toHaveLength(3);
});
```

## Performance Optimization

### Stale Time

Configure how long data is considered fresh:

```typescript
const { data } = useTasks(projectId, {
  staleTime: 1000 * 60 * 10, // 10 minutes
});
```

### Prefetching

Prefetch data before navigation:

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Prefetch before navigation
await queryClient.prefetchQuery({
  queryKey: ['tasks', projectId],
  queryFn: () => apiClient.getTasks(projectId),
});

router.push(`/project/${projectId}`);
```

### Background Refetching

```typescript
const { data } = useTasks(projectId, {
  refetchInterval: 1000 * 30, // Refetch every 30 seconds
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
});
```

## Security

### Token Security

- Tokens stored in AsyncStorage (encrypted on iOS)
- Never log tokens in production
- Automatic token refresh before expiration
- Tokens cleared on logout

### API Security

- All requests use HTTPS in production
- CORS configured on backend
- Rate limiting on backend
- Request validation with DTOs

## Production Considerations

### Environment Variables

Use different URLs per environment:

```env
# .env.development
EXPO_PUBLIC_API_URL=http://localhost:3001/api/v1

# .env.staging
EXPO_PUBLIC_API_URL=https://staging-api.ordo-todo.com/api/v1

# .env.production
EXPO_PUBLIC_API_URL=https://api.ordo-todo.com/api/v1
```

### Error Tracking

Integrate error tracking service:

```typescript
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

// In mutations
onError: (error) => {
  Sentry.captureException(error);
}
```

### Performance Monitoring

```typescript
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onSuccess: () => {
        // Track success metrics
      },
      onError: (error) => {
        // Track error metrics
      },
    },
  },
});
```

## Troubleshooting

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md#troubleshooting) for common issues and solutions.
