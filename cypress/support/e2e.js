// Import commands.js to include custom commands
import './commands';

// Optionally, add global before/after hooks
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions (common in React apps)
  return false;
});