
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatarData } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface Mensagem {
  id: string;
  clienteId: string;
  clienteNome: string;
  dividaId: string | null;
  tipo: string;
  status: 'pendente' | 'enviado' | 'erro' | 'lido';
  dataEnvio: string;
}

interface HistoricoMensagensProps {
  mensagens: Mensagem[];
}

const HistoricoMensagens = ({ mensagens }: HistoricoMensagensProps) => {
  // Generate status badge based on message status
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'enviado':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Enviado
          </Badge>
        );
      case 'pendente':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pendente
          </Badge>
        );
      case 'erro':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Erro
          </Badge>
        );
      case 'lido':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Lido
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Mensagens</CardTitle>
        <CardDescription>
          Mensagens enviadas para clientes via WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mensagens.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mensagens.map((mensagem) => (
                <TableRow key={mensagem.id}>
                  <TableCell>{mensagem.clienteNome}</TableCell>
                  <TableCell>{mensagem.tipo === 'cobranca' ? 'Cobrança' : mensagem.tipo}</TableCell>
                  <TableCell>{formatarData(mensagem.dataEnvio)}</TableCell>
                  <TableCell>{renderStatusBadge(mensagem.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            Nenhuma mensagem enviada ainda
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricoMensagens;
