# ADR 0003: Especificar API REST com OpenAPI

## Status

Accepted

## Contexto

O trabalho exige design de API formalmente especificado. A aplicacao ja usa Express e endpoints REST consumidos por paginas HTML/JavaScript simples.

## Decisao

Manter REST e documentar o contrato em `docs/openapi.yaml`.

## Consequencias

Beneficios:

- O contrato pode ser revisado sem ler o codigo.
- Facilita testes manuais via Postman, Insomnia ou Swagger UI.
- Mantem compatibilidade com o frontend existente.

Custos:

- O OpenAPI precisa ser atualizado quando endpoints mudarem.
