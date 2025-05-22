
import { Button } from '@/components/ui/button';

interface FiltroMensagensProps {
  filtroAtual: string;
  onFiltroChange: (filtro: string) => void;
  totalDividas: number;
}

const FiltroMensagens = ({ filtroAtual, onFiltroChange, totalDividas }: FiltroMensagensProps) => {
  return (
    <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
      <div className="text-sm text-muted-foreground">
        {totalDividas} {totalDividas === 1 ? 'dívida atrasada' : 'dívidas atrasadas'}
      </div>
      
      <div className="flex gap-2">
        <Button
          variant={filtroAtual === 'todos' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFiltroChange('todos')}
        >
          Todos
        </Button>
        <Button
          variant={filtroAtual === 'pendentes' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFiltroChange('pendentes')}
        >
          Mensagem Pendente
        </Button>
        <Button
          variant={filtroAtual === 'enviadas' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFiltroChange('enviadas')}
        >
          Mensagem Enviada
        </Button>
      </div>
    </div>
  );
};

export default FiltroMensagens;
