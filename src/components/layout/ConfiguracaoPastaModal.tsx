
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Folder, AlertCircle, CheckCircle2, HardDrive } from 'lucide-react';
import { useLocalData } from '@/contexts/LocalDataContext';
import { useToast } from '@/hooks/use-toast';

interface ConfiguracaoPastaModalProps {
  isOpen: boolean;
  onClose: () => void;
  isObrigatorio?: boolean;
}

const ConfiguracaoPastaModal = ({ isOpen, onClose, isObrigatorio = false }: ConfiguracaoPastaModalProps) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const { configurarPasta } = useLocalData();
  const { toast } = useToast();

  const handleConfigurarPasta = async () => {
    try {
      setIsConfiguring(true);
      console.log('Iniciando configuração da pasta...');
      
      await configurarPasta();
      
      toast({
        title: 'Pasta configurada com sucesso!',
        description: 'Seus dados serão sincronizados automaticamente.',
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao configurar pasta:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      // Se usuário cancelou, não mostrar como erro
      if (errorMessage.includes('AbortError') || errorMessage.includes('cancelou')) {
        console.log('Usuário cancelou a seleção da pasta');
        toast({
          title: 'Configuração cancelada',
          description: 'Você pode configurar a pasta local a qualquer momento.',
        });
      } else if (errorMessage.includes('Cross origin') || errorMessage.includes('SecurityError')) {
        toast({
          title: 'Funcionalidade não disponível',
          description: 'A seleção de pasta não funciona no ambiente de preview. Funciona normalmente quando o app é acessado diretamente.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro ao configurar pasta',
          description: `${errorMessage}. Verifique se seu navegador suporta a seleção de pastas.`,
          variant: 'destructive',
        });
      }
    } finally {
      setIsConfiguring(false);
    }
  };

  // Não mostrar se o navegador não suporta File System API
  if (!('showDirectoryPicker' in window)) {
    console.log('Navegador não suporta File System API');
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Se é obrigatório, não permitir fechar clicando fora
      if (!isObrigatorio && !open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            {isObrigatorio ? 'Configuração Obrigatória' : 'Configurar Pasta Local'}
          </DialogTitle>
          <DialogDescription>
            {isObrigatorio 
              ? 'Para backup automático dos seus dados, configure uma pasta local'
              : 'Configure uma pasta no seu computador para backup automático dos seus dados'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <strong>Vantagens:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Backup automático dos seus dados</li>
                <li>• Acesso aos dados mesmo offline</li>
                <li>• Sincronização entre dispositivos</li>
                <li>• Controle total dos seus arquivos</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Escolha uma pasta que você não vá deletar, como "Documentos" ou "Desktop". 
              Seus dados serão salvos em um arquivo chamado "devedores.json".
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={handleConfigurarPasta}
              disabled={isConfiguring}
              className="w-full"
            >
              <Folder className="mr-2 h-4 w-4" />
              {isConfiguring ? 'Configurando...' : 'Escolher Pasta'}
            </Button>
            
            {!isObrigatorio && (
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={isConfiguring}
                className="w-full"
              >
                Fechar
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Esta configuração pode ser alterada a qualquer momento através do ícone de sincronização no cabeçalho.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfiguracaoPastaModal;
