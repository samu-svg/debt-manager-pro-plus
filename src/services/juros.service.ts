
import { DividaLocal } from '@/types/localStorage';
import { obterDividas, atualizarDivida } from './localStorage.service';

// Calcular juros compostos
export const calcularJurosCompostos = (valorPrincipal: number, taxaMensal: number, meses: number): number => {
  return valorPrincipal * Math.pow(1 + (taxaMensal / 100), meses);
};

// Determinar quantos meses se passaram desde o vencimento
export const calcularMesesAtraso = (dataVencimento: string): number => {
  const vencimento = new Date(dataVencimento);
  const hoje = new Date();
  
  if (hoje <= vencimento) return 0;
  
  const diffTime = hoje.getTime() - vencimento.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.ceil(diffDays / 30); // Aproximação de 30 dias por mês
  
  return diffMonths;
};

// Atualizar status de uma dívida
export const atualizarStatusDivida = (divida: DividaLocal): DividaLocal => {
  const hoje = new Date();
  const vencimento = new Date(divida.dataVencimento);
  
  let novoStatus: 'pendente' | 'pago' | 'vencido' = divida.status;
  let valorAtualizado = divida.valor;
  
  if (divida.status !== 'pago') {
    if (hoje > vencimento) {
      novoStatus = 'vencido';
      
      // Calcular juros se estiver vencido
      const mesesAtraso = calcularMesesAtraso(divida.dataVencimento);
      if (mesesAtraso > 0) {
        valorAtualizado = calcularJurosCompostos(divida.valor, divida.juros, mesesAtraso);
      }
    } else {
      novoStatus = 'pendente';
      valorAtualizado = divida.valor;
    }
  }
  
  return {
    ...divida,
    status: novoStatus,
    valorAtualizado: Number(valorAtualizado.toFixed(2))
  };
};

// Atualizar todas as dívidas (executar periodicamente)
export const atualizarTodasDividas = (): void => {
  const dividas = obterDividas();
  
  dividas.forEach(divida => {
    if (divida.status !== 'pago') {
      const dividaAtualizada = atualizarStatusDivida(divida);
      
      // Só atualizar se houve mudança
      if (dividaAtualizada.status !== divida.status || dividaAtualizada.valorAtualizado !== divida.valorAtualizado) {
        atualizarDivida(divida.id, {
          status: dividaAtualizada.status,
          valorAtualizada: dividaAtualizada.valorAtualizado
        });
      }
    }
  });
};

// Executar atualização automática
export const iniciarAtualizacaoAutomatica = (): void => {
  // Atualizar imediatamente
  atualizarTodasDividas();
  
  // Atualizar a cada hora
  setInterval(() => {
    atualizarTodasDividas();
  }, 60 * 60 * 1000);
};
