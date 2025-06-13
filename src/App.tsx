
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LocalDataProvider } from '@/contexts/LocalDataContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import AuthPage from '@/pages/Auth/AuthPage';
import Dashboard from '@/pages/Dashboard';
import Clientes from '@/pages/Clientes';
import ClienteDetalhes from '@/pages/ClienteDetalhes';
import Dividas from '@/pages/Dividas';

const queryClient = new QueryClient();

// Componente para proteger rotas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Layout principal
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

// Componente de rotas principais
const AppRoutes = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <AuthPage />;
  }
  
  return (
    <LocalDataProvider>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/:id" element={<ClienteDetalhes />} />
          <Route path="/dividas" element={<Dividas />} />
          <Route path="/auth" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </LocalDataProvider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
