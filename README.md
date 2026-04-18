# app-node-etl

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=flat&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-31%20testes-6E9F18?style=flat&logo=vitest&logoColor=white)
![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen?style=flat)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat)

> Pipeline ETL agendado em Node.js que lê arquivos CSV, transforma os dados e os carrega no PostgreSQL via stream, com suporte a milhões de registros.

---

## 📋 Descrição

Este projeto implementa um pipeline **ETL (Extract, Transform, Load)** production-ready que:

1. **Extract** — Lê dados de um arquivo CSV via **stream** (sem carregar tudo em memória)
2. **Transform** — Converte e valida os tipos de dados
3. **Load** — Insere/atualiza registros no PostgreSQL via **upsert em batches de 10.000**
4. **Schedule** — Executa automaticamente toda **segunda-feira às 00:00** via `node-cron`

### Destaques

- 🚀 **Escalável** — processa milhões de registros via stream sem estourar memória
- 🧪 **TDD** — 100% de coverage com testes unitários e E2E (Testcontainers)
- 🔒 **Inversão de dependência** — todos os steps seguem o padrão `execute` com contratos `IStep`/`IStreamStep`
- 📦 **Batch insert** — upsert de 10.000 registros por vez com deduplicação automática
- 🔁 **Lock guard** — evita execuções paralelas do cron
- 📊 **Relatório final** — total inserido, atualizado e tempo de execução
- 🛡️ **Erros tipados** — `ExtractError`, `TransformError`, `LoadError`, `DatabaseConnectionError`

---

## 🏗️ Arquitetura

```bash
┌─────────────────────────────────────────────────────┐
│                    ETLRunner                        │
│                                                     │
│  ┌───────────┐   ┌─────────────┐   ┌────────────┐  │
│  │  Extract  │──▶│  Transform  │──▶│    Load    │  │
│  │ (stream)  │   │  (tipagem)  │   │  (upsert)  │  │
│  └───────────┘   └─────────────┘   └────────────┘  │
│       │                                   │         │
│  CSV (1000/página)          PostgreSQL (10k/batch)  │
└─────────────────────────────────────────────────────┘
```

### Estrutura de Diretórios

```bash
src/
├── main/                   # Ponto de entrada e orquestrador
│   ├── ETLRunner.ts         # Orquestra extract → transform → load
│   └── index.ts             # Inicialização, conexão e agendamento
├── steps/                  # Steps do pipeline
│   ├── extract/             # Leitura do CSV via stream (csv-parse)
│   ├── transform/           # Conversão de tipos
│   └── load/                # Upsert no PostgreSQL
├── shared/                 # Utilitários compartilhados
│   ├── contracts/           # IStep<TInput, TOutput>, IStreamStep
│   ├── errors/              # Erros tipados por domínio
│   ├── error-handler/       # ErrorHandler centralizado
│   ├── logger/              # Logger estruturado (pino)
│   └── env/                 # Validação de variáveis (zod)
└── e2e/                    # Testes end-to-end (Testcontainers)
```

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
| --- | --- |
| **Node.js 22** | Runtime |
| **TypeScript** | Tipagem estática |
| **csv-parse** | Leitura em stream do CSV |
| **pg** | Driver PostgreSQL |
| **pino** | Logger estruturado em JSON |
| **node-cron** | Agendamento semanal |
| **zod** | Validação de variáveis de ambiente |
| **vitest** | Testes unitários e E2E |
| **testcontainers** | Postgres real nos testes E2E |
| **tsup** | Build e bundling |
| **biome** | Linter e formatter |
| **husky + lint-staged** | Git hooks |
| **Docker Compose** | Ambiente containerizado |

---

## 🚀 Começando

### Pré-requisitos

- Node.js 22+
- Docker e Docker Compose

### Instalação

```bash
npm install
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=postgres://user:password@localhost:5432/etl_db
CSV_PATH=products.csv
NODE_ENV=development
```

