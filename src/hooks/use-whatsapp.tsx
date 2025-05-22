
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ConfiguracaoMensagem } from '@/types/whatsapp';
import { Cliente, Divida } from '@/types';
import { whatsAppService } from '@/services/whatsapp';
import { schedulerService } from '@/services/schedulerService';

/**
 * Hook para gerenciar envio de mensagens via WhatsApp e configurações
 */
export const useWhatsApp = () => {
  const [mensagensEnviadas, setMensagensEnviadas] = useState<Record<string, { data: string }>>({});
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);
  const [envioAutomatico, setEnvioAutomatico] = useState(false);
  const [statusConexao, setStatusConexao] = useState<'conectado' | 'desconectado' | 'verificando'>('verificando');
  const { toast } = useToast();

  // Configurações iniciais para mensagens automáticas
  const [configuracao, setConfiguracao] = useState<ConfiguracaoMensagem>({
    templateMensagem: "Olá {NOME}, sua dívida de {VALOR_ORIGINAL} venceu há {MESES_ATRASO} meses. Valor atualizado: {VALOR_CORRIGIDO}. Entre em contato para quitação.",
    horarioEnvio: "09:00",
    limiteDiario: 50,
    diasSemana: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
  });

  // Verificar status da API ao inicializar
  useEffect(() => {
    verificarStatusAPI();
    
    // Se envio automático estiver ativado, inicialize o scheduler
    if (envioAutomatico) {
      schedulerService.init(configuracao);
    }
    
    // Carregar mensagens enviadas do localStorage (apenas para demo)
    const savedMessages = localStorage.getItem('mensagensEnviadas');
    if (savedMessages) {
      try {
        setMensagensEnviadas(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Erro ao carregar mensagens do localStorage:', error);
      }
    }
    
    // Carregar configurações de envio automático do localStorage
    const savedConfig = localStorage.getItem('configuracaoEnvioAutomatico');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfiguracao(parsedConfig.configuracao);
        setEnvioAutomatico(parsedConfig.ativo || false);
        
        // Se estiver ativo, inicialize o scheduler
        if (parsedConfig.ativo) {
          schedulerService.init(parsedConfig.configuracao);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações do localStorage:', error);
      }
    }
  }, []);

  // Salvar mensagens no localStorage quando mudar (apenas para demo)
  useEffect(() => {
    localStorage.setItem('mensagensEnviadas', JSON.stringify(mensagensEnviadas));
  }, [mensagensEnviadas]);

  /**
   * Verificar status da conexão com a API do WhatsApp
   */
  const verificarStatusAPI = async () => {
    setStatusConexao('verificando');
    
    // Simula verificação de conexão
    // Em um cenário real, faria uma chamada de teste para a API
    setTimeout(() => {
      // Verificar se há token configurado
      const token = import.meta.env.VITE_WHATSAPP_TOKEN;
      
      if (token) {
        setStatusConexao('conectado');
      } else {
        setStatusConexao('desconectado');
        console.log('API do WhatsApp: Token não configurado. Usando modo de simulação.');
      }
    }, 1000);
  };

  /**
   * Enviar mensagem de cobrança via WhatsApp
   */
  const enviarCobranca = async (dividaId: string, numeroWhatsApp: string, mensagem: string) => {
    try {
      setEnviandoMensagem(true);
      
      // Buscar dados da dívida e cliente (em um app real, isto seria do backend)
      // Aqui estamos apenas simulando
      const divida = { id: dividaId } as Divida;
      const cliente = { id: 'cliente1', telefone: numeroWhatsApp } as Cliente;
      
      // Enviar mensagem usando o serviço
      const resultado = await whatsAppService.enviarMensagem(
        cliente, 
        divida, 
        mensagem,
        numeroWhatsApp
      );
      
      if (resultado.success) {
        // Registrar que a mensagem foi enviada
        setMensagensEnviadas(prev => ({
          ...prev,
          [dividaId]: {
            data: new Date().toISOString()
          }
        }));
        
        toast({
          title: "Mensagem enviada",
          description: "A cobrança foi enviada com sucesso para o WhatsApp do cliente.",
        });
        
        return true;
      } else {
        toast({
          title: "Erro ao enviar",
          description: resultado.error || "Não foi possível enviar a mensagem de cobrança.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar a mensagem de cobrança.",
        variant: "destructive",
      });
      return false;
    } finally {
      setEnviandoMensagem(false);
    }
  };

  /**
   * Verificar se uma mensagem já foi enviada para uma dívida
   */
  const verificarMensagemEnviada = (dividaId: string) => {
    return mensagensEnviadas[dividaId] || null;
  };

  /**
   * Atualizar configurações de mensagens automáticas
   */
  const atualizarConfiguracao = (novaConfiguracao: ConfiguracaoMensagem) => {
    setConfiguracao(novaConfiguracao);
    
    // Salvar no localStorage
    localStorage.setItem('configuracaoEnvioAutomatico', JSON.stringify({
      configuracao: novaConfiguracao,
      ativo: envioAutomatico
    }));
    
    // Atualizar scheduler se estiver ativo
    if (envioAutomatico) {
      schedulerService.init(novaConfiguracao);
    }
    
    toast({
      title: "Configurações atualizadas",
      description: "As configurações de mensagens automáticas foram atualizadas."
    });
  };

  /**
   * Ativar/Desativar envio automático de mensagens
   */
  const alternarEnvioAutomatico = (ativo: boolean) => {
    setEnvioAutomatico(ativo);
    
    // Salvar no localStorage
    localStorage.setItem('configuracaoEnvioAutomatico', JSON.stringify({
      configuracao,
      ativo
    }));
    
    if (ativo) {
      // Inicializar scheduler com as configurações
      schedulerService.init(configuracao);
      
      toast({
        title: "Envio automático ativado",
        description: "As mensagens serão enviadas automaticamente para clientes em atraso."
      });
    } else {
      // Parar scheduler
      schedulerService.clearAllTasks();
      
      toast({
        title: "Envio automático desativado",
        description: "As mensagens precisarão ser enviadas manualmente."
      });
    }
  };

  /**
   * Testar conexão com a API
   */
  const testarConexao = async () => {
    await verificarStatusAPI();
    
    toast({
      title: statusConexao === 'conectado' 
        ? "API Conectada" 
        : "API Desconectada",
      description: statusConexao === 'conectado'
        ? "A conexão com a API do WhatsApp está funcionando."
        : "Não foi possível conectar à API do WhatsApp. Verifique suas credenciais.",
      variant: statusConexao === 'conectado' ? "default" : "destructive"
    });
  };

  /**
   * Construir mensagem a partir do template
   */
  const construirMensagem = (cliente: Cliente, divida: Divida, template?: string) => {
    return whatsAppService.construirMensagemCobranca(cliente, divida, template);
  };

  return {
    mensagensEnviadas,
    enviandoMensagem,
    envioAutomatico,
    configuracao,
    statusConexao,
    enviarCobranca,
    verificarMensagemEnviada,
    alternarEnvioAutomatico,
    atualizarConfiguracao,
    testarConexao,
    construirMensagem
  };
};
