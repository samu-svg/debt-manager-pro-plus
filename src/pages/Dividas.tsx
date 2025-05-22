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
import { Search, WhatsApp } from 'lucide-react';
import ConfiguracaoEnvioAutomatico from '@/components/whatsapp/ConfiguracaoEnvioAutomatico';
import EnvioCobrancaModal from '@/components/whatsapp/EnvioCobrancaModal';
import { useToast } from '@/hooks/use-toast';

const Dividas = () => {
  const { dividas, marcarComoPaga } = useDividas();
  const { clientes, getCliente } = useClientes();
  const [activeTab, setActiveTab] = useState('todas');
  const [busca, setBusca] = useState('');
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<string | null>(null);
  const [isDividaDialogOpen, setIsDividaDialogOpen] = useState(false);
  const [envioAutomatico, setEnvioAutomatico] = useState(false);
  const [filtroMensagens, setFiltroMensagens] = useState('todos');
  const [cobrancaModal, setCobrancaModal] = useState<{isOpen: boolean, dividaId: string | null}>({
    isOpen: false,
    dividaId: null
  });
  const { toast } = useToast();
  
  // Mock para registro de mensagens enviadas (em um app real, isso viria do banco de dados)
  const [mensagensEnviadas, setMensagensEnviadas] = useState<Record<string, { data: string }>>({});
  
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
  
  // Filtrar dívidas por status de mensagem
  const filtrarPorStatusMensagem = (dividasParaFiltrar: typeof dividas) => {
    if (filtroMensagens === 'todos') return dividasParaFiltrar;
    
    return dividasParaFiltrar.filter(divida => {
      const mensagemEnviada = mensagensEnviadas[divida.id];
      if (filtroMensagens === 'enviadas') return !!mensagemEnviada;
      if (filtroMensagens === 'pendentes') return !mensagemEnviada;
      return true;
    });
  };
  
  // Dividir dívidas por status para exibição
  const dividasAExibir = {
    todas: filtrarDividas(dividas),
    atrasadas: filtrarPorStatusMensagem(filtrarDividas(dividasAtrasadas)),
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
  
  // Abrir modal de envio de cobrança
  const handleAbrirEnvioCobranca = (dividaId: string) => {
    setCobrancaModal({
      isOpen: true,
      dividaId
    });
  };
  
  // Processar envio de cobrança
  const handleEnviarCobranca = (numeroWhatsApp: string, mensagem: string) => {
    if (!cobrancaModal.dividaId) return;
    
    // Em um app real, enviaria a mensagem para a API
    console.log(`Enviando cobrança para ${numeroWhatsApp}: ${mensagem}`);
    
    // Registrar que a mensagem foi enviada
    setMensagensEnviadas(prev => ({
      ...prev,
      [cobrancaModal.dividaId!]: {
        data: new Date().toISOString()
      }
    }));
    
    // Fechar o modal
    setCobrancaModal({ isOpen: false, dividaId: null });
    
    // Notificar usuário
    toast({
      title: "Mensagem enviada",
      description: "A cobrança foi enviada com sucesso para o WhatsApp do cliente.",
    });
  };
  
  // Toggle para envio automático
  const handleToggleEnvioAutomatico = (ativo: boolean) => {
    setEnvioAutomatico(ativo);
  };
  
  const getDivida = (id: string | null) => {
    if (!id) return null;
    return dividas.find(divida => divida.id === id) || null;
  };
  
  const getClienteFromDividaId = (dividaId: string | null) => {
    if (!dividaId) return null;
    const divida = getDivida(dividaId);
    if (!divida) return null;
    return getCliente(divida.clienteId);
  };
  
  // Renderizar a aba de dívidas atrasadas com funcionalidade de WhatsApp
  const renderAbaAtrasados = () => {
    return (
      <TabsContent value="atrasadas" className="mt-6">
        <ConfiguracaoEnvioAutomatico 
          envioAutomatico={envioAutomatico} 
          onToggleEnvioAutomatico={handleToggleEnvioAutomatico} 
        />
        
        <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {dividasAExibir.atrasadas.length} {dividasAExibir.atrasadas.length === 1 ? 'dívida atrasada' : 'dívidas atrasadas'}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filtroMensagens === 'todos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroMensagens('todos')}
            >
              Todos
            </Button>
            <Button
              variant={filtroMensagens === 'pendentes' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroMensagens('pendentes')}
            >
              Mensagem Pendente
            </Button>
            <Button
              variant={filtroMensagens === 'enviadas' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroMensagens('enviadas')}
            >
              Mensagem Enviada
            </Button>
          </div>
        </div>
        
        {dividasAExibir.atrasadas.length > 0 ? (
          <div className="space-y-4">
            {dividasAExibir.atrasadas.map((divida) => {
              const clienteNome = getClienteNome(divida.clienteId);
              const mensagemEnviada = mensagensEnviadas[divida.id];
              
              return (
                <Card key={divida.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">{formatarMoeda(divida.valor)}</h3>
                          <Badge variant="destructive">Atrasado</Badge>
                          {mensagemEnviada && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                              <WhatsApp className="h-3 w-3" />
                              Enviado
                            </Badge>
                          )}
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
                          <span className="text-danger-600 font-medium">
                            {formatarData(divida.dataVencimento)}
                          </span>
                        </div>
                        
                        <div className="pt-2 flex flex-wrap gap-2 md:justify-end">
                          {mensagemEnviada ? (
                            <div className="text-sm text-muted-foreground">
                              Enviado em {formatarData(mensagemEnviada.data)}
                            </div>
                          ) : (
                            <Button 
                              variant="default" 
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleAbrirEnvioCobranca(divida.id)}
                            >
                              <WhatsApp className="h-4 w-4 mr-1" />
                              Enviar Cobrança
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => marcarComoPaga(divida.id)}
                          >
                            Marcar como pago
                          </Button>
                          
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
            <p className="text-lg font-medium">Nenhuma dívida atrasada encontrada</p>
            <p className="text-muted-foreground">
              {busca ? 'Tente uma busca diferente ou limpe os filtros' : 'Não há dívidas atrasadas'}
            </p>
          </Card>
        )}
      </TabsContent>
    );
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
        
        {renderAbaAtrasados()}
        
        {/* Outras abas mantidas como antes */}
        <TabsContent value="todas" className="mt-6">
          {dividasAExibir.todas.length > 0 ? (
            <div className="space-y-4">
              {dividasAExibir.todas.map((divida) => {
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
        
        <TabsContent value="pendentes" className="mt-6">
          {dividasAExibir.pendentes.length > 0 ? (
            <div className="space-y-4">
              {dividasAExibir.pendentes.map((divida) => {
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
        
        <TabsContent value="pagas" className="mt-6">
          {dividasAExibir.pagas.length > 0 ? (
            <div className="space-y-4">
              {dividasAExibir.pagas.map((divida) => {
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
      </Tabs>
      
      {/* Modal para envio de cobrança */}
      {cobrancaModal.dividaId && (
        <EnvioCobrancaModal
          isOpen={cobrancaModal.isOpen}
          onClose={() => setCobrancaModal({ isOpen: false, dividaId: null })}
          cliente={getClienteFromDividaId(cobrancaModal.dividaId)!}
          divida={getDivida(cobrancaModal.dividaId)!}
          onEnviar={handleEnviarCobranca}
        />
      )}
      
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
