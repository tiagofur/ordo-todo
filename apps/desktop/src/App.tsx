import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './components/providers/auth-provider';
import { TimerProvider } from './contexts/timer-context';
import { router } from './routes';
import "./App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TimerProvider>
            <RouterProvider router={router} />
            <Toaster richColors position="top-right" />
        </TimerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
