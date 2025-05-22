
# Sistema de Gerenciamento de Devedores

Este é um sistema para gerenciamento de devedores com recursos para cadastro de clientes, controle de dívidas, cálculo de juros e integração com WhatsApp.

## Configuração do Ambiente Docker

### Pré-requisitos

- Docker e Docker Compose instalados
- Node.js e npm (para executar a aplicação frontend)

### Instalação e Execução

1. Clone este repositório
2. Inicie o ambiente Docker:

```bash
docker-compose up -d
```

Este comando inicializará:
- PostgreSQL (porta 5432)
- pgAdmin 4 (porta 8080)

3. Acesse o pgAdmin:
   - URL: http://localhost:8080
   - Email: admin@devedores.com
   - Senha: admin123

4. Para conectar ao banco de dados no pgAdmin:
   - Host: postgres
   - Port: 5432
   - Database: sistema_devedores
   - Username: admin
   - Password: senha123

### Comandos Úteis

```bash
# Ver logs dos containers
docker-compose logs

# Parar os containers
docker-compose down

# Reiniciar os containers
docker-compose restart
```

### Backup do Banco de Dados

Para configurar o backup automático:

1. Torne o script de backup executável:

```bash
chmod +x backup.sh
```

2. Adicione ao crontab para execução diária às 2h da manhã:

```bash
# Abra o editor crontab
crontab -e

# Adicione a linha
0 2 * * * /caminho/completo/para/backup.sh
```

Os backups serão armazenados na pasta `backups/` com o formato `backup_YYYYMMDD.sql.gz`.

## Estrutura do Banco de Dados

O banco de dados contém as seguintes tabelas:

- `clientes`: Cadastro de clientes
- `dividas`: Registro de dívidas
- `configuracoes_juros`: Configurações de juros por cliente
- `historico_pagamentos`: Histórico de pagamentos realizados
- `comunicacoes`: Registro de comunicações via WhatsApp
- `logs_sistema`: Logs de ações no sistema

## Desenvolvimento

Para executar a aplicação em ambiente de desenvolvimento:

```bash
# Instalar dependências
npm install

# Iniciar aplicação em modo de desenvolvimento
npm run dev
```

## Produção

Para build de produção:

```bash
npm run build
```
