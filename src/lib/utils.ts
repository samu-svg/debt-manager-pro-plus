
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatação de moeda brasileira
export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
};

// Formatação de data brasileira
export const formatarData = (data: string): string => {
  return new Date(data).toLocaleDateString('pt-BR');
};

// Formatação de data e hora
export const formatarDataHora = (data: string): string => {
  return new Date(data).toLocaleString('pt-BR');
};

// Validação de CPF
export const validarCPF = (cpf: string): boolean => {
  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
  
  // Validar dígitos verificadores
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.charAt(9))) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.charAt(10))) return false;
  
  return true;
};

// Formatação de CPF
export const formatarCPF = (cpf: string): string => {
  const cpfLimpo = cpf.replace(/\D/g, '');
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Formatação de telefone
export const formatarTelefone = (telefone: string): string => {
  const telefoneLimpo = telefone.replace(/\D/g, '');
  if (telefoneLimpo.length === 11) {
    return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (telefoneLimpo.length === 10) {
    return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return telefone;
};

// Determinar status da dívida baseado na data de vencimento
export const determinarStatusDivida = (dataVencimento: string): 'pendente' | 'vencido' => {
  const hoje = new Date();
  const vencimento = new Date(dataVencimento);
  return hoje > vencimento ? 'vencido' : 'pendente';
};

// Calcular juros simples
export const calcularJurosSimples = (principal: number, taxa: number, tempo: number): number => {
  return principal * (1 + (taxa / 100) * tempo);
};

// Calcular juros compostos
export const calcularJurosCompostos = (principal: number, taxa: number, tempo: number): number => {
  return principal * Math.pow(1 + (taxa / 100), tempo);
};

// Calcular meses de atraso
export const calcularMesesAtraso = (dataVencimento: string): number => {
  const hoje = new Date();
  const vencimento = new Date(dataVencimento);
  
  if (hoje <= vencimento) return 0;
  
  const diffTime = hoje.getTime() - vencimento.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.ceil(diffDays / 30);
};

// Converter mês de início de juros para número
export const converterMesInicioJurosParaNumero = (mes: string): number => {
  const meses: Record<string, number> = {
    'primeiro': 1,
    'segundo': 2,
    'terceiro': 3,
    'imediatamente': 0
  };
  return meses[mes] || 1;
};

// Calcular dívida corrigida com juros
export const calcularDividaCorrigida = (
  valorOriginal: number,
  dataVencimento: string,
  taxaJuros: number,
  mesInicioJuros: string = 'primeiro'
): number => {
  const mesesAtraso = calcularMesesAtraso(dataVencimento);
  const inicioJuros = converterMesInicioJurosParaNumero(mesInicioJuros);
  
  if (mesesAtraso <= inicioJuros) {
    return valorOriginal;
  }
  
  const mesesComJuros = mesesAtraso - inicioJuros;
  return calcularJurosCompostos(valorOriginal, taxaJuros, mesesComJuros);
};
