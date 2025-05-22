
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { useWhatsApp } from '@/hooks/use-whatsapp';
import ConfiguracaoEnvioAutomatico from '@/components/whatsapp/ConfiguracaoEnvioAutomatico';
import HistoricoMensagens from '@/components/whatsapp/HistoricoMensagens';
import { MessageCircle, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const WhatsAppDashboard = () => {
  const { 
    envioAutomatico, 
    alternarEnvioAutomatico, 
    configuracao, 
    atualizarConfiguracao,
    statusConexao,
    testarConexao,
  } = useWhatsApp();
  
  // Estatísticas fictícias para demonstração
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    enviadas: 0,
    lidas: 0,
    erros: 0
  });
  
  // Dados fictícios de mensagens para demonstração
  const [mensagens, setMensagens] = useState<any[]>([]);
  
  // Carregar dados fictícios para demonstração
  useEffect(() => {
    // Simular carregamento de estatísticas
    setTimeout(() => {
      setEstatisticas({
        total: 57,
        enviadas: 42,
        lidas: 35,
        erros: 3
      });
      
      // Simular carregamento de mensagens
      setMensagens([
        {
          id: '1',
          clienteId: '101',
          clienteNome: 'Maria Silva',
          dividaId: '201',
          tipo: 'cobranca',
          status: 'lido',
          dataEnvio: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // ontem
        },
        {
          id: '2',
          clienteId: '102',
          clienteNome: 'João Santos',
          dividaId: '202',
          tipo: 'cobranca',
          status: 'enviado',
          dataEnvio: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 dias atrás
        },
        {
          id: '3',
          clienteId: '103',
          clienteNome: 'Ana Oliveira',
          dividaId: '203',
          tipo: 'cobranca',
          status: 'erro',
          dataEnvio: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 dias atrás
        },
        {
          id: '4',
          clienteId: '104',
          clienteNome: 'Pedro Costa',
          dividaId: '204',
          tipo: 'cobranca',
          status: 'pendente',
          dataEnvio: new Date(Date.now()).toISOString() // hoje
        }
      ]);
    }, 1000);
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard WhatsApp</h1>
          <p className="text-muted-foreground">
            Monitore e gerencie as mensagens automáticas de cobrança
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">Exportar Relatório</Button>
          <Button>Envio Manual</Button>
        </div>
      </div>
      
      <ConfiguracaoEnvioAutomatico 
        envioAutomatico={envioAutomatico}
        onToggleEnvioAutomatico={alternarEnvioAutomatico}
        configuracao={configuracao}
        onSaveConfig={atualizarConfiguracao}
        statusConexao={statusConexao}
        onTestarConexao={testarConexao}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total de Mensagens"
          value={estatisticas.total.toString()}
          icon={<MessageCircle className="h-5 w-5 text-blue-600" />}
          className="border border-blue-100"
        />
        
        <DashboardCard
          title="Mensagens Enviadas"
          value={estatisticas.enviadas.toString()}
          description={`${Math.round((estatisticas.enviadas / Math.max(1, estatisticas.total)) * 100)}% do total`}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          className="border border-green-100"
        />
        
        <DashboardCard
          title="Mensagens Lidas"
          value={estatisticas.lidas.toString()}
          description={`${Math.round((estatisticas.lidas / Math.max(1, estatisticas.enviadas)) * 100)}% de visualização`}
          icon={<CheckCircle2 className="h-5 w-5 text-cobalt-600" />}
          className="border border-cobalt-100"
        />
        
        <DashboardCard
          title="Erros de Envio"
          value={estatisticas.erros.toString()}
          description={estatisticas.erros > 0 ? "Ação necessária" : "Nenhum erro reportado"}
          icon={<AlertCircle className="h-5 w-5 text-danger-600" />}
          className="border border-danger-100"
        />
      </div>
      
      <HistoricoMensagens mensagens={mensagens} />
    </div>
  );
};

export default WhatsAppDashboard;
