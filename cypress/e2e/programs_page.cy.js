describe("Programs Page", () => {
	Cypress.on("uncaught:exception", (err) => {
		if (String(err?.message || "").includes("get_batch_students TypeError")) {
			return false;
		}
	});

	beforeEach(() => {
		cy.login("Administrator", "admin");
	});

	it("should display the Programs listing page", () => {
		cy.visit("/lms/programs");
		cy.closeOnboardingModal();

		cy.url().should("include", "/lms/programs");
	});
});
