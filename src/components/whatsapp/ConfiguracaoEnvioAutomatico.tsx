
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Clock, Calendar } from 'lucide-react';
import ConfiguracoesMensagemModal from './ConfiguracoesMensagemModal';
import StatusConexao from './StatusConexao';
import { ConfiguracaoMensagem } from '@/types/whatsapp';
import { useToast } from '@/hooks/use-toast';

interface ConfiguracaoEnvioAutomaticoProps {
  envioAutomatico: boolean;
  onToggleEnvioAutomatico: (ativo: boolean) => void;
  configuracao?: ConfiguracaoMensagem;
  onSaveConfig?: (config: ConfiguracaoMensagem) => void;
  statusConexao?: 'conectado' | 'desconectado' | 'verificando';
  onTestarConexao?: () => Promise<void>;
}

const ConfiguracaoEnvioAutomatico = ({ 
  envioAutomatico,
  onToggleEnvioAutomatico,
  configuracao,
  onSaveConfig,
  statusConexao = 'desconectado',
  onTestarConexao = async () => {}
}: ConfiguracaoEnvioAutomaticoProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleToggle = (checked: boolean) => {
    onToggleEnvioAutomatico(checked);
  };

  const handleSaveConfig = (config: ConfiguracaoMensagem) => {
    if (onSaveConfig) {
      onSaveConfig(config);
    }
    
    toast({
      title: "Configurações salvas",
      description: "As configurações de mensagens foram atualizadas com sucesso.",
    });
    
    setIsModalOpen(false);
  };

  // Helper to map day numbers to names
  const mapDiasSemana = (dias: number[]) => {
    const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return dias.map(dia => nomesDias[dia]).join(', ');
  };

  return (
    <>
      {statusConexao && onTestarConexao && (
        <StatusConexao 
          status={statusConexao} 
          onTestarConexao={onTestarConexao} 
        />
      )}
      
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Switch 
                  id="envio-automatico"
                  checked={envioAutomatico}
                  onCheckedChange={handleToggle}
                />
                <Label htmlFor="envio-automatico" className="font-medium">
                  Envio Automático: {envioAutomatico ? "ATIVADO" : "DESATIVADO"}
                </Label>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsModalOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurar Mensagens
              </Button>
            </div>
            
            {configuracao && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-sm border-t">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Horário de envio:</span>
                  <span className="font-medium">{configuracao.horarioEnvio}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Dias de envio:</span>
                  <span className="font-medium">{mapDiasSemana(configuracao.diasSemana)}</span>
                </div>
                
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Limite diário:</span>
                  <span className="font-medium ml-2">{configuracao.limiteDiario} mensagens</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfiguracoesMensagemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveConfig}
        configuracaoInicial={configuracao}
      />
    </>
  );
};

export default ConfiguracaoEnvioAutomatico;
