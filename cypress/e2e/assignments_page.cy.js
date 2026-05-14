describe("Assignments Page", () => {
	Cypress.on("uncaught:exception", (err) => {
		if (String(err?.message || "").includes("get_batch_students TypeError")) {
			return false;
		}
	});

	beforeEach(() => {
		cy.login("Administrator", "admin");
	});

	it("should display the Assignments listing page", () => {
		cy.visit("/lms/assignments");
		cy.closeOnboardingModal();

		cy.url().should("include", "/lms/assignments");
	});

	it("should display the Assignment Submissions listing page", () => {
		cy.visit("/lms/assignment-submissions");
		cy.closeOnboardingModal();

		cy.url().should("include", "/lms/assignment-submissions");
	});
});
