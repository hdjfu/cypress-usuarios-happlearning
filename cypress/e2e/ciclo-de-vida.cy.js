// Fluxo completo de ponta a ponta com o mesmo usuário: cria, ativa, edita, troca a senha,
// dá e tira um perfil na aba Permissão e por fim desativa.

const abrirEdicao = (email) => {
  cy.visit('/app/admin/usuarios/listagem')
  cy.buscar(email)
  cy.acaoDoUsuario(email, 'menuEdit')
  cy.get('[data-testid="input-name"]').should('be.visible')
}

const togglePerfil = (perfil) => cy.contains('.mat-mdc-tab-body-active tr', perfil).find('input[type=checkbox]')

const abrirAbaPermissao = (email) => {
  abrirEdicao(email)
  cy.contains('[role=tab]', 'Permissão').click()
}

describe('Ciclo de vida do usuário', () => {
  // Cria, ativa, edita, troca a senha, dá e tira o perfil Analista e por fim desativa o mesmo usuário
  it('cria, edita, altera senha, gerencia permissão e desativa o usuário', () => {
    cy.novoUsuario().then((u) => {
      // criação: o usuário nasce inativo
      cy.criarUsuario(u)
      cy.contains(/Inativos\s*1/).should('be.visible')

      // ativação
      cy.alternarStatus(u.email, 'ativado com sucesso')
      cy.contains(/Ativos\s*1/).should('be.visible')

      // edição: muda nome e cargo, salva e confere depois de reabrir
      cy.acaoDoUsuario(u.email, 'menuEdit')
      cy.get('[data-testid="input-name"]').clear().type(`${u.nome} Editado`)
      cy.get('[data-testid="input-office"]').type('Analista de QA')
      cy.get('[data-testid="button-salvar"]').click()
      cy.contains('.swal2-popup', 'Usuário atualizado com sucesso').find('.swal2-confirm').click()
      abrirEdicao(u.email)
      cy.get('[data-testid="input-name"]').should('have.value', `${u.nome} Editado`)
      cy.get('[data-testid="input-office"]').should('have.value', 'Analista de QA')

      // alteração de senha pelo menu de ações
      cy.visit('/app/admin/usuarios/listagem')
      cy.buscar(u.email)
      cy.acaoDoUsuario(u.email, 'menuAction-changePasswordEvent')
      cy.get('[data-testid="input-password"]').type('Nova@12345')
      cy.contains('mat-dialog-container button', 'Alterar').click()
      cy.contains('mat-dialog-container, .swal2-popup', /sucesso/i).should('be.visible')

      // permissão: liga o perfil Analista (com confirmação) e confere depois de reabrir
      abrirAbaPermissao(u.email)
      togglePerfil('Analista').should('not.be.checked').click({ force: true })
      cy.contains('.swal2-popup', 'Ativar permissão?').find('.swal2-confirm').click()
      cy.contains('Permissão ativada com sucesso').should('be.visible')
      abrirAbaPermissao(u.email)
      togglePerfil('Analista').should('be.checked')

      // permissão: desliga o perfil Analista e confere depois de reabrir
      togglePerfil('Analista').click({ force: true })
      cy.contains('.swal2-popup', 'Inativar permissão?').find('.swal2-confirm').click()
      abrirAbaPermissao(u.email)
      togglePerfil('Analista').should('not.be.checked')

      // desativação: volta a ficar inativo e aparece no filtro Inativos
      cy.visit('/app/admin/usuarios/listagem')
      cy.buscar(u.email)
      cy.alternarStatus(u.email, 'sucesso')
      cy.contains(/Ativos\s*0/).should('be.visible')
      cy.contains(/Inativos\s*1/).click()
      cy.contains('tr', u.email).should('be.visible')
    })
  })
})
