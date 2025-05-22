
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Divida } from "@/types";
import { formatarMoeda, formatarData, calcularDividaCorrigida } from "@/lib/utils";
import { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";

interface DividaCardProps {
  divida: Divida;
  onPagar: (id: string) => void;
  onEnviarWhatsApp?: (id: string) => void;
}

const DividaCard = ({ divida, onPagar, onEnviarWhatsApp }: DividaCardProps) => {
  const [showJurosDialog, setShowJurosDialog] = useState(false);
  
  // Determinar estilo com base no status
  const getStatusStyle = () => {
    switch (divida.status) {
      case 'atrasado':
        return {
          bg: 'bg-danger-50',
          badge: 'destructive',
          label: 'Atrasado'
        };
      case 'pago':
        return {
          bg: 'bg-green-50',
          badge: 'outline',
          label: 'Pago'
        };
      default:
        return {
          bg: 'bg-white',
          badge: 'secondary',
          label: 'Pendente'
        };
    }
  };

  const statusStyle = getStatusStyle();
  
  // Calcular valor corrigido para dívidas atrasadas
  const valorCorrigido = divida.status === 'atrasado' 
    ? calcularDividaCorrigida(divida.valor, divida.dataVencimento) 
    : divida.valor;
  
  const temJuros = valorCorrigido > divida.valor;

  return (
    <Card className={`overflow-hidden transition-all ${divida.status === 'atrasado' ? 'border-danger-400' : ''}`}>
      <CardHeader className={statusStyle.bg}>
        <CardTitle className="flex justify-between items-center text-base">
          <span>{formatarMoeda(divida.valor)}</span>
          <Badge variant={statusStyle.badge as any}>{statusStyle.label}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Data da compra:</span>
            <span className="text-sm font-medium">{formatarData(divida.dataCompra)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Vencimento:</span>
            <span className="text-sm font-medium">{formatarData(divida.dataVencimento)}</span>
          </div>
          
          {temJuros && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-danger-600 font-medium">Valor corrigido:</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-danger-600">{formatarMoeda(valorCorrigido)}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full"
                  onClick={() => setShowJurosDialog(true)}
                >
                  <AlertTriangle className="h-4 w-4 text-danger-500" />
                </Button>
              </div>
            </div>
          )}
          
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">{divida.descricao}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        {divida.status !== 'pago' && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onPagar(divida.id)}
            >
              <Check className="h-4 w-4 mr-1" /> Marcar como pago
            </Button>
            
            {divida.status === 'atrasado' && onEnviarWhatsApp && (
              <Button 
                variant="default" 
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onEnviarWhatsApp(divida.id)}
              >
                Enviar cobrança
              </Button>
            )}
          </>
        )}
      </CardFooter>
      
      {/* Dialog para exibir detalhes do cálculo de juros */}
      <Dialog open={showJurosDialog} onOpenChange={setShowJurosDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do cálculo de juros</DialogTitle>
            <DialogDescription>
              Cálculo de juros compostos de 3% ao mês
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border rounded p-4 space-y-2">
              <div className="flex justify-between">
                <span>Valor original:</span>
                <span className="font-medium">{formatarMoeda(divida.valor)}</span>
              </div>
              <div className="flex justify-between">
                <span>Data de vencimento:</span>
                <span className="font-medium">{formatarData(divida.dataVencimento)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de juros:</span>
                <span className="font-medium">3% ao mês</span>
              </div>
              <div className="flex justify-between">
                <span>Valor dos juros:</span>
                <span className="font-medium text-danger-600">{formatarMoeda(valorCorrigido - divida.valor)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span>Valor corrigido:</span>
                <span className="font-bold text-danger-600">{formatarMoeda(valorCorrigido)}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowJurosDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DividaCard;
