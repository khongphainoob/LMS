describe("AI Grading Admin Dashboard", () => {
	Cypress.on("uncaught:exception", (err) => {
		if (String(err?.message || "").includes("get_batch_students TypeError")) {
			return false;
		}
	});

	beforeEach(() => {
		cy.login("Administrator", "admin");
	});

	it("should display the Admin dashboard with analytics and feedback table", () => {
		cy.visit("/lms/ai-grading/admin");
		cy.closeOnboardingModal();

		// Page title
		cy.contains("AI Grading Dashboard").should("be.visible");
		cy.contains("Monitor AI performance and review teacher feedback").should("be.visible");

		// Analytics Button
		cy.contains("AI Analytics").should("be.visible");

		// Summary stats row (4 cards)
		cy.contains("Graded Today").should("be.visible");
		cy.contains("Satisfaction Rate").should("be.visible");
		cy.contains("Review Flags").should("be.visible");
		cy.contains("Open Sessions").should("be.visible");

		// Extra stats row (3 cards)
		cy.contains("Total Sessions").should("be.visible");
		cy.contains("Total Submissions").should("be.visible");
		cy.contains("Dissatisfied").should("be.visible");

		// Feedback table section
		cy.contains("Feedback").should("be.visible");
	});
});
