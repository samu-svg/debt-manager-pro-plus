
import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ClienteCard from '@/components/clientes/ClienteCard';
import ClienteForm from '@/components/clientes/ClienteForm';
import { useClientesLocal } from '@/hooks/use-clientes-local';
import { useDividasLocal } from '@/hooks/use-dividas-local';

const Clientes = () => {
  const [busca, setBusca] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  
  const { clientes, loading, criarCliente } = useClientesLocal();
  const { dividas } = useDividasLocal();

  // Filtrar clientes com base na busca
  const clientesFiltrados = busca 
    ? clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
        cliente.cpf.replace(/\D/g, '').includes(busca.replace(/\D/g, '')) ||
        cliente.telefone.replace(/\D/g, '').includes(busca.replace(/\D/g, ''))
      )
    : clientes;

  const handleCriarCliente = async (dados: any) => {
    const cliente = await criarCliente(dados);
    if (cliente) {
      setDialogAberto(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes e devedores</p>
        </div>
        
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Cliente</DialogTitle>
            </DialogHeader>
            <ClienteForm 
              onSubmit={handleCriarCliente}
              onCancel={() => setDialogAberto(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome, CPF ou telefone..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {clientesFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientesFiltrados.map((cliente) => {
            const dividasCliente = dividas.filter(d => d.clienteId === cliente.id);
            return (
              <ClienteCard 
                key={cliente.id} 
                cliente={cliente}
                dividas={dividasCliente}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {busca ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </h3>
          <p className="text-gray-500 mb-4">
            {busca 
              ? 'Tente uma busca diferente ou cadastre um novo cliente'
              : 'Comece cadastrando seu primeiro cliente'
            }
          </p>
          {!busca && (
            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Cliente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cadastrar Cliente</DialogTitle>
                </DialogHeader>
                <ClienteForm 
                  onSubmit={handleCriarCliente}
                  onCancel={() => setDialogAberto(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </div>
  );
};

export default Clientes;
