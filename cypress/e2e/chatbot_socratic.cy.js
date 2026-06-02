describe('AI Chatbot and Socratic Tutor E2E Flow', () => {
  beforeEach(() => {
    // Log in student
    cy.visit('/login');
    cy.get('input[name="usr"]').type('student1@school.edu');
    cy.get('input[name="pwd"]').type('student123');
    cy.get('button[type="submit"]').click();
  });

  it('should support general course chatbot interactions and quick quiz requests', () => {
    cy.visit('/courses/mathematics-grade-10/lesson/quadratic-equations');
    cy.get('.chatbot-toggle-button').click(); // Open Chatbot sidebar
    cy.get('.chatbot-input-field').type('Làm sao giải phương trình bậc 2?').type('{enter}');

    // Verify loading indicator
    cy.get('.chatbot-thinking-indicator').should('be.visible');

    // Verify response
    cy.get('.chatbot-message-bubble.assistant', { timeout: 10000 }).should('be.visible');
    cy.get('.chatbot-message-bubble.assistant').eq(0).should('contain', 'Delta');

    // Quick quiz generation via chat
    cy.get('.chatbot-input-field').type('Tạo cho mình 1 câu hỏi trắc nghiệm nhanh đi').type('{enter}');
    cy.get('.chatbot-quiz-container', { timeout: 10000 }).should('be.visible');
    cy.get('.chatbot-quiz-option').should('have.length', 4);
    cy.get('.chatbot-quiz-option').eq(1).click();
    cy.get('.chatbot-quiz-feedback').should('be.visible');
  });

  it('should execute Socratic Tutor adaptive scaffolding prompt levels', () => {
    cy.visit('/courses/mathematics-grade-10/lesson/quadratic-equations');
    cy.get('.chatbot-socratic-mode-btn').click(); // Toggle Socratic Tutor Mode

    // Level 0: Clarifying Probe
    cy.get('.chatbot-input-field').type('Delta là gì thế?').type('{enter}');
    cy.get('.chatbot-message-bubble.assistant', { timeout: 10000 }).should('be.visible');
    // Socratic tutor should not give direct answer, it asks a clarifying question
    cy.get('.chatbot-message-bubble.assistant').last().should('contain', '?'); 
    cy.get('.chatbot-message-bubble.assistant').last().should('not.contain', 'Delta = b^2 - 4ac');

    // Level 1: Guiding Hint
    cy.get('.chatbot-input-field').type('Mình chưa nhớ công thức của nó.').type('{enter}');
    cy.get('.chatbot-message-bubble.assistant', { timeout: 10000 }).should('be.visible');
    // AI gives a small hint/analogy, still doesn't give answer
    cy.get('.chatbot-message-bubble.assistant').last().should('contain', 'biệt thức'); 

    // Level 2: Step-by-step breakdown
    cy.get('.chatbot-input-field').type('Vẫn khó quá, giúp mình chia bước đi.').type('{enter}');
    cy.get('.chatbot-message-bubble.assistant', { timeout: 10000 }).should('be.visible');
    cy.get('.chatbot-message-bubble.assistant').last().should('contain', 'Bước 1');

    // Level 4: Clear step-by-step explanation (fallback when student struggles)
    cy.get('.chatbot-input-field').type('Mình chịu rồi, hãy giải thích hẳn đi!').type('{enter}');
    cy.get('.chatbot-message-bubble.assistant', { timeout: 10000 }).should('be.visible');
    cy.get('.chatbot-message-bubble.assistant').last().should('contain', 'b^2 - 4ac');
  });

  it('should persist chat history using Redis session cache across refreshes', () => {
    cy.visit('/courses/mathematics-grade-10/lesson/quadratic-equations');
    cy.get('.chatbot-toggle-button').click();
    cy.get('.chatbot-input-field').type('Xin chào, ghi nhớ đoạn chat nhé!').type('{enter}');
    cy.get('.chatbot-message-bubble.assistant', { timeout: 10000 }).should('be.visible');

    // Refresh page to trigger Redis/DB restoration
    cy.reload();
    cy.get('.chatbot-toggle-button').click();
    
    // Check history is restored
    cy.get('.chatbot-message-bubble.user').should('contain', 'Xin chào, ghi nhớ đoạn chat nhé!');
    cy.get('.chatbot-message-bubble.assistant').should('exist');
  });
});
