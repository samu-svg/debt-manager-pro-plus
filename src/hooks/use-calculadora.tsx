
import { useState } from 'react';
import { TipoJuros, CalculoJuros } from '@/types';
import { calcularJurosSimples, calcularJurosCompostos } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export const useCalculadora = () => {
  const [resultado, setResultado] = useState<CalculoJuros | null>(null);
  const [calculando, setCalculando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const { toast } = useToast();

  const calcularJuros = (valorInicial: number, meses: number, taxa: number, tipo: TipoJuros) => {
    try {
      setCalculando(true);
      setErro(null);

      // Validações
      if (valorInicial <= 0) {
        throw new Error('O valor inicial deve ser maior que zero');
      }
      
      if (meses <= 0) {
        throw new Error('O número de meses deve ser maior que zero');
      }
      
      if (taxa <= 0 || taxa > 100) {
        throw new Error('A taxa de juros deve estar entre 0,01% e 100%');
      }

      // Cálculo
      let valorFinal: number;
      
      if (tipo === 'simples') {
        valorFinal = calcularJurosSimples(valorInicial, taxa, meses);
      } else {
        valorFinal = calcularJurosCompostos(valorInicial, taxa, meses);
      }

      const juros = valorFinal - valorInicial;

      const resultado: CalculoJuros = {
        valorInicial,
        meses,
        taxa,
        tipo,
        valorFinal,
        juros
      };

      setResultado(resultado);
      return resultado;
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
        toast({
          title: 'Erro no cálculo',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setErro('Erro desconhecido ao calcular juros');
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao calcular os juros',
          variant: 'destructive',
        });
      }
      return null;
    } finally {
      setCalculando(false);
    }
  };

  const limparResultado = () => {
    setResultado(null);
    setErro(null);
  };

  return {
    resultado,
    calculando,
    erro,
    calcularJuros,
    limparResultado
  };
};
