// A tela de login às vezes abre um diálogo de erro vazio (app-flash-message) por cima do formulário; force ignora o bloqueio
Cypress.Commands.add('login', () => {
  cy.env(['usuario', 'senha'], { log: false }).then((env) => {
    cy.visit('/login/entrar')
    cy.get('[data-testid="loginInput"]').type(env.usuario, { force: true })
    cy.get('input[type="password"]').type(env.senha, { log: false, force: true })
    cy.contains('button', 'ENTRAR').click({ force: true })
  })
})

// Loga e abre a listagem de usuários (ponto de partida de todos os testes)
Cypress.Commands.add('abrirListagem', () => {
  cy.login()
  cy.url().should('include', '/app/home')
  cy.visit('/app/admin/usuarios/listagem')
  cy.get('button[aria-label="Adicionar usuário"]').should('be.visible')
})

// Preenche o formulário de novo usuário (a senha por último: o painel de força dela cobre outros campos)
Cypress.Commands.add('preencherUsuario', (u) => {
  cy.get('button[aria-label="Adicionar usuário"]').click()
  cy.get('[data-testid="input-name"]').type(u.nome)
  cy.get('[data-testid="input-email"]').type(u.email)
  cy.get('[data-testid="input-cpf"]').type(u.cpf)
  cy.get('#password-password').type(u.senha).blur()
})

// Cria o usuário e volta para a listagem já filtrada por ele
Cypress.Commands.add('criarUsuario', (u) => {
  cy.preencherUsuario(u)
  cy.get('[data-testid="button-salvar"]').click()
  cy.contains('.swal2-popup', 'Usuário criado com sucesso').find('.swal2-confirm').click()
  cy.visit('/app/admin/usuarios/listagem')
  cy.buscar(u.email)
})

// A tabela recarrega sozinha durante a busca e pode derrubar a ação seguinte.
// Cada GET /api/users é um recarregamento; esperamos 1s sem nenhum antes de continuar.
Cypress.Commands.add('buscar', (texto) => {
  let ultima = Date.now()
  cy.intercept('GET', '**/api/users?*', () => { ultima = Date.now() }) // marca cada recarga da listagem
  cy.intercept({ method: 'GET', url: '**/api/users?*', query: { searchBy: texto } }).as('busca') // espera a busca deste termo
  cy.get('input[placeholder="Pesquisar"]').clear().type(texto).blur()
  cy.wait('@busca')
  cy.wrap(null, { log: false }).should(() => expect(Date.now() - ultima, 'ms sem novas buscas').to.be.greaterThan(1000))
  cy.contains('tr', texto).should('be.visible')
})

// Clica no toggle de status da linha, fecha o diálogo de sucesso e reabre a listagem filtrada
// (a tabela se redesenha logo depois do toggle e fecharia um menu de ações aberto em seguida)
Cypress.Commands.add('alternarStatus', (email, mensagem) => {
  cy.contains('tr', email).find('input[type=checkbox]').click({ force: true })
  cy.contains('mat-dialog-container', mensagem).contains('button', 'OK').click()
  cy.visit('/app/admin/usuarios/listagem')
  cy.buscar(email)
})

// Abre o menu de ações da linha, lidando com o redesenho da tabela que pode fechá-lo
Cypress.Commands.add('acaoDoUsuario', (email, acao) => {
  let ultima = Date.now()
  cy.intercept('GET', '**/api/users?*', () => { ultima = Date.now() }) // marca cada recarga da listagem
  cy.contains('tr', email).find('button').last().click()
  cy.wrap(null, { log: false }).should(() => expect(Date.now() - ultima, 'ms sem novas buscas').to.be.greaterThan(1000))
  cy.get('body').then(($body) => {
    if (!$body.find(`[data-tour-disabled="${acao}"]:visible`).length) cy.contains('tr', email).find('button').last().click()
  })
  cy.get(`[data-tour-disabled="${acao}"]`).click()
})

// Usuário com dados únicos por execução
Cypress.Commands.add('novoUsuario', () => {
  const id = Date.now()
  const n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))
  const digito = (base) => (base.reduce((s, d, i) => s + d * (base.length + 1 - i), 0) * 10) % 11 % 10
  n.push(digito(n))
  n.push(digito(n))
  return cy.wrap({ nome: `QA Teste ${id}`, email: `qa.${id}@teste.com`, cpf: n.join(''), senha: 'Senha@12345' })
})

// Pré-requisito comum a todos os specs: logar e abrir a listagem de usuários
beforeEach(() => cy.abrirListagem())
