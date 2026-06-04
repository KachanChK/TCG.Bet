# ADR 0004: Aplicar Strategy, Factory e Adapter

## Status

Accepted

## Contexto

O trabalho exige ao menos tres padroes GoF justificados. O dominio de apostas permite aplicar padroes sem artificialidade: calculo de premiacao pode variar, transacoes de carteira precisam ser padronizadas e infraestrutura externa deve ser isolada.

## Decisao

Aplicar:

- Strategy em `PayoutStrategy`, permitindo trocar o algoritmo de premiacao.
- Factory em `WalletTransactionFactory`, padronizando transacoes de carteira.
- Adapter nos repositorios Oracle e no adaptador de autenticacao JWT/Oracle.

## Consequencias

Beneficios:

- Os padroes resolvem problemas reais do projeto.
- O calculo de premio pode evoluir sem alterar o caso de uso.
- A infraestrutura fica substituivel por testes ou outro banco.

Custos:

- O codigo fica mais estruturado, mas menos direto do que chamadas SQL inline.
