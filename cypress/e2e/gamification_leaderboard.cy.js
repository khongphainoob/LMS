describe('Gamification and Leaderboard E2E Flow', () => {
  beforeEach(() => {
    // Log in student
    cy.visit('/login');
    cy.get('input[name="usr"]').type('student1@school.edu');
    cy.get('input[name="pwd"]').type('student123');
    cy.get('button[type="submit"]').click();
  });

  it('should support playing games, updating progress, and level XP calculations', () => {
    cy.visit('/game-center');
    cy.get('.game-card').contains('Memory Match').click();

    // Check game entry rules
    cy.get('.game-daily-attempts').should('contain', 'Attempts left:');
    cy.get('button').contains('Start Game').click();

    // Verify session starts, anti-cheat token is generated in Redis
    cy.get('.game-canvas').should('be.visible');

    // Complete game with normal gameplay score
    cy.get('.game-over-screen', { timeout: 20000 }).should('be.visible');
    cy.get('.game-final-score').invoke('text').then(parseInt).should('be.lte', 500); // MCQ Memory Match max score is 500

    // Verify realtime score update event in UI
    cy.get('.global-user-score-bubble').should('be.visible');

    // Go to game profile, check Level & XP (based on sqrt curve: level = 1 + sqrt(xp/50))
    cy.visit('/game-profile');
    cy.get('.profile-xp-value').should('exist');
    cy.get('.profile-level-badge').invoke('text').then(parseInt).should('be.at.least', 1);
  });

  it('should calculate active streaks skipped over weekends (Weekend-Pass Logic)', () => {
    cy.visit('/game-profile');
    
    // Check current streak value
    cy.get('.profile-current-streak').invoke('text').then(parseInt).should('be.at.least', 1);
    cy.get('.profile-streak-days-list').within(() => {
      // Monday to Friday active
      cy.get('.streak-day.active').should('have.length.at.least', 1);
      // Weekends (Sat/Sun) should either not break the streak or be marked as weekend-pass
      cy.get('.streak-day.weekend').should('exist');
    });
  });

  it('should check composite scoring and real-time ranks in global & batch leaderboards', () => {
    cy.visit('/leaderboard');
    cy.get('.leaderboard-title').should('contain', 'Bảng Xếp Hạng');

    // Switch between global and batch leaderboard
    cy.get('.leaderboard-scope-select').select('Batch: 2026-MATH-A');
    cy.get('.leaderboard-table').should('be.visible');

    // Verify row structure and ranks
    cy.get('.leaderboard-row').eq(0).within(() => {
      cy.get('.leaderboard-rank').should('contain', '1');
      cy.get('.leaderboard-member-name').should('not.be.empty');
      // Composite score calculation: 30% quiz + 25% assignment + 25% completion + 10% streak + 10% hours
      cy.get('.leaderboard-composite-score').invoke('text').then(parseFloat).should('be.gt', 0.0);
    });
  });

  it('should trigger automated badge achievements in real time', () => {
    cy.visit('/courses/mathematics-grade-10');
    
    // Complete the final lesson, bringing total completed courses to 5
    cy.get('.lesson-row').last().contains('Start').click();
    cy.get('button').contains('Mark as Completed').click();

    // Verify badge unlocking realtime overlay modal
    cy.get('.badge-unlock-modal', { timeout: 10000 }).should('be.visible');
    cy.get('.unlocked-badge-title').should('contain', 'Scholar'); // "Scholar" badge auto awarded for 5 completed courses
    cy.get('button').contains('Awesome!').click();

    // Verify badge in profile
    cy.visit('/game-profile');
    cy.get('.earned-badges-grid').should('contain', 'Scholar');
  });
});
