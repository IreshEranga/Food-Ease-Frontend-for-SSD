describe('Login Component', () => {
  beforeEach(() => {
    
    cy.visit('http://localhost:3000/login');
  });

  it('should display the login form with all elements', () => {
    // Check if the title "TastiGo" is visible
    cy.get('.Login-title').should('be.visible').and('contain', 'TastiGo');

    // Check subtitle is visible
    cy.get('.Login-subtitle').should('be.visible').and('contain', "Welcome back, you've been missed!");

    // Check email input is visible and has the correct placeholder
    cy.get('input[name="username"]').should('be.visible').and('have.attr', 'placeholder', 'Enter email');

    // Check password input is visible and has the correct placeholder
    cy.get('input[name="password"]').should('be.visible').and('have.attr', 'placeholder', 'Password');

    // Check password toggle button is visible
    cy.get('.login-password-toggle').should('be.visible');

    // Check "Recover Password" link is visible
    cy.get('.Login-recover-link').should('be.visible').and('contain', 'Recover Password');

    // Check "Sign In" button is visible
    cy.get('.Login-signin-btn').should('be.visible').and('contain', 'Sign In');

    // Check social login buttons are visible
    cy.get('.Login-social-buttons').should('be.visible');
    cy.get('.Login-social-btn').should('have.length', 3);
  });

  it('should toggle password visibility', () => {
    // Enter a password
    cy.get('input[name="password"]').type('mypassword');

    // Check initial state (password hidden)
    cy.get('input[name="password"]').should('have.attr', 'type', 'password');

    // Click the toggle button
    cy.get('.login-password-toggle').click();

    // Check if password is visible
    cy.get('input[name="password"]').should('have.attr', 'type', 'text');

    // Click the toggle button again
    cy.get('.login-password-toggle').click();

    // Check if password is hidden again
    cy.get('input[name="password"]').should('have.attr', 'type', 'password');
  });

  it('should show validation errors for empty fields on submit', () => {
    // Submit the form without filling in any fields
    cy.get('.Login-signin-btn').click();

    // Check for validation errors
    cy.get('.login-error-message').should('have.length', 2);
    cy.get('.login-error-message').eq(1).should('contain', 'Password is required');
  });

  it('should show invalid email format error', () => {
    // Enter an invalid email
    cy.get('input[name="username"]').type('invalid-email');
    cy.get('input[name="password"]').type('mypassword');

    // Submit the form
    cy.get('.Login-signin-btn').click();

    // Check for email format error
    cy.get('.login-error-message').should('contain', 'Invalid email format');
  });

  it('should submit the form successfully with valid inputs', () => {
    // Mock the API response
    cy.intercept('POST', '**/api/users/auth/login', {
      statusCode: 200,
      body: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiIxMjM0NTYiLCJyb2xlSUQiOiJyb2xlMyIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      },
    }).as('loginRequest');

    // Use custom command to login
    cy.login('test@example.com', 'mypassword');

    // Wait for the API call and verify redirection (mocked for role3 - customer)
    cy.wait('@loginRequest');
    cy.url().should('include', '/customer');
  });

  it('should display API error on login failure', () => {
    // Mock a failed API response
    cy.intercept('POST', '**/api/users/auth/login', {
      statusCode: 401,
      body: {
        message: 'Invalid credentials',
      },
    }).as('loginRequest');

    // Use custom command to login
    cy.login('test@example.com', 'wrongpassword');

    // Wait for the API call and check for error message
    cy.wait('@loginRequest');
    cy.get('.login-error-message').should('contain', 'Invalid credentials');
  });

  it('should navigate to signup page when clicking "Register now"', () => {
    // Click the "Register now" link
    cy.get('.Login-register-link a').click();

    // Verify navigation to the signup page
    cy.url().should('include', '/signup');
  });
});