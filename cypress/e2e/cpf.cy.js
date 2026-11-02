// Validação de CPF no cadastro de usuário: CPF inválido (dígitos repetidos) e CPF duplicado.
// Ambos devem ser recusados; as falhas aqui são bugs encontrados no sistema.

const salvarEsperandoErro = () => {
  cy.get('[data-testid="button-salvar"]').click()
  cy.get('mat-dialog-container, .swal2-popup').should('be.visible').and('not.contain', 'sucesso')
}

describe('Validação de CPF no cadastro', () => {
  // Tenta salvar com CPF 111.111.111-11 e espera erro em vez de sucesso
  it('não aceita CPF inválido (dígitos repetidos)', () => {
    cy.novoUsuario().then((u) => {
      cy.preencherUsuario({ ...u, cpf: '11111111111' })
      salvarEsperandoErro()
    })
  })

  // Cria um usuário e tenta criar outro com o mesmo CPF, esperando erro
  it('não aceita CPF duplicado', () => {
    cy.novoUsuario().then((u) => {
      cy.criarUsuario(u)
      cy.preencherUsuario({ ...u, email: `dup.${u.email}` })
      salvarEsperandoErro()
    })
  })
})
