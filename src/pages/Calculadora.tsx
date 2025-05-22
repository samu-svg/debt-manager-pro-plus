
import CalculadoraJuros from '@/components/calculadora/CalculadoraJuros';

const Calculadora = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Calculadora de Juros</h1>
      </div>
      
      <div className="mt-8">
        <CalculadoraJuros />
      </div>
    </div>
  );
};

export default Calculadora;
