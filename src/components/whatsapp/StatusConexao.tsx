
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, MessageCircle, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface StatusConexaoProps {
  status: 'conectado' | 'desconectado' | 'verificando';
  onTestarConexao: () => Promise<void>;
}

const StatusConexao = ({ status, onTestarConexao }: StatusConexaoProps) => {
  const [isEvolutionApi, setIsEvolutionApi] = useState(false);
  const [evolutionManagerUrl, setEvolutionManagerUrl] = useState('');
  
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_WHATSAPP_API_URL;
    if (apiUrl && !apiUrl.includes('api.whatsapp.com')) {
      setIsEvolutionApi(true);
      setEvolutionManagerUrl(`${apiUrl}/manager`);
    }
  }, []);

  const handleTestarConexao = async () => {
    await onTestarConexao();
  };
  
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium">API WhatsApp:</span>
            {status === 'verificando' ? (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
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
            
            {isEvolutionApi && (
              <a 
                href={evolutionManagerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-xs text-blue-600 hover:underline"
              >
                Gerenciador Evolution API
              </a>
            )}
          </div>
          
          <div className="flex gap-2">
            {isEvolutionApi && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(evolutionManagerUrl, '_blank')}
              >
                Abrir Gerenciador
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleTestarConexao}
              disabled={status === 'verificando'}
            >
              Testar Conexão
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusConexao;
