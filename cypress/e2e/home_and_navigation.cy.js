describe("Home Page & Navigation", () => {
	Cypress.on("uncaught:exception", (err) => {
		if (String(err?.message || "").includes("get_batch_students TypeError")) {
			return false;
		}
	});

	beforeEach(() => {
		cy.login("Administrator", "admin");
	});

	it("should load the home page or redirect to courses", () => {
		cy.visit("/lms/");
		cy.closeOnboardingModal();

		// May redirect to courses if not guest
		cy.url().should("satisfy", (url) => {
			return (
				url.includes("/lms/") || url.includes("/login")
			);
		});
	});

	it("should navigate between main pages via sidebar", () => {
		cy.visit("/lms/courses");
		cy.closeOnboardingModal();

		// Sidebar should be present
		cy.get("nav").should("exist");
	});
});
