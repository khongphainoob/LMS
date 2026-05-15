describe("AI Grading Essay Home", () => {
	Cypress.on("uncaught:exception", (err) => {
		if (String(err?.message || "").includes("get_batch_students TypeError")) {
			return false;
		}
	});

	beforeEach(() => {
		cy.login("Administrator", "admin");
	});

	it("should display the Smart Essay Grading page with hero, stats, and action cards", () => {
		cy.visit("/lms/ai-grading/essay");
		cy.closeOnboardingModal();

		// Hero section
		cy.contains("Smart Essay Grading").should("be.visible");
		cy.contains("Select the type of work to grade").should("be.visible");

		// Stats row
		cy.get("section").within(() => {
			// Stats cards: Graded today, Need review, Open sessions
			cy.contains("Graded today").should("be.visible");
			cy.contains("Need review").should("be.visible");
			cy.contains("Open sessions").should("be.visible");
		});

		// 3 Action cards
		cy.contains("Session-based").should("be.visible");
		cy.contains("Rubric Builder").should("be.visible");
		cy.contains("Assignment Grading").should("be.visible");
	});

	it("should navigate to session config when clicking Session-based card", () => {
		cy.visit("/lms/ai-grading/essay");
		cy.closeOnboardingModal();

		cy.contains("Start Session Grading").click();
		cy.url().should("include", "/lms/ai-grading/essay/config/exam");
	});

	it("should navigate to rubric builder when clicking Rubric Builder card", () => {
		cy.visit("/lms/ai-grading/essay");
		cy.closeOnboardingModal();

		cy.contains("Open Rubric Builder").click();
		cy.url().should("include", "/lms/ai-grading/rubric-builder");
	});

	it("should navigate to assignment config when clicking Assignment Grading card", () => {
		cy.visit("/lms/ai-grading/essay");
		cy.closeOnboardingModal();

		cy.contains("Start Assignment Grading").click();
		cy.url().should("include", "/lms/ai-grading/essay/config/hw");
	});
});
