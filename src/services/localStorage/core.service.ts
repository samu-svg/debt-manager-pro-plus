
import { DadosLocais } from '@/types/localStorage';

const STORAGE_KEY = 'devedores_dados';

// Inicializar dados se não existirem
const initializeLocalStorage = (): DadosLocais => {
  const defaultData: DadosLocais = {
    clientes: [],
    configuracoes: {
      ultimaAtualizacao: new Date().toISOString(),
      versao: '1.0.0',
      usuario: ''
    }
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  console.log('LocalStorage inicializado com dados padrão');
  return defaultData;
};

// Obter todos os dados
export const getDadosLocais = (): DadosLocais => {
  try {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (!dados) {
      console.log('Dados não encontrados, inicializando...');
      return initializeLocalStorage();
    }
    const parsedData = JSON.parse(dados);
    console.log('Dados carregados do localStorage:', { 
      clientes: parsedData.clientes?.length || 0 
    });
    return parsedData;
  } catch (error) {
    console.error('Erro ao ler dados do localStorage:', error);
    return initializeLocalStorage();
  }
};

// Salvar dados
export const salvarDadosLocais = (dados: DadosLocais): void => {
  try {
    dados.configuracoes.ultimaAtualizacao = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    console.log('Dados salvos no localStorage:', { 
      clientes: dados.clientes.length,
      totalDividas: dados.clientes.reduce((total, c) => total + c.dividas.length, 0)
    });
  } catch (error) {
    console.error('Erro ao salvar dados no localStorage:', error);
    throw new Error('Não foi possível salvar os dados');
  }
};
