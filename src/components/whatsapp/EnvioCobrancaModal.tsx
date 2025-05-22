
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle } from 'lucide-react';
import WhatsAppForm from './WhatsAppForm';
import PreviewCobranca from './PreviewCobranca';
import { Cliente, Divida } from '@/types';
import { calcularMesesAtraso, calcularDividaCorrigida } from '@/lib/utils';

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
          <PreviewCobranca 
            cliente={cliente}
            divida={divida}
            mesesAtraso={mesesAtraso}
            valorCorrigido={valorCorrigido}
            visualizarPreview={visualizarPreview}
            setVisualizarPreview={setVisualizarPreview}
          />

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
