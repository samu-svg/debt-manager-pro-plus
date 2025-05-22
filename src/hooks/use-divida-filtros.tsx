
import { useState, useMemo } from 'react';
import { Divida } from '@/types';

interface UseDividaFiltrosProps {
  dividas: Divida[];
  getClienteNome: (id: string) => string;
}

export const useDividaFiltros = ({ dividas, getClienteNome }: UseDividaFiltrosProps) => {
  const [busca, setBusca] = useState('');
  const [filtroMensagens, setFiltroMensagens] = useState('todos');
  
  // Categorizar dívidas por status
  const dividasAtrasadas = useMemo(() => 
    dividas.filter(divida => divida.status === 'atrasado'), 
  [dividas]);
  
  const dividasPendentes = useMemo(() => 
    dividas.filter(divida => divida.status === 'pendente'), 
  [dividas]);
  
  const dividasPagas = useMemo(() => 
    dividas.filter(divida => divida.status === 'pago'), 
  [dividas]);
  
  // Filtrar dívidas pela busca
  const filtrarDividas = (dividasParaFiltrar: Divida[]) => {
    if (!busca.trim()) return dividasParaFiltrar;
    
    const termoBusca = busca.toLowerCase();
    return dividasParaFiltrar.filter(divida => {
      const clienteNome = getClienteNome(divida.clienteId).toLowerCase();
      const descricao = divida.descricao.toLowerCase();
      const valor = divida.valor.toString();
      
      return (
        clienteNome.includes(termoBusca) || 
        descricao.includes(termoBusca) || 
        valor.includes(termoBusca)
      );
    });
  };
  
  // Filtrar dívidas por status de mensagem
  const filtrarPorStatusMensagem = (
    dividasParaFiltrar: Divida[], 
    mensagensEnviadas: Record<string, { data: string }>
  ) => {
    if (filtroMensagens === 'todos') return dividasParaFiltrar;
    
    return dividasParaFiltrar.filter(divida => {
      const mensagemEnviada = mensagensEnviadas[divida.id];
      if (filtroMensagens === 'enviadas') return !!mensagemEnviada;
      if (filtroMensagens === 'pendentes') return !mensagemEnviada;
      return true;
    });
  };
  
  return {
    busca,
    setBusca,
    filtroMensagens,
    setFiltroMensagens,
    dividasAtrasadas,
    dividasPendentes,
    dividasPagas,
    filtrarDividas,
    filtrarPorStatusMensagem
  };
};
