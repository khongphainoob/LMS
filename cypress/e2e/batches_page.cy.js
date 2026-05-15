describe("Batches Page", () => {
	Cypress.on("uncaught:exception", (err) => {
		if (String(err?.message || "").includes("get_batch_students TypeError")) {
			return false;
		}
	});

	beforeEach(() => {
		cy.login("Administrator", "admin");
	});

	it("should display the Batches listing page", () => {
		cy.visit("/lms/batches");
		cy.closeOnboardingModal();

		cy.url().should("include", "/lms/batches");
		cy.get("button").contains("Create").should("be.visible");
	});

	it("should open batch creation dialog", () => {
		cy.visit("/lms/batches");
		cy.closeOnboardingModal();

		cy.get("button").contains("Create").click();
		cy.get("span").contains("New Batch").should("be.visible");

		// Batch form fields
		cy.get("label").contains("Title").should("be.visible");
		cy.get("label").contains("Start Date").should("be.visible");
		cy.get("label").contains("End Date").should("be.visible");
		cy.get("label").contains("Start Time").should("be.visible");
		cy.get("label").contains("End Time").should("be.visible");
		cy.get("label").contains("Timezone").should("be.visible");
		cy.get("label").contains("Seat Count").should("be.visible");
	});
});
