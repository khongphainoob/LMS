describe('AI Quiz and Exam Creator E2E Flow', () => {
  it('should generate quiz from document and support student online testing', () => {
    // ----------------------------------------------------
    // 1. TEACHER FLOW: Generate Quiz & Publish
    // ----------------------------------------------------
    cy.visit('/login');
    cy.get('input[name="usr"]').type('teacher@school.edu');
    cy.get('input[name="pwd"]').type('teacher123');
    cy.get('button[type="submit"]').click();

    // Navigate to AI Quizzes
    cy.visit('/app/ai-quiz');
    cy.get('button.primary-action').contains('New').click();

    // Fill in config
    cy.get('input[data-fieldname="title"]').type('Lịch sử Cách mạng Công nghiệp');
    cy.get('select[data-fieldname="bloom_level"]').select('Remember/Understand');
    cy.get('select[data-fieldname="language"]').select('vi');

    // Attach reference document
    cy.fixture('industrial_revolution.pdf', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then(fileContent => {
        cy.get('input[type="file"]').attachFile({
          fileContent,
          fileName: 'industrial_revolution.pdf',
          mimeType: 'application/pdf'
        });
      });

    // Save and generate
    cy.get('button.primary-action').contains('Save').click();
    cy.get('button').contains('Generate Questions').click();

    // Verify background generation job indicators
    cy.get('.quiz-generating-indicator').should('be.visible');
    cy.get('.quiz-status-msg').should('contain', 'generating');

    // Verify success completion
    cy.get('.quiz-status-badge', { timeout: 15000 }).should('contain', 'Completed');
    cy.get('.quiz-question-row').should('have.length.at.least', 5);

    // Verify generated question structure (MCQ, options, explanation)
    cy.get('.quiz-question-row').eq(0).within(() => {
      cy.get('.question-text').should('not.be.empty');
      cy.get('.option-text').should('have.length', 4);
      cy.get('.explanation-text').should('be.visible');
    });

    // Log out Teacher
    cy.visit('/app');
    cy.get('.navbar-user-avatar').click();
    cy.get('.navbar-user-dropdown').contains('Log out').click();

    // ----------------------------------------------------
    // 2. STUDENT FLOW: Take Quiz & View Explanations
    // ----------------------------------------------------
    cy.visit('/login');
    cy.get('input[name="usr"]').type('student1@school.edu');
    cy.get('input[name="pwd"]').type('student123');
    cy.get('button[type="submit"]').click();

    // Go to quiz page
    cy.visit('/quiz/lich-su-cach-mang-cong-nghiep');
    cy.get('.quiz-title').should('contain', 'Lịch sử Cách mạng Công nghiệp');

    // Answer questions
    cy.get('.quiz-question-container').should('have.length.at.least', 3);
    cy.get('.quiz-question-container').eq(0).within(() => {
      cy.get('.option-radio-input').eq(0).click(); // Click Option A
    });
    cy.get('.quiz-question-container').eq(1).within(() => {
      cy.get('.option-radio-input').eq(2).click(); // Click Option C
    });

    // Submit Quiz
    cy.get('button').contains('Submit Quiz').click();

    // Verify instant score and answers explanation
    cy.get('.quiz-results-banner').should('be.visible');
    cy.get('.quiz-score').should('exist');
    cy.get('.question-explanation').should('be.visible').and('not.be.empty');
  });
});
