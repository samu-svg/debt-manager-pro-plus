
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
