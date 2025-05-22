
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Cliente, Divida } from '@/types';
import { formatarMoeda, formatarData } from '@/lib/utils';

interface PreviewCobrancaProps {
  cliente: Cliente;
  divida: Divida;
  mesesAtraso: number;
  valorCorrigido: number;
  visualizarPreview: boolean;
  setVisualizarPreview: (value: boolean) => void;
}

const PreviewCobranca = ({
  cliente,
  divida,
  mesesAtraso,
  valorCorrigido,
  visualizarPreview,
  setVisualizarPreview
}: PreviewCobrancaProps) => {
  if (!visualizarPreview) return null;

  return (
    <Alert>
      <div className="space-y-2">
        <h4 className="font-medium">Detalhes da cobrança:</h4>
        <div className="text-sm space-y-1">
          <p><span className="font-medium">Cliente:</span> {cliente.nome}</p>
          <p><span className="font-medium">CPF:</span> {cliente.cpf}</p>
          <p><span className="font-medium">Valor original:</span> {formatarMoeda(divida.valor)}</p>
          <p><span className="font-medium">Data vencimento:</span> {formatarData(divida.dataVencimento)}</p>
          <p><span className="font-medium">Meses em atraso:</span> {mesesAtraso} {mesesAtraso === 1 ? 'mês' : 'meses'}</p>
          <p><span className="font-medium">Valor corrigido:</span> {formatarMoeda(valorCorrigido)}</p>
        </div>
        
        {/* WhatsApp preview */}
        <div className="mt-4 border rounded-lg p-3 bg-green-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">
              WA
            </div>
            <div>
              <div className="text-sm font-medium">WhatsApp</div>
              <div className="text-xs text-muted-foreground">{cliente.telefone || '(XX) XXXXX-XXXX'}</div>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <p className="text-sm">
              Olá {cliente.nome}, identificamos que sua dívida no valor de {formatarMoeda(divida.valor)} venceu há {mesesAtraso} {mesesAtraso === 1 ? 'mês' : 'meses'}. O valor atualizado para pagamento é de {formatarMoeda(valorCorrigido)}. Entre em contato conosco para regularizar sua situação.
            </p>
          </div>
        </div>
      </div>
      <AlertDescription className="mt-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="preview-switch" className="cursor-pointer">Mostrar preview</Label>
          <Switch 
            id="preview-switch" 
            checked={visualizarPreview}
            onCheckedChange={setVisualizarPreview}
          />
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default PreviewCobranca;
