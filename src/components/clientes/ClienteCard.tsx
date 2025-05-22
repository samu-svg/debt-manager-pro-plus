
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cliente, Divida } from "@/types";
import { formatarCPF, formatarTelefone, formatarMoeda } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ClienteCardProps {
  cliente: Cliente;
  dividas: Divida[];
}

const ClienteCard = ({ cliente, dividas }: ClienteCardProps) => {
  // Cálculo de estatísticas
  const totalDividas = dividas.length;
  const dividasAtrasadas = dividas.filter(d => d.status === 'atrasado').length;
  const valorTotal = dividas.reduce((total, divida) => total + divida.valor, 0);
  const temDividaAtrasada = dividasAtrasadas > 0;

  return (
    <Card className={`overflow-hidden transition-all ${temDividaAtrasada ? 'border-danger-400' : ''}`}>
      <CardHeader className={`${temDividaAtrasada ? 'bg-danger-50' : 'bg-white'}`}>
        <CardTitle className="flex justify-between items-center">
          <span>{cliente.nome}</span>
          {temDividaAtrasada && (
            <Badge variant="destructive">Inadimplente</Badge>
          )}
        </CardTitle>
        <CardDescription>
          CPF: {formatarCPF(cliente.cpf)}
          <br />
          Tel: {formatarTelefone(cliente.telefone)}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total de dívidas:</span>
            <span className="font-medium">{totalDividas}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dívidas atrasadas:</span>
            <span className={`font-medium ${dividasAtrasadas > 0 ? 'text-danger-600' : ''}`}>
              {dividasAtrasadas}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Valor total:</span>
            <span className="font-medium">{formatarMoeda(valorTotal)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" asChild>
          <Link to={`/clientes/${cliente.id}`}>
            Ver detalhes
          </Link>
        </Button>
        <Button variant="default" asChild>
          <Link to={`/clientes/${cliente.id}`}>
            Gerenciar dívidas
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClienteCard;
