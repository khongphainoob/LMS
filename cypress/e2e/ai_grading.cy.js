describe('AI Grading Service E2E Flow', () => {
  beforeEach(() => {
    // Standard cleanup or prep can go here
  });

  it('should execute complete Teacher Grading and Student Feedback flow', () => {
    // ----------------------------------------------------
    // 1. TEACHER FLOW: Setup Session & Grade Paper
    // ----------------------------------------------------
    cy.visit('/login');
    cy.get('input[name="usr"]').type('teacher@school.edu');
    cy.get('input[name="pwd"]').type('teacher123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/app');

    // Go to AI Grading Sessions
    cy.visit('/app/ai-grading-session');
    cy.get('.list-row-container').should('exist');
    cy.get('button.primary-action').contains('New').click();

    // Fill in Session Details
    cy.get('input[data-fieldname="session_name"]').type('Final Exam Grade 10 - Mathematics');
    cy.get('select[data-fieldname="grading_type"]').select('Exam');
    cy.get('input[data-fieldname="course"]').type('Mathematics Grade 10').type('{enter}');
    cy.get('input[data-fieldname="batch"]').type('2026-MATH-A').type('{enter}');
    cy.get('input[data-fieldname="rubric"]').type('Algebra Rubric').type('{enter}');
    
    // Save Session
    cy.get('button.primary-action').contains('Save').click();
    cy.get('.indicator').contains('Saved').should('be.visible');

    // Create a new Student Submission
    cy.visit('/app/ai-grading-submission');
    cy.get('button.primary-action').contains('New').click();
    cy.get('input[data-fieldname="session"]').type('Final Exam Grade 10 - Mathematics').type('{enter}');
    cy.get('input[data-fieldname="student"]').type('student1@school.edu').type('{enter}');
    
    // Upload student paper image
    cy.fixture('student_paper.png', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then(fileContent => {
        cy.get('input[type="file"]').attachFile({
          fileContent,
          fileName: 'student_paper.png',
          mimeType: 'image/png'
        });
      });

    cy.get('button.primary-action').contains('Save').click();

    // Trigger AI Grading
    cy.get('button').contains('Start AI Grading').click();

    // Verify background analysis triggers real-time progress updates
    cy.get('.ai-progress-spinner').should('be.visible');
    cy.get('.ai-status-message').should('contain', 'Analyzing');

    // Wait for completion (simulated)
    cy.get('.ai-status-badge', { timeout: 15000 }).should('contain', 'Done');
    cy.get('input[data-fieldname="score"]').should('not.have.value', '0');

    // Check estimated cost and token metadata
    cy.get('input[data-fieldname="input_tokens"]').invoke('val').then(parseInt).should('be.gt', 0);
    cy.get('input[data-fieldname="output_tokens"]').invoke('val').then(parseInt).should('be.gt', 0);
    cy.get('input[data-fieldname="estimated_cost_usd"]').invoke('val').then(parseFloat).should('be.gt', 0.0);

    // Teacher Review & Override
    cy.get('.ai-feedback-container').should('contain', 'Algebraic simplification');
    cy.get('input[data-fieldname="teacher_override_score"]').type('9.5');
    cy.get('textarea[data-fieldname="teacher_feedback"]').type('Excellent logical reasoning, minor writing error corrected.');
    cy.get('button.primary-action').contains('Save').click();

    // Log out Teacher
    cy.visit('/app');
    cy.get('.navbar-user-avatar').click();
    cy.get('.navbar-user-dropdown').contains('Log out').click();

    // ----------------------------------------------------
    // 2. STUDENT FLOW: View Score, Review & Rate AI
    // ----------------------------------------------------
    cy.visit('/login');
    cy.get('input[name="usr"]').type('student1@school.edu');
    cy.get('input[name="pwd"]').type('student123');
    cy.get('button[type="submit"]').click();

    // Visit personal grade page
    cy.visit('/courses/mathematics-grade-10/grades');
    cy.get('.grade-score-card').should('contain', '9.5'); // Teacher overridden score
    
    // View detailed rubric criterion breakdown
    cy.get('.rubric-breakdown-table').should('be.visible');
    cy.get('.rubric-breakdown-row').should('have.length.at.least', 2);
    cy.get('.rubric-breakdown-row').eq(0).should('contain', 'Logic & Accuracy');

    // Rate AI satisfaction
    cy.get('.ai-rating-star').eq(4).click(); // Click 5th star
    cy.get('.ai-rating-status').should('contain', 'Thank you for your feedback');
  });
});
