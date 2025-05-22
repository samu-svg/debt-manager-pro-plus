
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { MesInicioJuros } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formata um número para o formato monetário brasileiro (R$)
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

// Formata uma data para o formato brasileiro (DD/MM/YYYY)
export function formatarData(data: string | Date): string {
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  return dataObj.toLocaleDateString('pt-BR');
}

// Formata um CPF (XXX.XXX.XXX-XX)
export function formatarCPF(cpf: string): string {
  const cpfLimpo = cpf.replace(/\D/g, '');
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Formata um número de telefone ((XX) XXXXX-XXXX)
export function formatarTelefone(telefone: string): string {
  const telefoneLimpo = telefone.replace(/\D/g, '');
  return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

// Calcula os dias entre duas datas
export function calcularDiasEntreDatas(dataInicio: Date, dataFim: Date): number {
  const diffTime = dataFim.getTime() - dataInicio.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Calcula os meses entre duas datas (para cálculo de juros)
export function calcularMesesEntreDatas(dataInicio: Date, dataFim: Date): number {
  const anos = dataFim.getFullYear() - dataInicio.getFullYear();
  const meses = anos * 12 + dataFim.getMonth() - dataInicio.getMonth();
  
  // Verificar se o dia do mês da data fim é anterior ao da data início
  // Se for anterior, subtrair 1 mês do resultado
  const ajusteDia = dataFim.getDate() < dataInicio.getDate() ? -1 : 0;
  
  return Math.max(0, meses + ajusteDia);
}

// Converte o mês de início dos juros em número (1, 2, 3, etc.)
export function converterMesInicioJurosParaNumero(mesInicioJuros: MesInicioJuros): number {
  const meses: Record<MesInicioJuros, number> = {
    '1º mês': 1,
    '2º mês': 2,
    '3º mês': 3,
    '4º mês': 4,
    '5º mês': 5,
    '6º mês': 6
  };
  
  return meses[mesInicioJuros];
}

// Calcula juros simples
export function calcularJurosSimples(valorInicial: number, taxa: number, meses: number): number {
  // taxa em percentual (ex: 3% = 0.03)
  const taxaDecimal = taxa / 100;
  return valorInicial * (1 + taxaDecimal * meses);
}

// Calcula juros compostos
export function calcularJurosCompostos(valorInicial: number, taxa: number, meses: number): number {
  // taxa em percentual (ex: 3% = 0.03)
  const taxaDecimal = taxa / 100;
  return valorInicial * Math.pow(1 + taxaDecimal, meses);
}

// Calcula o valor da dívida corrigida com juros personalizados
export function calcularDividaCorrigida(
  valorInicial: number, 
  dataVencimento: string, 
  taxaJuros: number = 3, 
  mesInicioJuros: MesInicioJuros = '2º mês'
): number {
  const dataAtual = new Date();
  const dataVenc = new Date(dataVencimento);
  
  // Se a data de vencimento é futura ou hoje, retorna o valor original
  if (dataVenc >= dataAtual) {
    return valorInicial;
  }
  
  // Calcula quantos meses se passaram desde o vencimento
  const mesesAtraso = calcularMesesEntreDatas(dataVenc, dataAtual);
  
  // Converte o mês de início dos juros para número
  const mesesCarencia = converterMesInicioJurosParaNumero(mesInicioJuros) - 1;
  
  // Calcula meses efetivos para aplicação dos juros
  // Se o atraso for menor que a carência, não há juros
  const mesesEfetivos = Math.max(0, mesesAtraso - mesesCarencia);
  
  if (mesesEfetivos <= 0) {
    return valorInicial;
  }
  
  // Aplica juros compostos com a taxa personalizada
  return calcularJurosCompostos(valorInicial, taxaJuros, mesesEfetivos);
}

// Calcula quantos meses uma dívida está atrasada
export function calcularMesesAtraso(dataVencimento: string): number {
  const dataAtual = new Date();
  const dataVenc = new Date(dataVencimento);
  
  if (dataVenc >= dataAtual) {
    return 0;
  }
  
  return calcularMesesEntreDatas(dataVenc, dataAtual);
}

// Determina o status da dívida com base na data de vencimento
export function determinarStatusDivida(dataVencimento: string): 'pendente' | 'atrasado' {
  const hoje = new Date();
  const dataVenc = new Date(dataVencimento);
  
  return dataVenc < hoje ? 'atrasado' : 'pendente';
}

// Função para carregar variáveis de ambiente
export function getEnvVar(name: string, defaultValue: string = ''): string {
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name] as string;
  }
  return defaultValue;
}

// Configuração da conexão com PostgreSQL
export const dbConfig = {
  host: getEnvVar('POSTGRES_HOST', 'localhost'),
  port: parseInt(getEnvVar('POSTGRES_PORT', '5432')),
  database: getEnvVar('POSTGRES_DB', 'sistema_devedores'),
  user: getEnvVar('POSTGRES_USER', 'admin'),
  password: getEnvVar('POSTGRES_PASSWORD', 'senha123')
};
