
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, MessageCircle, XCircle } from "lucide-react";

interface StatusConexaoProps {
  status: 'conectado' | 'desconectado' | 'verificando';
  onTestarConexao: () => Promise<void>;
}

const StatusConexao = ({ status, onTestarConexao }: StatusConexaoProps) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium">API WhatsApp:</span>
            {status === 'verificando' ? (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Verificando...
              </Badge>
            ) : status === 'conectado' ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Conectado
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Desconectado
              </Badge>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onTestarConexao}
            disabled={status === 'verificando'}
          >
            Testar Conexão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusConexao;
