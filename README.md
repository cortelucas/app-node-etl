# app-node-etl

> Aplicação Node.js para extrair, transformar e carregar dados de arquivos CSV para um banco de dados PostgreSQL.

## 📋 Descrição

Este projeto implementa um pipeline ETL (Extract, Transform, Load) que:

1. **Extract** — Lê dados de um arquivo CSV (local ou compartilhamento SMB)
2. **Transform** — Converte tipos de dados (string para número)
3. **Load** — Insere/atualiza registros no banco de dados PostgreSQL

## 🏗️ Arquitetura

```bash
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Extract   │───▶│  Transform │───▶│    Load     │
│  (CSV File) │    │ (Data Type) │    │ (PostgreSQL)│
└─────────────┘    └─────────────┘    └─────────────┘
```

### Estrutura de Diretórios

```bash
src/
├── main/               # Ponto de entrada e orquestrador ETL
│   ├── etl-runner.ts   # Orquestrador do pipeline
│   └── index.ts        # Inicialização da aplicação
├── steps/              # Passos do ETL
│   ├── extract/        # Extração de dados do CSV
│   ├── transform/      # Transformação de dados
│   └── load/           # Carregamento no banco de dados
├── shared/             # Utilitários compartilhados
│   ├── contracts/      # Interfaces (IStep, IStreamStep)
│   ├── errors/         # Classes de erro customizadas
│   ├── logger/         # Logging da aplicação
│   └── env/            # Variáveis de ambiente
└── e2e/                # Testes end-to-end
```

## 🚀 Começando

### Pré-requisitos

- Node.js 22+
- Docker e Docker Compose

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
# Modo watch com reload automático
npm run start:dev

# Executar testes
npm test

# Executar testes uma vez
npm run test:run

# Verificar coverage
npm run test:coverage
```

### Build

```bash
npm run build
```

### Produção

```bash
npm run start
```

## 🐳 Docker

### Subir a aplicação completa

```bash
docker-compose up --build
```

Isso inicia:

- **app** — Container Node.js com a aplicação ETL
- **db** — PostgreSQL (bitnami/postgresql)
- **smb** — Compartilhamento Samba (dperson/samba)

### Variáveis de Ambiente

| Variável | Descrição | Exemplo |
| ---------- | ----------- | --------- |
| `DATABASE_URL` | String de conexão PostgreSQL | `postgres://user:pass@host:5432/db` |
| `SMB_SHARE` | Caminho do compartilhamento SMB | `\\\\smb\\share` |
| `SMB_DOMAIN` | Domínio do SMB | `WORKGROUP` |
| `SMB_USER` | Usuário do SMB | `smvserver` |
| `SMB_PASS` | Senha do SMB | `Server123` |

## 🗄️ Banco de Dados

### Schema

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_product_name UNIQUE (name)
);
```

O script de inicialização está em [init/01_products.sql](init/01_products.sql).

## 📦 Scripts Disponíveis

| Script | Descrição |
| --------|-----------|
| `start` | Inicia a aplicação compilada |
| `start:dev` | Inicia em modo desenvolvimento (watch) |
| `build` | Compila o projeto com tsup |
| `test` | Executa testes em modo watch |
| `test:run` | Executa testes uma vez |
| `test:coverage` | Gera relatório de coverage |
| `lint:fix` | Formata código com Biome |
| `lint:staged` | Linta arquivos staged (husky) |

## 🧪 Testes

O projeto utiliza [Vitest](https://vitest.dev/) para testes unitários e de integração.

```bash
# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration
```

## 📄 Licença

MIT © [cortelucas](https://github.com/cortelucas)
