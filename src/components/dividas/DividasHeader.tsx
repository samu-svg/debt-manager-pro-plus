
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface DividasHeaderProps {
  busca: string;
  onBuscaChange: (value: string) => void;
}

const DividasHeader = ({ busca, onBuscaChange }: DividasHeaderProps) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dívidas</h1>
        <div className="flex items-center gap-2">
          <Link to="/calculadora">
            <Button variant="outline">Calculadora de Juros</Button>
          </Link>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por cliente ou descrição..."
            className="pl-8"
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export default DividasHeader;
