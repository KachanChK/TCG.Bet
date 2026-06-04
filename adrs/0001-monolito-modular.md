# ADR 0001: Adotar monolito modular

## Status

Accepted

## Contexto

O TCG.Bet possui funcionalidades de contas, eventos, carteira, apostas, moderacao e notificacao. Essas funcionalidades sao relacionadas e compartilham transacoes importantes, principalmente quando uma aposta altera saldo e historico financeiro.

## Decisao

Manter o sistema como um monolito modular em Node.js/TypeScript.

## Consequencias

Beneficios:

- Menor complexidade de deploy.
- Consistencia transacional mais simples.
- Arquitetura suficiente para o escopo do trabalho e tamanho da equipe.
- Separacao modular ainda permite evolucao futura.

Custos:

- Escalabilidade independente por modulo nao existe neste momento.
- A equipe precisa manter disciplina de organizacao interna para evitar acoplamento excessivo.
