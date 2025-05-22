
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import ConfiguracoesMensagemModal from './ConfiguracoesMensagemModal';
import { useToast } from '@/hooks/use-toast';

interface ConfiguracaoEnvioAutomaticoProps {
  envioAutomatico: boolean;
  onToggleEnvioAutomatico: (ativo: boolean) => void;
}

const ConfiguracaoEnvioAutomatico = ({ 
  envioAutomatico,
  onToggleEnvioAutomatico
}: ConfiguracaoEnvioAutomaticoProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleToggle = (checked: boolean) => {
    onToggleEnvioAutomatico(checked);
    
    toast({
      title: checked ? "Envio automático ativado" : "Envio automático desativado",
      description: checked 
        ? "As mensagens serão enviadas automaticamente para clientes em atraso."
        : "As mensagens precisarão ser enviadas manualmente.",
    });
  };

  const handleSaveConfig = (config: any) => {
    console.log("Configurações salvas:", config);
    // Aqui você salvaria as configurações no backend
    
    toast({
      title: "Configurações salvas",
      description: "As configurações de mensagens foram atualizadas com sucesso.",
    });
    
    setIsModalOpen(false);
  };

  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Switch 
                id="envio-automatico"
                checked={envioAutomatico}
                onCheckedChange={handleToggle}
              />
              <Label htmlFor="envio-automatico" className="font-medium">
                Envio Automático de Cobranças: {envioAutomatico ? "ATIVADO" : "DESATIVADO"}
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsModalOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurar Mensagens
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfiguracoesMensagemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveConfig}
      />
    </>
  );
};

export default ConfiguracaoEnvioAutomatico;
