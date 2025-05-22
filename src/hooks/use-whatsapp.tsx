
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ConfiguracaoMensagem } from '@/types/whatsapp';

/**
 * Hook para gerenciar envio de mensagens via WhatsApp e configurações
 */
export const useWhatsApp = () => {
  const [mensagensEnviadas, setMensagensEnviadas] = useState<Record<string, { data: string }>>({});
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);
  const [envioAutomatico, setEnvioAutomatico] = useState(false);
  const { toast } = useToast();

  // Configurações iniciais para mensagens automáticas
  const [configuracao, setConfiguracao] = useState<ConfiguracaoMensagem>({
    templateMensagem: "Olá {NOME}, sua dívida de R$ {VALOR_ORIGINAL} venceu há {MESES_ATRASO} meses. Valor atualizado: R$ {VALOR_CORRIGIDO}. Entre em contato para quitação.",
    horarioEnvio: "09:00",
    limiteDiario: 50,
    diasSemana: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
  });

  /**
   * Enviar mensagem de cobrança via WhatsApp
   */
  const enviarCobranca = async (dividaId: string, numeroWhatsApp: string, mensagem: string) => {
    try {
      setEnviandoMensagem(true);
      
      // Simulação de envio (em um app real, isto seria uma chamada à API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    toast({
      title: ativo ? "Envio automático ativado" : "Envio automático desativado",
      description: ativo 
        ? "As mensagens serão enviadas automaticamente para clientes em atraso." 
        : "As mensagens precisarão ser enviadas manualmente.",
    });
  };

  return {
    mensagensEnviadas,
    enviandoMensagem,
    envioAutomatico,
    configuracao,
    enviarCobranca,
    verificarMensagemEnviada,
    alternarEnvioAutomatico,
    atualizarConfiguracao
  };
};
