
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatarMoeda, formatarData } from '@/lib/utils';
import { Divida, StatusPagamento } from '@/types';

interface DividaPadraoCardProps {
  divida: Divida;
  clienteNome: string;
  onMarcarComoPaga: (id: string) => void;
}

const DividaPadraoCard = ({ divida, clienteNome, onMarcarComoPaga }: DividaPadraoCardProps) => {
  // Helper para determinar variant do badge
  const getBadgeVariant = (status: StatusPagamento) => {
    switch (status) {
      case 'atrasado': return 'destructive';
      case 'pago': return 'outline';
      default: return 'secondary';
    }
  };

  // Helper para determinar texto do badge
  const getBadgeText = (status: StatusPagamento) => {
    switch (status) {
      case 'atrasado': return 'Atrasado';
      case 'pago': return 'Pago';
      default: return 'Pendente';
    }
  };

  return (
    <Card key={divida.id}>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-lg">{formatarMoeda(divida.valor)}</h3>
              <Badge variant={getBadgeVariant(divida.status)}>
                {getBadgeText(divida.status)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{divida.descricao}</p>
            <p className="text-sm">
              <span className="font-medium">Cliente: </span>
              <Link to={`/clientes/${divida.clienteId}`} className="text-cobalt-600 hover:underline">
                {clienteNome}
              </Link>
            </p>
          </div>
          
          <div className="space-y-1 md:text-right">
            <div className="text-sm">
              <span className="text-muted-foreground">Data da compra: </span>
              {formatarData(divida.dataCompra)}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Vencimento: </span>
              <span className={divida.status === 'atrasado' ? 'text-danger-600 font-medium' : ''}>
                {formatarData(divida.dataVencimento)}
              </span>
            </div>
            
            <div className="pt-2 flex gap-2 md:justify-end">
              {divida.status !== 'pago' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onMarcarComoPaga(divida.id)}
                >
                  Marcar como pago
                </Button>
              )}
              <Button 
                variant="default" 
                size="sm"
                asChild
              >
                <Link to={`/clientes/${divida.clienteId}`}>
                  Ver cliente
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DividaPadraoCard;
