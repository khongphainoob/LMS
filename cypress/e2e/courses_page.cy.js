describe("Courses Page", () => {
	Cypress.on("uncaught:exception", (err) => {
		if (String(err?.message || "").includes("get_batch_students TypeError")) {
			return false;
		}
	});

	beforeEach(() => {
		cy.login("Administrator", "admin");
	});

	it("should display the Courses listing page", () => {
		cy.visit("/lms/courses");
		cy.closeOnboardingModal();

		// Page should load
		cy.url().should("include", "/lms/courses");

		// Create button
		cy.get("button").contains("Create").should("be.visible");
	});

	it("should open course creation dialog", () => {
		cy.visit("/lms/courses");
		cy.closeOnboardingModal();

		cy.get("button").contains("Create").click();
		cy.get("span").contains("New Course").should("be.visible");

		// Course creation form fields
		cy.get("label").contains("Title").should("be.visible");
		cy.get("label").contains("Short Introduction").should("be.visible");
	});
});
