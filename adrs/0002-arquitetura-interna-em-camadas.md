# ADR 0002: Organizar internamente por camadas

## Status

Accepted

## Contexto

Os servicos originais misturavam regra de negocio, SQL, autenticacao, transacao e logs. Isso dificultava demonstrar SOLID, Clean Code e testes automatizados.

## Decisao

Separar responsabilidades em camadas:

- `domain`: regras puras.
- `application`: casos de uso e portas.
- `infrastructure`: adaptadores de OracleDB e JWT.
- `routes/services`: entrada HTTP e compatibilidade com a API existente.

## Consequencias

Beneficios:

- Regras de negocio ficam testaveis sem banco.
- Dependencias externas ficam isoladas.
- A arquitetura fica mais facil de explicar e defender.

Custos:

- Ha mais arquivos e indirecao.
- Mudancas simples podem exigir navegar por mais camadas.
