
#!/bin/bash

# Script para fazer backup do banco de dados PostgreSQL
# Coloque este script no crontab para execução automática

# Data atual no formato YYYYMMDD
DATA=$(date +%Y%m%d)

# Diretório para armazenar backups
BACKUP_DIR="./backups"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Nome do arquivo de backup
BACKUP_FILE="$BACKUP_DIR/backup_$DATA.sql"

# Fazer backup usando o container Docker
docker exec sistema-devedores-db pg_dump -U admin sistema_devedores > $BACKUP_FILE

# Compactar o arquivo de backup
gzip $BACKUP_FILE

# Manter apenas os últimos 7 backups (uma semana)
find $BACKUP_DIR -name "backup_*.sql.gz" -type f -mtime +7 -delete

echo "Backup completo: $BACKUP_FILE.gz"
