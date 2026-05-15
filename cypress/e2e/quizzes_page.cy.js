describe("Quiz & Quiz Submission Pages", () => {
	Cypress.on("uncaught:exception", (err) => {
		if (String(err?.message || "").includes("get_batch_students TypeError")) {
			return false;
		}
	});

	beforeEach(() => {
		cy.login("Administrator", "admin");
	});

	it("should display the Quizzes listing page", () => {
		cy.visit("/lms/quizzes");
		cy.closeOnboardingModal();

		cy.url().should("include", "/lms/quizzes");
	});
});
