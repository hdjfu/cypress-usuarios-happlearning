# Cypress — Módulo de Usuários (HappLearning)

Automação de teste para o módulo **Admin → Usuários → Listar** do HappLearning, feita como parte de um teste prático de QA.

## Como rodar

Edite o `cypress.env.json` com seu login e senha, depois:

```bash
npm install
npm run cy:open    # modo interativo
npm run cy:run     # headless (terminal)
```

## Specs

- **`cypress/e2e/cpf.cy.js`** — valida CPF inválido e duplicado no cadastro.
- **`cypress/e2e/ciclo-de-vida.cy.js`** — fluxo completo: cria, ativa, edita, troca senha, gerencia permissão e desativa.

## Resultado esperado

O `ciclo-de-vida` passa. Os 2 de `cpf.cy.js` falham de propósito: o sistema aceita CPF inválido e duplicado, então a falha é a evidência do bug, não da automação.
