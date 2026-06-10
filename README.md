# TCG.Bet

Aplicacao web para apostas em eventos futuros, desenvolvida em Node.js, TypeScript, Express e OracleDB.

O sistema permite cadastro/login, criacao de eventos, moderacao, apostas, carteira digital, depositos, saques, historico financeiro e finalizacao de eventos com distribuicao de ganhos.

## Objetivo arquitetural

Este repositorio foi organizado para demonstrar decisoes arquiteturais, atributos de qualidade, SOLID, Clean Code, padroes GoF e contrato formal de API.

Documentos principais:

- [Arquitetura](docs/architecture.md)
- [ADRs](adrs)
- [OpenAPI](docs/openapi.yaml)

## Stack

- Node.js
- TypeScript
- Express
- OracleDB
- JWT
- Nodemailer
- Node Test Runner
- Hash de senha com `scrypt` da biblioteca padrao do Node.js

## Arquitetura

O projeto usa um **monolito modular** com organizacao interna inspirada em Clean Architecture/Hexagonal:

- `src/domain`: regras puras de dominio.
- `src/application`: casos de uso e portas.
- `src/infrastructure`: adaptadores concretos de OracleDB e JWT.
- `src/services`: ponte entre rotas existentes e casos de uso.
- `src/routes`: endpoints HTTP Express.
- `adrs`: registros de decisoes arquiteturais.
- `diagrams`: fontes Mermaid dos diagramas.
- `docs/openapi.yaml`: contrato formal da API REST.

## Padroes GoF aplicados

- **Strategy**: `PoolPayoutStrategy` calcula a distribuicao de ganhos.
- **Factory**: `WalletTransactionFactory` cria transacoes de deposito, saque, aposta e ganho.
- **Adapter**: `JwtOracleAuthAdapter` e repositorios Oracle adaptam infraestrutura para as portas da aplicacao.

## SOLID e Clean Code

Evidencias no codigo:

- Casos de uso focados: `MoveWalletFundsUseCase`, `PlaceBetUseCase`, `FinishEventUseCase`.
- Dependencia de interfaces: `WalletRepository`, `BetRepository`, `EventRepository`, `AuthPort`.
- Regras puras testaveis em `src/domain`.
- Conversao monetaria centralizada em `toCents`.
- Senhas novas armazenadas com hash por `PasswordHasher`.
- `app.ts` monta a aplicacao; `server.ts` apenas inicia o servidor.

## Configuracao

Crie um arquivo `.env` seguindo o exemplo de `.env.example`:

```env
USER="USUARIO"
PASSWORD="SENHA"
CONN_STR="STRING CONEXAO"
JWT_PASS=senhaforte
MAIL_HOST="gmail"
MAIL_USERNAME="<EmailID>"
MAIL_PASSWORD="<Generated Password without Spaces>"
```

## Instalar e executar

```bash
npm install
npm run setup-db
npm run dev
```

Acesse:

- Aplicacao: `http://localhost:3000/homepage`
- OpenAPI: `http://localhost:3000/openapi.yaml`

## Build e testes

```bash
npm run build
npm test
```

Os testes atuais cobrem regras puras de dominio, especialmente calculo de premiacao, transacoes de carteira e hash de senha.

## Rotas principais

- `POST /account/signUp`
- `POST /account/login`
- `GET /account/getWallet`
- `POST /account/addFunds`
- `POST /account/withdrawFunds`
- `POST /event/addEvent`
- `DELETE /event/deleteEvent`
- `GET /event/getEvents`
- `GET /event/getMyEvents`
- `POST /event/bet`
- `POST /mod/evaluateEvent`
- `POST /mod/finishEvent`

Rotas autenticadas usam header:

```http
Authorization: Bearer <token>
```

## Observacoes para entrega academica

Para o trabalho final, o grupo deve complementar o documento entregue ao professor com:

- composicao do grupo;
- justificativa do tema escolhido;
- diagramas de componentes e fluxos principais;
- relacao entre requisitos do trabalho e evidencias no repositorio;
- link publico do repositorio Git.
