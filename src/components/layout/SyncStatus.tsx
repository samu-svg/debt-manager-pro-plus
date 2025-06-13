
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Cloud, 
  CloudOff, 
  Folder, 
  Download, 
  RefreshCw,
  AlertCircle,
  HardDrive
} from 'lucide-react';
import { useLocalData } from '@/contexts/LocalDataContext';
import { useToast } from '@/hooks/use-toast';
import { formatarData } from '@/lib/utils';
import ConfiguracaoPastaModal from './ConfiguracaoPastaModal';
import * as FileSystem from '@/services/fileSystem.service';

const SyncStatus = () => {
  const { 
    statusSincronizacao, 
    configurarPasta, 
    sincronizar, 
    criarBackup,
    mostrarConfiguracao,
    setMostrarConfiguracao
  } = useLocalData();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);

  const funcionalidadeDisponivel = FileSystem.funcionalidadeDisponivel();

  const handleConfigurarPasta = async () => {
    if (!funcionalidadeDisponivel) {
      toast({
        title: 'Funcionalidade não disponível',
        description: 'Use Chrome, Edge ou Opera e acesse o app diretamente (não no preview).',
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
    if (!funcionalidadeDisponivel) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <CloudOff className="h-3 w-3" />
          Navegador não suporta
        </Badge>
      );
    }

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
          Pasta: Configurada ✓
        </Badge>
      );
    }

    if (statusSincronizacao.pastaConfigurada) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <CloudOff className="h-3 w-3" />
          Reconectando...
        </Badge>
      );
    }

    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <HardDrive className="h-3 w-3" />
        Pasta: Não configurada
      </Badge>
    );
  };

  const getStatusText = () => {
    if (!funcionalidadeDisponivel) {
      return 'Use Chrome/Edge para backup local';
    }
    
    if (statusSincronizacao.pastaConfigurada) {
      return 'Backup automático ativo';
    }
    
    return 'Configure pasta para backup';
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
          {funcionalidadeDisponivel && !statusSincronizacao.pastaConfigurada ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleConfigurarPasta}
              className="h-8 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            >
              <Folder className="h-4 w-4 mr-1" />
              Configurar Pasta
            </Button>
          ) : funcionalidadeDisponivel && statusSincronizacao.pastaConfigurada ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSincronizar}
                className="h-8 w-8 p-0"
                title="Sincronizar agora"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCriarBackup}
                className="h-8 w-8 p-0"
                title="Criar backup manual"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleConfigurarPasta}
                className="h-8"
                title="Trocar pasta"
              >
                <Folder className="h-4 w-4 mr-1" />
                Trocar
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="text-xs text-muted-foreground hidden md:block">
        {getStatusText()}
      </div>

      {/* Modal de configuração obrigatório */}
      <ConfiguracaoPastaModal 
        isOpen={mostrarConfiguracao || showModal} 
        onClose={() => {
          setMostrarConfiguracao(false);
          setShowModal(false);
        }}
        isObrigatorio={mostrarConfiguracao}
      />
    </>
  );
};

export default SyncStatus;
