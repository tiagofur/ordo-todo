# Mobile App - Quick Reference

## Installation

```bash
# From project root
cd apps/mobile
npm install

# Build API client
cd ../../packages/api-client
npm run build

# Back to mobile
cd ../../apps/mobile
```

## Configuration

### Environment Variables

Create `.env`:
```env
# iOS Simulator
EXPO_PUBLIC_API_URL=http://localhost:3001/api/v1

# Android Emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:3001/api/v1

# Physical Device (replace with your IP)
EXPO_PUBLIC_API_URL=http://192.168.1.10:3001/api/v1
```

## Running the App

```bash
# Start Expo dev server
npm start

# Run on specific platform
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web browser
```

## Common Imports

```typescript
// Auth
import { useAuth } from '../contexts/auth.context';

// API Hooks (all domains)
import {
  // Auth
  useLogin,
  useRegister,
  useLogout,
  useCurrentUser,

  // Tasks
  useTasks,
  useTask,
  useCreateTask,
  useUpdateTask,
  useCompleteTask,
  useDeleteTask,

  // Workspaces
  useWorkspaces,
  useWorkspace,
  useCreateWorkspace,

  // ... etc
} from '../hooks/api';

// React Query
import { useQueryClient } from '@tanstack/react-query';
```

## Common Patterns

### Authentication

```typescript
const { user, isLoading, login, logout } = useAuth();

// Login
await login({ email, password });

// Logout
await logout();

// Check auth status
if (user) {
  // User is logged in
}
```

### Fetching Data

```typescript
const { data, isLoading, error, refetch } = useTasks(projectId);

if (isLoading) return <Loading />;
if (error) return <Error message={error.message} />;

return data?.map(task => <TaskItem task={task} />);
```

### Creating Data

```typescript
const createTask = useCreateTask();

const handleCreate = async () => {
  try {
    await createTask.mutateAsync({
      title: 'New Task',
      projectId: '123',
      status: 'TODO',
    });
  } catch (error) {
    console.error('Failed to create task:', error);
  }
};
```

### Updating Data

```typescript
const updateTask = useUpdateTask();

const handleUpdate = async (taskId: string) => {
  await updateTask.mutateAsync({
    id: taskId,
    data: { title: 'Updated Title' },
  });
};
```

### Deleting Data

```typescript
const deleteTask = useDeleteTask();

const handleDelete = async (taskId: string) => {
  if (confirm('Delete this task?')) {
    await deleteTask.mutateAsync(taskId);
  }
};
```

### Manual Cache Invalidation

```typescript
const queryClient = useQueryClient();

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });

// Invalidate all tasks
queryClient.invalidateQueries({ queryKey: ['tasks'] });

// Refetch manually
const { refetch } = useTasks();
await refetch();
```

## Debugging

### View API Logs

Check console for:
- `[API Client] Base URL: ...`
- `[useLogin] Login successful`
- `[useCreateTask] Task created: ...`

### Clear AsyncStorage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clear all data
await AsyncStorage.clear();

// Clear specific keys
await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
```

### Check Network Requests

In development, check the console for API requests. In production, use network debugging tools:
- iOS: Charles Proxy, Proxyman
- Android: Chrome DevTools (chrome://inspect)

## Troubleshooting

### Can't connect to API

**iOS Simulator:**
- Ensure backend running on port 3001
- Use `http://localhost:3001/api/v1`

**Android Emulator:**
- Use `http://10.0.2.2:3001/api/v1`
- Not `localhost`

**Physical Device:**
- Use your machine's IP address
- Ensure same WiFi network
- Check firewall settings

### Authentication not working

```typescript
// Clear tokens and try again
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
```

### Data not updating

```typescript
// Force refetch
const queryClient = useQueryClient();
await queryClient.invalidateQueries({ queryKey: ['tasks'] });
```

### App crashes on startup

- Clear cache: `npm start -- --clear`
- Rebuild: `npm run ios` or `npm run android`
- Check console for errors

## File Locations

### Configuration
- `.env` - Environment variables
- `app.json` - Expo configuration
- `package.json` - Dependencies

### API Setup
- `app/lib/api-client.ts` - API client instance
- `app/lib/storage.ts` - Token storage
- `app/providers/query-provider.tsx` - React Query config

### Auth
- `app/contexts/auth.context.tsx` - Auth context
- `app/hooks/api/use-auth.ts` - Auth hooks

### API Hooks
- `app/hooks/api/use-tasks.ts`
- `app/hooks/api/use-workspaces.ts`
- `app/hooks/api/use-workflows.ts`
- `app/hooks/api/use-projects.ts`
- `app/hooks/api/use-tags.ts`
- `app/hooks/api/use-timers.ts`
- `app/hooks/api/use-analytics.ts`
- `app/hooks/api/use-comments.ts`
- `app/hooks/api/use-attachments.ts`

### Documentation
- `MIGRATION_GUIDE.md` - Detailed migration guide
- `API_SETUP.md` - Complete setup documentation
- `MIGRATION_SUMMARY.md` - Migration summary
- `TESTING_CHECKLIST.md` - Testing checklist
- `QUICK_REFERENCE.md` - This file

## Environment URLs

| Environment | URL |
|------------|-----|
| Development (iOS) | `http://localhost:3001/api/v1` |
| Development (Android) | `http://10.0.2.2:3001/api/v1` |
| Development (Physical) | `http://<YOUR_IP>:3001/api/v1` |
| Staging | `https://staging-api.ordo-todo.com/api/v1` |
| Production | `https://api.ordo-todo.com/api/v1` |

## Useful Commands

```bash
# Development
npm start              # Start Expo dev server
npm run ios            # Run on iOS
npm run android        # Run on Android

# Linting
npm run lint           # Run ESLint

# Clean
npx expo start --clear # Clear cache and restart

# Build
npx eas build          # Build for app stores (requires EAS setup)
```

## API Endpoints Count

- Authentication: 5 hooks
- Tasks: 8 hooks
- Workspaces: 8 hooks
- Workflows: 5 hooks
- Projects: 5 hooks
- Tags: 7 hooks
- Timers: 8 hooks
- Analytics: 4 hooks
- Comments: 5 hooks
- Attachments: 4 hooks

**Total: 59 hooks covering 49 API endpoints**

## Support

For detailed information, see:
- [Migration Guide](./MIGRATION_GUIDE.md)
- [API Setup Guide](./API_SETUP.md)
- [Testing Checklist](./TESTING_CHECKLIST.md)
