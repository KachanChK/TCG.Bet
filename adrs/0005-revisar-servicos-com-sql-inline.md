# ADR 0005: Revisar servicos com SQL inline para casos de uso e portas

## Status

Accepted

## Contexto

A primeira versao do TCG.Bet concentrava validacao, autenticacao, SQL, transacao e regra de negocio em funcoes de servico. Essa decisao acelerou a construcao inicial, mas prejudicou testabilidade, manutenibilidade e demonstracao dos principios SOLID.

## Decisao

Modificar a decisao inicial e migrar os fluxos centrais de carteira, aposta e finalizacao de evento para casos de uso em `src/application/useCases`, dependentes de portas e adaptadores.

## Consequencias

Beneficios:

- Regras importantes passam a ser testaveis sem OracleDB.
- O codigo evidencia Dependency Inversion e Interface Segregation.
- O calculo de premiacao fica desacoplado do Express e da persistencia.

Custos:

- A refatoracao ainda nao cobre 100% dos fluxos legados.
- A equipe precisa manter consistencia ao evoluir novos endpoints.
