
import { ClienteLocal } from '@/types/localStorage';
import { getDadosLocais } from './core.service';

export const buscarClientes = (termo: string): ClienteLocal[] => {
  const dados = getDadosLocais();
  const termoLower = termo.toLowerCase();
  
  return dados.clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(termoLower) ||
    cliente.cpf.replace(/\D/g, '').includes(termo.replace(/\D/g, '')) ||
    cliente.telefone.replace(/\D/g, '').includes(termo.replace(/\D/g, '')) ||
    (cliente.email && cliente.email.toLowerCase().includes(termoLower))
  );
};
