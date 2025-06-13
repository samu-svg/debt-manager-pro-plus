
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Cloud, 
  CloudOff, 
  Folder, 
  Download, 
  RefreshCw,
  AlertCircle 
} from 'lucide-react';
import { useLocalData } from '@/contexts/LocalDataContext';
import { useToast } from '@/hooks/use-toast';
import { formatarData } from '@/lib/utils';
import ConfiguracaoPastaModal from './ConfiguracaoPastaModal';

const SyncStatus = () => {
  const { statusSincronizacao, configurarPasta, sincronizar, criarBackup } = useLocalData();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);

  const handleConfigurarPasta = async () => {
    // Verificar se estamos em um ambiente que suporta a API
    if (window.location.hostname.includes('lovable.app')) {
      toast({
        title: 'Aviso',
        description: 'A configuração de pasta funciona apenas quando o app é acessado diretamente, não no preview.',
        variant: 'destructive',
      });
      return;
    }
    
    setShowModal(true);
  };

  const handleSincronizar = async () => {
    try {
      await sincronizar();
      toast({
        title: 'Sincronizado',
        description: 'Dados sincronizados com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro na sincronização',
        description: 'Não foi possível sincronizar os dados',
        variant: 'destructive',
      });
    }
  };

  const handleCriarBackup = async () => {
    try {
      await criarBackup();
      toast({
        title: 'Backup criado',
        description: 'Backup salvo na pasta configurada',
      });
    } catch (error) {
      toast({
        title: 'Erro no backup',
        description: 'Não foi possível criar o backup',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = () => {
    if (statusSincronizacao.erro) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Erro
        </Badge>
      );
    }

    if (statusSincronizacao.conectado) {
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-green-600">
          <Cloud className="h-3 w-3" />
          Conectado
        </Badge>
      );
    }

    if (statusSincronizacao.pastaConfigurada) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <CloudOff className="h-3 w-3" />
          Offline
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Folder className="h-3 w-3" />
        Não configurado
      </Badge>
    );
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {getStatusBadge()}
        
        {statusSincronizacao.ultimaSincronizacao && (
          <span className="text-xs text-muted-foreground hidden md:inline">
            {formatarData(statusSincronizacao.ultimaSincronizacao)}
          </span>
        )}
        
        <div className="flex items-center gap-1">
          {!statusSincronizacao.pastaConfigurada ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleConfigurarPasta}
              className="h-8"
            >
              <Folder className="h-4 w-4 mr-1" />
              Configurar
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSincronizar}
                className="h-8 w-8 p-0"
                title="Sincronizar"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCriarBackup}
                className="h-8 w-8 p-0"
                title="Criar backup"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleConfigurarPasta}
                className="h-8"
              >
                <Folder className="h-4 w-4 mr-1" />
                Trocar
              </Button>
            </>
          )}
        </div>
      </div>

      <ConfiguracaoPastaModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
};

export default SyncStatus;
