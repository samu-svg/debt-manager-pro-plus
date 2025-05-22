
import { Card } from '@/components/ui/card';
import { Divida } from '@/types';
import DividaPadraoCard from './DividaPadraoCard';

interface TabPadraoProps {
  dividas: Divida[];
  getClienteNome: (id: string) => string;
  onMarcarComoPaga: (id: string) => void;
  busca: string;
  tipoTab: string;
}

const TabPadrao = ({
  dividas,
  getClienteNome,
  onMarcarComoPaga,
  busca,
  tipoTab
}: TabPadraoProps) => {
  return (
    <>
      {dividas.length > 0 ? (
        <div className="space-y-4">
          {dividas.map((divida) => (
            <DividaPadraoCard 
              key={divida.id}
              divida={divida}
              clienteNome={getClienteNome(divida.clienteId)}
              onMarcarComoPaga={onMarcarComoPaga}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-lg font-medium">Nenhuma dívida encontrada</p>
          <p className="text-muted-foreground">
            {busca ? 'Tente uma busca diferente ou limpe os filtros' : `Não há dívidas nesta categoria`}
          </p>
        </Card>
      )}
    </>
  );
};

export default TabPadrao;
