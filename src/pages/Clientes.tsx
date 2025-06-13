import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, User, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { useClientesLocal } from '@/hooks/use-clientes-local';
import ClienteForm from '@/components/clientes/ClienteForm';
import { formatarMoeda, formatarTelefone } from '@/lib/utils';
import { ClienteLocal } from '@/types/localStorage';

const Clientes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<ClienteLocal | null>(null);
  
  const {
    clientes,
    loading,
    error,
    criarCliente,
    atualizarCliente,
    removerCliente,
    buscarClientes
  } = useClientesLocal();

  // Filtrar clientes baseado no termo de busca
  const clientesFiltrados = React.useMemo(() => {
    if (!searchTerm.trim()) return clientes;
    
    const termo = searchTerm.toLowerCase();
    return clientes.filter(cliente => 
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.cpf.includes(termo) ||
      cliente.telefone.includes(termo) ||
      cliente.email?.toLowerCase().includes(termo)
    );
  }, [clientes, searchTerm]);

  const handleSaveCliente = async (dadosCliente: Omit<ClienteLocal, 'id' | 'dividas' | 'pagamentos'>) => {
    if (editingCliente) {
      await atualizarCliente(editingCliente.id, dadosCliente);
    } else {
      await criarCliente(dadosCliente);
    }
    
    setIsDialogOpen(false);
    setEditingCliente(null);
  };

  const handleEditCliente = (cliente: ClienteLocal) => {
    setEditingCliente(cliente);
    setIsDialogOpen(true);
  };

  const handleDeleteCliente = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este cliente?')) {
      await removerCliente(id);
    }
  };

  const calcularTotalDividas = (cliente: ClienteLocal) => {
    return cliente.dividas?.reduce((total, divida) => {
      return total + (divida.valorAtualizado || divida.valor);
    }, 0) || 0;
  };

  const getStatusCliente = (cliente: ClienteLocal) => {
    if (!cliente.dividas || cliente.dividas.length === 0) {
      return { status: 'sem-dividas', label: 'Sem dívidas', color: 'bg-gray-100 text-gray-800' };
    }

    const temVencidas = cliente.dividas.some(d => d.status === 'vencido');
    const temPendentes = cliente.dividas.some(d => d.status === 'pendente');
    
    if (temVencidas) {
      return { status: 'em-atraso', label: 'Em atraso', color: 'bg-red-100 text-red-800' };
    }
    
    if (temPendentes) {
      return { status: 'pendente', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' };
    }
    
    return { status: 'em-dia', label: 'Em dia', color: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar clientes</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie seus clientes e visualize suas informações</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCliente(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
              <DialogDescription>
                {editingCliente 
                  ? 'Atualize as informações do cliente' 
                  : 'Preencha as informações para cadastrar um novo cliente'
                }
              </DialogDescription>
            </DialogHeader>
            <ClienteForm
              cliente={editingCliente}
              onSave={handleSaveCliente}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingCliente(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Barra de pesquisa */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar por nome, CPF, telefone ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de clientes */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clientesFiltrados.map((cliente) => {
          const statusInfo = getStatusCliente(cliente);
          const totalDividas = calcularTotalDividas(cliente);
          
          return (
            <Card key={cliente.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <CreditCard className="h-3 w-3 mr-1" />
                        {cliente.cpf}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={statusInfo.color}>
                    {statusInfo.label}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{formatarTelefone(cliente.telefone)}</span>
                  </div>
                  
                  {cliente.email && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{cliente.email}</span>
                    </div>
                  )}
                  
                  {cliente.endereco && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{cliente.endereco}</span>
                    </div>
                  )}
                </div>

                {totalDividas > 0 && (
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Total em dívidas:</span>
                      <span className="font-semibold text-lg">
                        {formatarMoeda(totalDividas)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {cliente.dividas?.length} dívida(s) registrada(s)
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCliente(cliente)}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCliente(cliente.id)}
                    className="flex-1 text-red-600 hover:text-red-700"
                  >
                    Remover
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {clientesFiltrados.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? 'Tente ajustar os termos da pesquisa'
              : 'Comece cadastrando seu primeiro cliente'
            }
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Clientes;
