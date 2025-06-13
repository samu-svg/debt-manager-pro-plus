
import { DividaLocal } from '@/types/localStorage';
import { getDadosLocais, salvarDadosLocais } from './core.service';
import { obterClientePorId } from './clientes.service';

export const criarDivida = (divida: Omit<DividaLocal, 'id' | 'createdAt' | 'updatedAt' | 'valorAtualizado'>): DividaLocal | null => {
  const dados = getDadosLocais();
  const clienteIndex = dados.clientes.findIndex(c => c.id === divida.clienteId);
  
  if (clienteIndex === -1) {
    console.error('Cliente não encontrado para criar dívida:', divida.clienteId);
    return null;
  }
  
  const novaDivida: DividaLocal = {
    ...divida,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    valorAtualizado: divida.valor // Inicialmente igual ao valor original
  };
  
  dados.clientes[clienteIndex].dividas.push(novaDivida);
  salvarDadosLocais(dados);
  
  console.log('Dívida criada:', {
    id: novaDivida.id,
    cliente: dados.clientes[clienteIndex].nome,
    valor: novaDivida.valor,
    descricao: novaDivida.descricao
  });
  
  return novaDivida;
};

export const obterDividas = (): DividaLocal[] => {
  const dados = getDadosLocais();
  const todasDividas = dados.clientes.flatMap(c => c.dividas);
  console.log('Dívidas obtidas:', todasDividas.length);
  return todasDividas;
};

export const obterDividasPorCliente = (clienteId: string): DividaLocal[] => {
  const cliente = obterClientePorId(clienteId);
  return cliente?.dividas || [];
};

export const atualizarDivida = (dividaId: string, updates: Partial<Omit<DividaLocal, 'id' | 'createdAt'>>): DividaLocal | null => {
  const dados = getDadosLocais();
  
  for (const cliente of dados.clientes) {
    const dividaIndex = cliente.dividas.findIndex(d => d.id === dividaId);
    if (dividaIndex !== -1) {
      cliente.dividas[dividaIndex] = {
        ...cliente.dividas[dividaIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      salvarDadosLocais(dados);
      console.log('Dívida atualizada:', cliente.dividas[dividaIndex]);
      return cliente.dividas[dividaIndex];
    }
  }
  
  console.error('Dívida não encontrada para atualizar:', dividaId);
  return null;
};

export const removerDivida = (dividaId: string): boolean => {
  const dados = getDadosLocais();
  
  for (const cliente of dados.clientes) {
    const dividaIndex = cliente.dividas.findIndex(d => d.id === dividaId);
    if (dividaIndex !== -1) {
      const dividaRemovida = cliente.dividas[dividaIndex];
      cliente.dividas.splice(dividaIndex, 1);
      salvarDadosLocais(dados);
      console.log('Dívida removida:', dividaRemovida);
      return true;
    }
  }
  
  console.error('Dívida não encontrada para remover:', dividaId);
  return false;
};
