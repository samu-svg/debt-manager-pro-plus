
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  MoreVertical,
  CheckCircle 
} from 'lucide-react';
import { formatarMoeda, formatarData } from '@/lib/utils';
import { Divida } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DividaAtrasadaCardProps {
  divida: Divida;
  clienteNome: string;
  mensagemEnviada: { data: string } | null;
  onMarcarComoPaga: (id: string) => void;
  onAbrirEnvioCobranca: (dividaId: string) => void;
}

const DividaAtrasadaCard = ({ 
  divida, 
  clienteNome, 
  mensagemEnviada, 
  onMarcarComoPaga,
  onAbrirEnvioCobranca 
}: DividaAtrasadaCardProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Card key={divida.id}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between md:justify-start gap-2">
                <h3 className="font-medium text-lg">{formatarMoeda(divida.valor)}</h3>
                <div className="flex items-center gap-1">
                  <Badge variant="destructive">Atrasado</Badge>
                  {mensagemEnviada && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span className="hidden md:inline">Enviado</span>
                    </Badge>
                  )}
                </div>
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
                <span className="text-danger-600 font-medium">
                  {formatarData(divida.dataVencimento)}
                </span>
              </div>
              
              {isMobile ? (
                <div className="pt-2 flex justify-between">
                  {mensagemEnviada ? (
                    <div className="text-xs text-muted-foreground">
                      Enviado em {formatarData(mensagemEnviada.data)}
                    </div>
                  ) : (
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 h-10"
                      onClick={() => onAbrirEnvioCobranca(divida.id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Cobrar
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-10 w-10">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onMarcarComoPaga(divida.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar como pago
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/clientes/${divida.clienteId}`}>
                          Ver cliente
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="pt-2 flex flex-wrap gap-2 md:justify-end">
                  {mensagemEnviada ? (
                    <div className="text-sm text-muted-foreground">
                      Enviado em {formatarData(mensagemEnviada.data)}
                    </div>
                  ) : (
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => onAbrirEnvioCobranca(divida.id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Enviar Cobrança
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onMarcarComoPaga(divida.id)}
                  >
                    Marcar como pago
                  </Button>
                  
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
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DividaAtrasadaCard;
