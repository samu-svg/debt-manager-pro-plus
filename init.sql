
-- Tabela de clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cpf VARCHAR(14) UNIQUE NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de dívidas
CREATE TABLE dividas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    valor_original NUMERIC(12, 2) NOT NULL,
    data_compra DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    status_pagamento VARCHAR(20) NOT NULL DEFAULT 'Pendente',
    taxa_juros NUMERIC(5, 2) DEFAULT 3.00,
    mes_inicio_juros INTEGER DEFAULT 2,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de configurações de juros
CREATE TABLE configuracoes_juros (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    tipo_juros VARCHAR(10) NOT NULL CHECK (tipo_juros IN ('simples', 'composto')),
    taxa_juros_padrao NUMERIC(5, 2) NOT NULL DEFAULT 3.00
);

-- Tabela de histórico de pagamentos
CREATE TABLE historico_pagamentos (
    id SERIAL PRIMARY KEY,
    divida_id INTEGER NOT NULL REFERENCES dividas(id) ON DELETE CASCADE,
    valor_pago NUMERIC(12, 2) NOT NULL,
    data_pagamento DATE NOT NULL,
    forma_pagamento VARCHAR(50),
    observacoes TEXT
);

-- Tabela de comunicações WhatsApp
CREATE TABLE comunicacoes (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    tipo VARCHAR(20) NOT NULL,
    mensagem TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente',
    data_envio TIMESTAMP,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de logs do sistema
CREATE TABLE logs_sistema (
    id SERIAL PRIMARY KEY,
    acao VARCHAR(100) NOT NULL,
    tabela_afetada VARCHAR(50),
    registro_id INTEGER,
    dados_anteriores JSONB,
    dados_novos JSONB,
    usuario VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_clientes_cpf ON clientes(cpf);
CREATE INDEX idx_dividas_cliente_id ON dividas(cliente_id);
CREATE INDEX idx_dividas_vencimento ON dividas(data_vencimento);
CREATE INDEX idx_dividas_status ON dividas(status_pagamento);
