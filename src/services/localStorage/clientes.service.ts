
import { ClienteLocal } from '@/types/localStorage';
import { getDadosLocais, salvarDadosLocais } from './core.service';

export const criarCliente = (cliente: Omit<ClienteLocal, 'id' | 'createdAt' | 'updatedAt' | 'dividas' | 'pagamentos'>): ClienteLocal => {
  const dados = getDadosLocais();
  const novoCliente: ClienteLocal = {
    ...cliente,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dividas: [],
    pagamentos: []
  };
  
  dados.clientes.push(novoCliente);
  salvarDadosLocais(dados);
  console.log('Cliente criado:', novoCliente.nome);
  return novoCliente;
};

export const obterClientes = (): ClienteLocal[] => {
  const dados = getDadosLocais();
  return dados.clientes;
};

export const obterClientePorId = (id: string): ClienteLocal | null => {
  const dados = getDadosLocais();
  return dados.clientes.find(c => c.id === id) || null;
};

export const atualizarCliente = (id: string, updates: Partial<Omit<ClienteLocal, 'id' | 'createdAt' | 'dividas' | 'pagamentos'>>): ClienteLocal | null => {
  const dados = getDadosLocais();
  const index = dados.clientes.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  dados.clientes[index] = {
    ...dados.clientes[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  salvarDadosLocais(dados);
  console.log('Cliente atualizado:', dados.clientes[index].nome);
  return dados.clientes[index];
};

export const removerCliente = (id: string): boolean => {
  const dados = getDadosLocais();
  const index = dados.clientes.findIndex(c => c.id === id);
  
  if (index === -1) return false;
  
  const clienteRemovido = dados.clientes[index];
  dados.clientes.splice(index, 1);
  salvarDadosLocais(dados);
  console.log('Cliente removido:', clienteRemovido.nome);
  return true;
};
