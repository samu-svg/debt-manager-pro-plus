
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useDividas } from '@/hooks/use-dividas';
import { useClientes } from '@/hooks/use-clientes';
import DividaForm from '@/components/dividas/DividaForm';
import { formatarMoeda, formatarData } from '@/lib/utils';
import { Search } from 'lucide-react';

const Dividas = () => {
  const { dividas, marcarComoPaga } = useDividas();
  const { clientes, getCliente } = useClientes();
  const [activeTab, setActiveTab] = useState('todas');
  const [busca, setBusca] = useState('');
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<string | null>(null);
  const [isDividaDialogOpen, setIsDividaDialogOpen] = useState(false);
  
  const dividasAtrasadas = dividas.filter(divida => divida.status === 'atrasado');
  const dividasPendentes = dividas.filter(divida => divida.status === 'pendente');
  const dividasPagas = dividas.filter(divida => divida.status === 'pago');
  
  // Obter cliente por ID
  const getClienteNome = (clienteId: string) => {
    const cliente = getCliente(clienteId);
    return cliente ? cliente.nome : 'Cliente não encontrado';
  };
  
  // Filtrar dívidas pela busca
  const filtrarDividas = (dividasParaFiltrar: typeof dividas) => {
    if (!busca.trim()) return dividasParaFiltrar;
    
    const termoBusca = busca.toLowerCase();
    return dividasParaFiltrar.filter(divida => {
      const clienteNome = getClienteNome(divida.clienteId).toLowerCase();
      const descricao = divida.descricao.toLowerCase();
      const valor = divida.valor.toString();
      
      return (
        clienteNome.includes(termoBusca) || 
        descricao.includes(termoBusca) || 
        valor.includes(termoBusca)
      );
    });
  };
  
  // Dividir dívidas por status para exibição
  const dividasAExibir = {
    todas: filtrarDividas(dividas),
    atrasadas: filtrarDividas(dividasAtrasadas),
    pendentes: filtrarDividas(dividasPendentes),
    pagas: filtrarDividas(dividasPagas)
  };
  
  // Abrir dialog para adicionar dívida
  const handleAdicionarDivida = (clienteId: string) => {
    setClienteSelecionadoId(clienteId);
    setIsDividaDialogOpen(true);
  };
  
  // Criar nova dívida
  const handleCriarDivida = (data: any) => {
    // Esta função seria implementada com a integração real
    console.log('Criando dívida:', data);
    setIsDividaDialogOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dívidas</h1>
        <div className="flex items-center gap-2">
          <Link to="/calculadora">
            <Button variant="outline">Calculadora de Juros</Button>
          </Link>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por cliente ou descrição..."
            className="pl-8"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="todas" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="todas">
            Todas <Badge variant="secondary" className="ml-2">{dividas.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="atrasadas">
            Atrasadas <Badge variant="destructive" className="ml-2">{dividasAtrasadas.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pendentes">
            Pendentes <Badge variant="secondary" className="ml-2">{dividasPendentes.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pagas">
            Pagas <Badge variant="secondary" className="ml-2">{dividasPagas.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        {Object.entries(dividasAExibir).map(([key, dividasFiltradas]) => (
          <TabsContent key={key} value={key} className="mt-6">
            {dividasFiltradas.length > 0 ? (
              <div className="space-y-4">
                {dividasFiltradas.map((divida) => {
                  const clienteNome = getClienteNome(divida.clienteId);
                  
                  return (
                    <Card key={divida.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-lg">{formatarMoeda(divida.valor)}</h3>
                              <Badge 
                                variant={
                                  divida.status === 'atrasado' ? 'destructive' : 
                                  divida.status === 'pago' ? 'outline' : 'secondary'
                                }
                              >
                                {divida.status === 'atrasado' ? 'Atrasado' : 
                                 divida.status === 'pago' ? 'Pago' : 'Pendente'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{divida.descricao}</p>
                            <p className="text-sm">
                              <span className="font-medium">Cliente: </span>
                              <Link to={`/clientes/${divida.clienteId}`} className="text-cobalt-600 hover:underline">
                                {clienteNome}
                              </Link>
                            </p>
                          </div>
                          
                          <div className="space-y-1 md:text-right">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Data da compra: </span>
                              {formatarData(divida.dataCompra)}
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Vencimento: </span>
                              <span className={divida.status === 'atrasado' ? 'text-danger-600 font-medium' : ''}>
                                {formatarData(divida.dataVencimento)}
                              </span>
                            </div>
                            
                            <div className="pt-2 flex gap-2 md:justify-end">
                              {divida.status !== 'pago' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => marcarComoPaga(divida.id)}
                                >
                                  Marcar como pago
                                </Button>
                              )}
                              <Button 
                                variant="default" 
                                size="sm"
                                asChild
                              >
                                <Link to={`/clientes/${divida.clienteId}`}>
                                  Ver cliente
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-lg font-medium">Nenhuma dívida encontrada</p>
                <p className="text-muted-foreground">
                  {busca ? 'Tente uma busca diferente ou limpe os filtros' : 'Não há dívidas nesta categoria'}
                </p>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Dialog para adicionar dívida */}
      {clienteSelecionadoId && (
        <Dialog open={isDividaDialogOpen} onOpenChange={setIsDividaDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Dívida</DialogTitle>
              <DialogDescription>
                Registre uma nova dívida para {getClienteNome(clienteSelecionadoId)}
              </DialogDescription>
            </DialogHeader>
            <DividaForm 
              cliente={getCliente(clienteSelecionadoId)!}
              onSubmit={handleCriarDivida}
              onCancel={() => setIsDividaDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Dividas;
