
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useClientesSupabase } from '@/hooks/use-clientes-supabase';
import { useDividas } from '@/hooks/use-dividas';
import ClienteForm from '@/components/clientes/ClienteForm';
import ClienteCard from '@/components/clientes/ClienteCard';
import { Cliente } from '@/types';
import { Search } from 'lucide-react';

const Clientes = () => {
  const { clientes, criarCliente, buscarClientes, loading } = useClientesSupabase();
  const { dividas } = useDividas();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [filtroAplicado, setFiltroAplicado] = useState(false);
  const [buscando, setBuscando] = useState(false);

  // Lidar com a criação de um novo cliente
  const handleCriarCliente = async (data: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>) => {
    const resultado = await criarCliente(data);
    if (resultado) {
      setIsDialogOpen(false);
    }
  };

  // Buscar clientes
  const handleBuscar = async () => {
    if (busca.trim()) {
      setBuscando(true);
      try {
        const resultados = await buscarClientes(busca);
        setClientesFiltrados(resultados);
        setFiltroAplicado(true);
      } finally {
        setBuscando(false);
      }
    } else {
      setClientesFiltrados([]);
      setFiltroAplicado(false);
    }
  };

  // Reset da busca
  const handleResetBusca = () => {
    setBusca('');
    setClientesFiltrados([]);
    setFiltroAplicado(false);
  };

  // Determinar quais clientes exibir
  const clientesParaExibir = filtroAplicado ? clientesFiltrados : clientes;

  // Filtrar dívidas por cliente
  const getDividasDoCliente = (clienteId: string) => {
    return dividas.filter(divida => divida.clienteId === clienteId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <Button onClick={() => setIsDialogOpen(true)}>Cadastrar Cliente</Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome ou CPF..."
            className="pl-8"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
          />
        </div>
        <Button variant="outline" onClick={handleBuscar} disabled={buscando}>
          {buscando ? 'Buscando...' : 'Buscar'}
        </Button>
        {filtroAplicado && (
          <Button variant="ghost" onClick={handleResetBusca}>Limpar</Button>
        )}
      </div>

      {loading && (
        <Card className="p-8 text-center">
          <p className="text-lg font-medium">Carregando clientes...</p>
        </Card>
      )}

      {!loading && filtroAplicado && clientesFiltrados.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-lg font-medium">Nenhum cliente encontrado</p>
          <p className="text-muted-foreground">Tente usar termos diferentes para a busca</p>
        </Card>
      )}

      {!loading && clientesParaExibir.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientesParaExibir.map((cliente) => (
            <ClienteCard 
              key={cliente.id} 
              cliente={cliente} 
              dividas={getDividasDoCliente(cliente.id)}
            />
          ))}
        </div>
      ) : (
        !loading && !filtroAplicado && (
          <Card className="p-8 text-center">
            <p className="text-lg font-medium">Nenhum cliente cadastrado</p>
            <p className="text-muted-foreground mb-4">Cadastre seu primeiro cliente para começar</p>
            <Button onClick={() => setIsDialogOpen(true)}>Cadastrar Cliente</Button>
          </Card>
        )
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar Cliente</DialogTitle>
            <DialogDescription>
              Preencha os dados do cliente abaixo
            </DialogDescription>
          </DialogHeader>
          <ClienteForm 
            onSubmit={handleCriarCliente}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clientes;
