
import { Button } from '@/components/ui/button';

interface MensagemVariaveisButtonsProps {
  onInserirVariavel: (variavel: string) => void;
}

/**
 * Botões para inserir variáveis na mensagem
 */
const MensagemVariaveisButtons = ({ onInserirVariavel }: MensagemVariaveisButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => onInserirVariavel("{NOME}")}>
        Nome
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => onInserirVariavel("{VALOR_ORIGINAL}")}>
        Valor Original
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => onInserirVariavel("{MESES_ATRASO}")}>
        Meses Atraso
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => onInserirVariavel("{VALOR_CORRIGIDO}")}>
        Valor Corrigido
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => onInserirVariavel("{DATA_VENCIMENTO}")}>
        Data Vencimento
      </Button>
    </div>
  );
};

export default MensagemVariaveisButtons;
