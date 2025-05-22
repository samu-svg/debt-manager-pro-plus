import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MessageCircle, Send } from 'lucide-react';
import WhatsAppForm from './WhatsAppForm';
import { Cliente, Divida } from '@/types';
import { formatarMoeda, formatarData, calcularMesesAtraso, calcularDividaCorrigida } from '@/lib/utils';

interface EnvioCobrancaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente;
  divida: Divida;
  onEnviar: (numeroWhatsApp: string, mensagem: string) => void;
}

const EnvioCobrancaModal = ({ isOpen, onClose, cliente, divida, onEnviar }: EnvioCobrancaModalProps) => {
  const [visualizarPreview, setVisualizarPreview] = useState(true);
  
  // Cálculos para a dívida
  const mesesAtraso = calcularMesesAtraso(divida.dataVencimento);
  const valorCorrigido = calcularDividaCorrigida(
    divida.valor, 
    divida.dataVencimento, 
    divida.taxaJuros || 3, 
    divida.mesInicioJuros || '2º mês'
  );

  // Mensagem padrão formatada
  const mensagemPadrao = `Olá ${cliente.nome}, sua dívida de ${formatarMoeda(divida.valor)} venceu há ${mesesAtraso} ${mesesAtraso === 1 ? 'mês' : 'meses'}. Valor atualizado: ${formatarMoeda(valorCorrigido)}. Entre em contato para quitação.`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Enviar Cobrança via WhatsApp
          </DialogTitle>
          <DialogDescription>
            Envie uma mensagem de cobrança para o cliente com os detalhes da dívida.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {visualizarPreview && (
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
          )}

          <WhatsAppForm 
            cliente={cliente}
            divida={divida}
            onEnviar={onEnviar}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnvioCobrancaModal;
