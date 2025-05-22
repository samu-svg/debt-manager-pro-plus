
import { Card } from '@/components/ui/card';
import { Divida } from '@/types';
import FiltroMensagens from './FiltroMensagens';
import DividaAtrasadaCard from './DividaAtrasadaCard';
import ConfiguracaoEnvioAutomatico from '@/components/whatsapp/ConfiguracaoEnvioAutomatico';

interface TabAtrasadasProps {
  dividas: Divida[];
  getClienteNome: (id: string) => string;
  mensagensEnviadas: Record<string, { data: string }>;
  envioAutomatico: boolean;
  onToggleEnvioAutomatico: (ativo: boolean) => void;
  filtroMensagens: string;
  onFiltroChange: (filtro: string) => void;
  onMarcarComoPaga: (id: string) => void;
  onAbrirEnvioCobranca: (id: string) => void;
}

const TabAtrasadas = ({
  dividas,
  getClienteNome,
  mensagensEnviadas,
  envioAutomatico,
  onToggleEnvioAutomatico,
  filtroMensagens,
  onFiltroChange,
  onMarcarComoPaga,
  onAbrirEnvioCobranca
}: TabAtrasadasProps) => {
  return (
    <>
      <ConfiguracaoEnvioAutomatico 
        envioAutomatico={envioAutomatico} 
        onToggleEnvioAutomatico={onToggleEnvioAutomatico} 
      />
      
      <FiltroMensagens 
        filtroAtual={filtroMensagens}
        onFiltroChange={onFiltroChange}
        totalDividas={dividas.length}
      />
      
      {dividas.length > 0 ? (
        <div className="space-y-4">
          {dividas.map((divida) => (
            <DividaAtrasadaCard 
              key={divida.id}
              divida={divida}
              clienteNome={getClienteNome(divida.clienteId)}
              mensagemEnviada={mensagensEnviadas[divida.id] || null}
              onMarcarComoPaga={onMarcarComoPaga}
              onAbrirEnvioCobranca={onAbrirEnvioCobranca}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-lg font-medium">Nenhuma dívida atrasada encontrada</p>
          <p className="text-muted-foreground">
            Não há dívidas atrasadas no momento
          </p>
        </Card>
      )}
    </>
  );
};

export default TabAtrasadas;
