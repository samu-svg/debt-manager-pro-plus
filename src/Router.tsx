
import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Clientes from '@/pages/Clientes';
import Dividas from '@/pages/Dividas';
import NotFound from '@/pages/NotFound';

const Router = () => {
  console.log('Router renderizando...');
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/clientes" element={<Clientes />} />
      <Route path="/dividas" element={<Dividas />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router;
