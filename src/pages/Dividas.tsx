
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDividas } from '@/hooks/use-dividas';
import { useClientes } from '@/hooks/use-clientes';
import DividaForm from '@/components/dividas/DividaForm';
import { useWhatsApp } from '@/hooks/use-whatsapp';
import EnvioCobrancaModal from '@/components/whatsapp/EnvioCobrancaModal';
import { useDividaFiltros } from '@/hooks/use-divida-filtros';
import DividasHeader from '@/components/dividas/DividasHeader';
import TabAtrasadas from '@/components/dividas/TabAtrasadas';
import TabPadrao from '@/components/dividas/TabPadrao';

const Dividas = () => {
  const { dividas, marcarComoPaga } = useDividas();
  const { clientes, getCliente } = useClientes();
  const { mensagensEnviadas, envioAutomatico, alternarEnvioAutomatico, enviarCobranca } = useWhatsApp();
  
  const [activeTab, setActiveTab] = useState('todas');
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<string | null>(null);
  const [isDividaDialogOpen, setIsDividaDialogOpen] = useState(false);
  const [cobrancaModal, setCobrancaModal] = useState<{isOpen: boolean, dividaId: string | null}>({
    isOpen: false,
    dividaId: null
  });
  
  // Obter cliente por ID
  const getClienteNome = (clienteId: string) => {
    const cliente = getCliente(clienteId);
    return cliente ? cliente.nome : 'Cliente não encontrado';
  };
  
  // Hook para filtros de dívidas
  const { 
    busca, 
    setBusca, 
    filtroMensagens, 
    setFiltroMensagens,
    dividasAtrasadas,
    dividasPendentes, 
    dividasPagas,
    filtrarDividas, 
    filtrarPorStatusMensagem 
  } = useDividaFiltros({ 
    dividas, 
    getClienteNome 
  });
  
  // Dividir dívidas por status para exibição
  const dividasAExibir = {
    todas: filtrarDividas(dividas),
    atrasadas: filtrarPorStatusMensagem(filtrarDividas(dividasAtrasadas), mensagensEnviadas),
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
    enviarCobranca(cobrancaModal.dividaId, numeroWhatsApp, mensagem);
    setCobrancaModal({ isOpen: false, dividaId: null });
  };
  
  // Toggle para envio automático
  const handleToggleEnvioAutomatico = (ativo: boolean) => {
    alternarEnvioAutomatico(ativo);
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
  
  return (
    <div className="space-y-6">
      <DividasHeader busca={busca} onBuscaChange={setBusca} />
      
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
        
        <TabsContent value="atrasadas" className="mt-6">
          <TabAtrasadas
            dividas={dividasAExibir.atrasadas}
            getClienteNome={getClienteNome}
            mensagensEnviadas={mensagensEnviadas}
            envioAutomatico={envioAutomatico}
            onToggleEnvioAutomatico={handleToggleEnvioAutomatico}
            filtroMensagens={filtroMensagens}
            onFiltroChange={setFiltroMensagens}
            onMarcarComoPaga={marcarComoPaga}
            onAbrirEnvioCobranca={handleAbrirEnvioCobranca}
          />
        </TabsContent>
        
        <TabsContent value="todas" className="mt-6">
          <TabPadrao
            dividas={dividasAExibir.todas}
            getClienteNome={getClienteNome}
            onMarcarComoPaga={marcarComoPaga}
            busca={busca}
            tipoTab="todas"
          />
        </TabsContent>
        
        <TabsContent value="pendentes" className="mt-6">
          <TabPadrao
            dividas={dividasAExibir.pendentes}
            getClienteNome={getClienteNome}
            onMarcarComoPaga={marcarComoPaga}
            busca={busca}
            tipoTab="pendentes"
          />
        </TabsContent>
        
        <TabsContent value="pagas" className="mt-6">
          <TabPadrao
            dividas={dividasAExibir.pagas}
            getClienteNome={getClienteNome}
            onMarcarComoPaga={marcarComoPaga}
            busca={busca}
            tipoTab="pagas"
          />
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
