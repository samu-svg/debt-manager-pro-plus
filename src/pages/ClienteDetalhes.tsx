
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useClientes } from '@/hooks/use-clientes';
import { useDividas } from '@/hooks/use-dividas';
import ClienteForm from '@/components/clientes/ClienteForm';
import DividaForm from '@/components/dividas/DividaForm';
import DividaCard from '@/components/dividas/DividaCard';
import WhatsAppForm from '@/components/whatsapp/WhatsAppForm';
import { formatarCPF, formatarTelefone, formatarMoeda, formatarData } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ClienteDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getCliente, atualizarCliente, removerCliente } = useClientes();
  const { dividas, criarDivida, marcarComoPaga, recarregarDividas } = useDividas(id);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDividaDialogOpen, setIsDividaDialogOpen] = useState(false);
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
  const [dividaSelecionada, setDividaSelecionada] = useState<string | null>(null);
  
  // Buscar cliente
  const cliente = getCliente(id || '');
  
  if (!cliente) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <h1 className="text-2xl font-bold mb-4">Cliente não encontrado</h1>
        <p className="text-muted-foreground mb-6">O cliente que você está procurando não existe ou foi removido.</p>
        <Button onClick={() => navigate('/clientes')}>Voltar para Clientes</Button>
      </div>
    );
  }
  
  // Estatísticas de dívidas
  const totalDividas = dividas.length;
  const dividasAtrasadas = dividas.filter(d => d.status === 'atrasado');
  const dividasPendentes = dividas.filter(d => d.status === 'pendente');
  const dividasPagas = dividas.filter(d => d.status === 'pago');
  const valorTotal = dividas.reduce((total, divida) => total + divida.valor, 0);
  const valorAtrasado = dividasAtrasadas.reduce((total, divida) => total + divida.valor, 0);
  const temDividaAtrasada = dividasAtrasadas.length > 0;
  
  // Atualizar cliente
  const handleAtualizarCliente = (data: Omit<typeof cliente, 'id' | 'createdAt' | 'updatedAt'>) => {
    atualizarCliente(cliente.id, data);
    setIsEditDialogOpen(false);
  };
  
  // Remover cliente
  const handleRemoverCliente = () => {
    const confirmacao = window.confirm(`Tem certeza que deseja remover o cliente ${cliente.nome}? Esta ação não pode ser desfeita.`);
    if (confirmacao) {
      removerCliente(cliente.id);
      navigate('/clientes');
    }
  };
  
  // Criar nova dívida
  const handleCriarDivida = (data: Omit<typeof dividas[0], 'id' | 'createdAt' | 'updatedAt'>) => {
    criarDivida(data);
    setIsDividaDialogOpen(false);
  };
  
  // Marcar dívida como paga
  const handleMarcarComoPaga = (dividaId: string) => {
    marcarComoPaga(dividaId);
    recarregarDividas();
  };
  
  // Enviar mensagem WhatsApp
  const handleEnviarWhatsApp = (dividaId: string) => {
    setDividaSelecionada(dividaId);
    setIsWhatsAppDialogOpen(true);
  };
  
  // Processar envio de WhatsApp
  const handleEnvioWhatsApp = (numeroWhatsApp: string, mensagem: string) => {
    // Simulação do envio (em um app real, isso iria para a API do WhatsApp Business)
    // Formatando número para o formato internacional
    const numeroFormatado = numeroWhatsApp.replace(/\D/g, '');
    const url = `https://wa.me/55${numeroFormatado}?text=${encodeURIComponent(mensagem)}`;
    
    // Abre em uma nova aba
    window.open(url, '_blank');
    setIsWhatsAppDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{cliente.nome}</h1>
          <p className="text-muted-foreground">
            CPF: {formatarCPF(cliente.cpf)} | Telefone: {formatarTelefone(cliente.telefone)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            Editar Cliente
          </Button>
          <Button variant="default" onClick={() => setIsDividaDialogOpen(true)}>
            Nova Dívida
          </Button>
          <Button variant="destructive" onClick={handleRemoverCliente}>
            Remover Cliente
          </Button>
        </div>
      </div>
      
      {temDividaAtrasada && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção!</AlertTitle>
          <AlertDescription>
            Este cliente possui {dividasAtrasadas.length} {dividasAtrasadas.length === 1 ? 'dívida atrasada' : 'dívidas atrasadas'} no valor total de {formatarMoeda(valorAtrasado)}.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Dívidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDividas}</div>
            <p className="text-xs text-muted-foreground">
              Valor total: {formatarMoeda(valorTotal)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Dívidas Atrasadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger-600">{dividasAtrasadas.length}</div>
            <p className="text-xs text-muted-foreground">
              Valor atrasado: {formatarMoeda(valorAtrasado)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Dívidas Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cobalt-600">{dividasPendentes.length}</div>
            <p className="text-xs text-muted-foreground">
              Valor pendente: {formatarMoeda(dividasPendentes.reduce((sum, d) => sum + d.valor, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Dívidas Pagas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dividasPagas.length}</div>
            <p className="text-xs text-muted-foreground">
              Valor pago: {formatarMoeda(dividasPagas.reduce((sum, d) => sum + d.valor, 0))}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="todas">
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="atrasadas" className="relative">
            Atrasadas
            {dividasAtrasadas.length > 0 && (
              <Badge variant="destructive" className="ml-1 absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {dividasAtrasadas.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="pagas">Pagas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="todas" className="mt-6">
          {dividas.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dividas.map((divida) => (
                <DividaCard 
                  key={divida.id}
                  divida={divida}
                  onPagar={handleMarcarComoPaga}
                  onEnviarWhatsApp={handleEnviarWhatsApp}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-lg font-medium">Nenhuma dívida registrada</p>
              <p className="text-muted-foreground mb-4">Registre a primeira dívida deste cliente</p>
              <Button onClick={() => setIsDividaDialogOpen(true)}>Nova Dívida</Button>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="atrasadas" className="mt-6">
          {dividasAtrasadas.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dividasAtrasadas.map((divida) => (
                <DividaCard 
                  key={divida.id}
                  divida={divida}
                  onPagar={handleMarcarComoPaga}
                  onEnviarWhatsApp={handleEnviarWhatsApp}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-lg font-medium">Nenhuma dívida atrasada</p>
              <p className="text-muted-foreground">Este cliente não possui dívidas atrasadas</p>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="pendentes" className="mt-6">
          {dividasPendentes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dividasPendentes.map((divida) => (
                <DividaCard 
                  key={divida.id}
                  divida={divida}
                  onPagar={handleMarcarComoPaga}
                  onEnviarWhatsApp={handleEnviarWhatsApp}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-lg font-medium">Nenhuma dívida pendente</p>
              <p className="text-muted-foreground">Este cliente não possui dívidas pendentes</p>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="pagas" className="mt-6">
          {dividasPagas.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dividasPagas.map((divida) => (
                <DividaCard 
                  key={divida.id}
                  divida={divida}
                  onPagar={handleMarcarComoPaga}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-lg font-medium">Nenhuma dívida paga</p>
              <p className="text-muted-foreground">Este cliente ainda não pagou nenhuma dívida</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Dialog para editar cliente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize os dados do cliente
            </DialogDescription>
          </DialogHeader>
          <ClienteForm 
            cliente={cliente}
            onSubmit={handleAtualizarCliente}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Dialog para adicionar dívida */}
      <Dialog open={isDividaDialogOpen} onOpenChange={setIsDividaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Dívida</DialogTitle>
            <DialogDescription>
              Registre uma nova dívida para {cliente.nome}
            </DialogDescription>
          </DialogHeader>
          <DividaForm 
            cliente={cliente}
            onSubmit={handleCriarDivida}
            onCancel={() => setIsDividaDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Dialog para enviar mensagem WhatsApp */}
      <Dialog open={isWhatsAppDialogOpen} onOpenChange={setIsWhatsAppDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Cobrança via WhatsApp</DialogTitle>
            <DialogDescription>
              Personalize a mensagem de cobrança para envio
            </DialogDescription>
          </DialogHeader>
          <WhatsAppForm 
            cliente={cliente}
            divida={dividaSelecionada ? dividas.find(d => d.id === dividaSelecionada) : undefined}
            onEnviar={handleEnvioWhatsApp}
            onCancel={() => setIsWhatsAppDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClienteDetalhes;
