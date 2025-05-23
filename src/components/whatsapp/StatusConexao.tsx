
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, MessageCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { whatsappBusinessApi } from "@/services/whatsappBusinessApi";

interface StatusConexaoProps {
  status: 'conectado' | 'desconectado' | 'verificando';
  onTestarConexao: () => Promise<void>;
}

const StatusConexao = ({ status, onTestarConexao }: StatusConexaoProps) => {
  const [isEvolutionApi, setIsEvolutionApi] = useState(false);
  const [isBusinessApi, setIsBusinessApi] = useState(false);
  const [evolutionManagerUrl, setEvolutionManagerUrl] = useState('');
  const [businessApiConfigured, setBusinessApiConfigured] = useState(false);
  
  useEffect(() => {
    // Check if Evolution API is configured
    const evolutionApiUrl = import.meta.env.VITE_WHATSAPP_API_URL;
    if (evolutionApiUrl && !evolutionApiUrl.includes('api.whatsapp.com') && !evolutionApiUrl.includes('graph.facebook.com')) {
      setIsEvolutionApi(true);
      setEvolutionManagerUrl(`${evolutionApiUrl}/manager`);
    }
    
    // Check if WhatsApp Business API is configured
    const businessApiConfigured = whatsappBusinessApi.isConfigured();
    setIsBusinessApi(businessApiConfigured);
    setBusinessApiConfigured(businessApiConfigured);
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
            
            {isBusinessApi && (
              <a 
                href="https://business.facebook.com/settings/whatsapp-business-accounts"
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-xs text-blue-600 hover:underline"
              >
                WhatsApp Business Manager
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
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Gerenciador
              </Button>
            )}
            
            {isBusinessApi && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://business.facebook.com/settings/whatsapp-business-accounts", '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Meta Business
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
        
        {/* API Information */}
        <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <div>
              <span className="font-medium">Tipo API:</span>{' '}
              {isBusinessApi 
                ? 'WhatsApp Business Cloud API (Meta)' 
                : isEvolutionApi 
                ? 'Evolution API' 
                : 'Não configurada'}
            </div>
            {businessApiConfigured && (
              <div>
                <span className="font-medium">Status:</span> Verificado
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusConexao;
