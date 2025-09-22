describe('Admin Role Management Functional Tests', () => {
  const adminEmail = 'admin@gmail.com';
  const adminPassword = 'Admin1Admin1';

  const roleData = {
    roleType: 'Test Role',
    originalRoleType: 'Test Role',    
    updatedRoleType: 'Updated Test Role',
  };

  beforeEach(() => {
    cy.visit('http://localhost:3000/login');

    cy.get('input[name="username"]').type(adminEmail);
    cy.get('input[name="password"]').type(adminPassword);
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/admin');
  });

  it('Should navigate to Role Management page', () => {
    cy.visit('http://localhost:3000/admin/roles');
    cy.contains('Role Management').should('be.visible');
  });

  it('Should add a new role', () => {
    cy.visit('http://localhost:3000/admin/roles');

    cy.get('button').contains('Add New Role').click();
    cy.get('.addRole-input').type(roleData.roleType);
    cy.get('button').contains('Add Role').click();

    cy.contains('Role added successfully', { timeout: 5000 });
  });

  it('Should search for the newly added role', () => {
    cy.visit('http://localhost:3000/admin/roles');

    cy.get('input[placeholder="Search roles..."]').clear().type(roleData.roleType);
    
  });

  it('Should display error when adding a duplicate role type', () => {
  cy.visit('http://localhost:3000/admin/roles');

  cy.get('button').contains('Add New Role').click();
  cy.get('.addRole-input').type(roleData.roleType);
  cy.get('button').contains('Add Role').click();

  cy.contains('Error creating role').should('be.visible'); 
});


  after(() => {
    cy.visit('http://localhost:3000/admin/roles');
    cy.get('input[placeholder="Search roles..."]').clear().type(roleData.roleType);
    
  });
  
});
