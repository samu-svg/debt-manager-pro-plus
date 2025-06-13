
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocalDataProvider } from '@/contexts/LocalDataContext';
import ConfiguracaoPastaModal from '@/components/layout/ConfiguracaoPastaModal';
import AppLayout from '@/layouts/AppLayout';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <LocalDataProvider>
            <AppLayout />
            <ConfiguracaoPastaModal />
            <Toaster />
          </LocalDataProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
