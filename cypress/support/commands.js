// Add custom commands here if needed
Cypress.Commands.add('login', (email, password) => {
  cy.get('input[name="username"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('.Login-signin-btn').click();
});