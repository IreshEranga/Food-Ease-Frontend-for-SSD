describe('Login Functionality Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login'); 
  });

  it('should login successfully with valid credentials', () => {
    cy.get('#loginEmail').type('sh@gmail.com'); 
    cy.get('#loginPassword').type('Sachin'); 
    cy.get('.Login-signin-btn').click(); 
    cy.url().should('include', 'http://localhost:3000/customer'); 
    cy.get('h2').should('contain', 'Good');
    cy.screenshot('login-success'); 
  });

  it('should show error message for invalid credentials', () => {
    cy.get('#loginEmail').type('wronguser@gmail.com');
    cy.get('#loginPassword').type('wrongpass');
    cy.get('.Login-signin-btn').click();
    cy.get('.login-error-message').should('contain', 'Invalid email or password'); 
    cy.screenshot('login-failure');
  });
});