| Variável | Descrição | Padrão |
| --- | --- | --- |
| `DATABASE_URL` | String de conexão PostgreSQL | obrigatório |
| `CSV_PATH` | Caminho do arquivo CSV | `products.csv` |
| `NODE_ENV` | Ambiente da aplicação | `production` |
| `SMB_SHARE` | Caminho do compartilhamento SMB | opcional |
| `SMB_DOMAIN` | Domínio do SMB | opcional |
| `SMB_USER` | Usuário do SMB | opcional |
| `SMB_PASS` | Senha do SMB | opcional |

---

## 🐳 Docker

### Subir a aplicação completa

```bash
docker compose up --build
```

Isso inicia:

- **etl_app** — Container Node.js com a aplicação ETL
- **etl_db** — PostgreSQL com healthcheck
- **etl_smb** — Compartilhamento Samba

### Logs em tempo real

```bash
docker compose logs -f app
```

Exemplo de saída:

```json
{"level":"info","time":"2026-04-17T21:15:40.311Z","msg":"Iniciando a aplicação"}
{"level":"info","time":"2026-04-17T21:15:40.502Z","msg":"Conexão com Postgres OK: 2026-04-17T21:15:40.499Z"}
{"level":"info","time":"2026-04-17T21:15:40.503Z","msg":"Iniciando carga de produtos..."}
{"level":"info","time":"2026-04-17T21:15:52.947Z","msg":"1232789 de registros lidos"}
{"level":"info","time":"2026-04-17T21:15:52.947Z","msg":"33124 inseridos | 1030849 atualizados"}
{"level":"info","time":"2026-04-17T21:15:52.947Z","msg":"Concluído em 16.88s"}
{"level":"info","time":"2026-04-17T21:15:52.947Z","msg":"Registros processados"}
{"level":"info","time":"2026-04-17T21:15:52.977Z","msg":"Agendamento ativo: toda segunda-feira às 00:00"}
```

---

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

---

## 📦 Scripts Disponíveis

| Script | Descrição |
| --- | --- |
| `npm run start` | Inicia a aplicação compilada |
| `npm run start:dev` | Inicia em modo desenvolvimento (watch) |
| `npm run build` | Compila o projeto com tsup |
| `npm test` | Executa testes em modo watch |
| `npm run test:run` | Executa todos os testes uma vez |
| `npm run test:unit` | Executa apenas testes unitários |
| `npm run test:integration` | Executa apenas testes E2E |
| `npm run test:coverage` | Gera relatório de coverage |
| `npm run lint:fix` | Formata código com Biome |

---

## 🧪 Testes

O projeto utiliza **Vitest** com **100% de coverage** e dois tipos de testes:

### Testes Unitários

Todos os steps seguem o padrão **SUT (System Under Test)** com inversão de dependência:

```bash
npm run test:unit
```

### Testes E2E

Usam **Testcontainers** para subir um PostgreSQL real durante os testes:

```bash
npm run test:integration
```

### Coverage

```bash
npm run test:coverage
```

```bash
All files  | % Stmts | % Branch | % Funcs | % Lines |
-----------|---------|----------|---------|---------|
All files  |   100   |   100    |   100   |   100   |
```

---

## 🔄 Fluxo do ETL

```bash
1. Conecta ao PostgreSQL
2. Lê o CSV via stream (1.000 linhas por vez)
3. Transforma os dados (string → number)
4. Acumula em buffer
5. A cada 10.000 registros → upsert no PostgreSQL
6. Deduplica por name antes de inserir
7. Exibe relatório: inseridos, atualizados, tempo
8. Aguarda próximo disparo (toda segunda-feira às 00:00)
```

---

## 📅 Agendamento

O ETL roda automaticamente toda **segunda-feira às 00:00** via `node-cron`.

Se o ETL ainda estiver em execução quando o próximo disparo ocorrer, ele é **ignorado automaticamente** (lock guard).

---

## 🤝 Contribuindo

Este projeto usa **Conventional Commits**:

```bash
feat(scope): add new feature
fix(scope): fix a bug
test(scope): add tests
chore(scope): maintenance tasks
```

Git hooks configurados com **husky** e **lint-staged** garantem que o código seja formatado e testado antes de cada commit.

---

## 📄 Licença

MIT © [cortelucas](https://github.com/cortelucas)
