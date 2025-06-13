
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Folder, AlertCircle, CheckCircle2, HardDrive } from 'lucide-react';
import { useLocalData } from '@/contexts/LocalDataContext';
import { useToast } from '@/hooks/use-toast';

const ConfiguracaoPastaModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const { statusSincronizacao, configurarPasta } = useLocalData();
  const { toast } = useToast();

  // Verificar se é o primeiro acesso
  useEffect(() => {
    const primeiroAcesso = localStorage.getItem('devedores_primeiro_acesso');
    const suportaFileSystem = 'showDirectoryPicker' in window;
    
    console.log('Verificando primeiro acesso:', { primeiroAcesso, suportaFileSystem });
    
    if (!primeiroAcesso && suportaFileSystem && !statusSincronizacao.pastaConfigurada) {
      console.log('Abrindo modal de configuração da pasta');
      setIsOpen(true);
    }
  }, [statusSincronizacao.pastaConfigurada]);

  const handleConfigurarPasta = async () => {
    try {
      setIsConfiguring(true);
      console.log('Iniciando configuração da pasta...');
      
      await configurarPasta();
      
      // Marcar que já passou pelo primeiro acesso
      localStorage.setItem('devedores_primeiro_acesso', 'true');
      
      toast({
        title: 'Pasta configurada com sucesso!',
        description: 'Seus dados serão sincronizados automaticamente.',
      });
      
      setIsOpen(false);
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

  const handlePularConfiguracao = () => {
    localStorage.setItem('devedores_primeiro_acesso', 'true');
    setIsOpen(false);
    
    toast({
      title: 'Configuração adiada',
      description: 'Você pode configurar a pasta local a qualquer momento no cabeçalho.',
    });
  };

  // Não mostrar se o navegador não suporta File System API
  if (!('showDirectoryPicker' in window)) {
    console.log('Navegador não suporta File System API');
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Permitir fechar apenas se não estiver configurando
      if (!isConfiguring) {
        setIsOpen(open);
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            Configurar Pasta Local
          </DialogTitle>
          <DialogDescription>
            Configure uma pasta no seu computador para backup automático dos seus dados
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
            
            <Button 
              variant="outline" 
              onClick={handlePularConfiguracao}
              disabled={isConfiguring}
              className="w-full"
            >
              Configurar Depois
            </Button>
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
